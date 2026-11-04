import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, PlusCircle, Hash, X, Info, UserPlus, Trash2, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { io, Socket } from 'socket.io-client';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
    const url = (import.meta.env.VITE_API_URL as string)?.replace('/api/v1', '') ?? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'https://api.enakoos.com' : `https://api.${defaultHost}`);
    socket = io(url, { transports: ['websocket', 'polling'] });
  }
  return socket;
}

export default function Chat() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [openingPrivate, setOpeningPrivate] = useState(false);
  const privateOpenRequest = useRef(0);
  const messageRequest = useRef(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [privateRecipient, setPrivateRecipient] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState(params.get('channel') || 'general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Members panel state
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Create channel state
  const [showCreate, setShowCreate] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const isManagerOrCeo = user?.role === 'CEO' || user?.role === 'MANAGER';

  useEffect(() => {
    const channel = params.get('channel');
    if (channel) setActiveChannel(channel);
  }, [params]);
  useEffect(() => { api.privateChatContacts().then(setContacts).catch(() => {}); }, []);
  const startPrivate = async (recipientId = privateRecipient) => {
    if (!recipientId) return;
    const request = ++privateOpenRequest.current;
    setPrivateRecipient(recipientId); setOpeningPrivate(true);
    try {
      const channel = await api.startPrivateChat(recipientId);
      if (request !== privateOpenRequest.current) return;
      setChannels(previous => [...previous.filter(item => item.name !== channel.name), channel]);
      ++messageRequest.current;
      setMessages([]); setLoading(true);
      setActiveChannel(channel.name); setShowMembers(false);
      setParams({ channel: channel.name });
      if (channel.name === activeChannel) await loadMessages(channel.name);
    } catch (error: any) { toast.error(error.message || 'Could not open private chat'); }
    finally { if (request === privateOpenRequest.current) setOpeningPrivate(false); }
  };
  const channelLabel = (channel: any) => channel?.name?.startsWith('dm:')
    ? channel.members?.find((member: any) => member.userId !== user?.id)?.user?.fullName || 'Private conversation'
    : channel?.name || activeChannel;

  const loadChannels = useCallback(async () => {
    try {
      const res = await api.getChannels();
      setChannels(res);
      if (!activeChannel.startsWith('dm:') && !res.find((c: any) => c.name === activeChannel) && res.length > 0) {
        setActiveChannel(res[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeChannel]);

  useEffect(() => {
    loadChannels();
    const interval = setInterval(loadChannels, 15000);
    return () => clearInterval(interval);
  }, [loadChannels]);

  const loadMessages = useCallback(async (channel: string) => {
    const request = ++messageRequest.current;
    setLoading(true);
    try {
      const res = await api.messages(channel);
      if (request === messageRequest.current) setMessages(res);
    } catch (e: any) {
      console.error(e);
      if (request === messageRequest.current) setMessages([]);
    }
    finally { if (request === messageRequest.current) setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel);
      if (showMembers) {
        loadMembers();
      }
    }
  }, [activeChannel, loadMessages]);

  useEffect(() => {
    if (!activeChannel.startsWith('dm:')) return;
    let current = true;
    const interval = setInterval(async () => {
      try { const data = await api.messages(activeChannel); if (current) setMessages(data); } catch {}
    }, 5000);
    return () => { current = false; clearInterval(interval); };
  }, [activeChannel]);

  useEffect(() => {
    if (activeChannel.startsWith('dm:')) return;
    const sock = getSocket();
    sock.emit('channel:join', activeChannel);
    sock.on('message:created', (payload: any) => {
      if (payload.channel === activeChannel) {
        setMessages(prev => prev.some(message => message.id === payload.id) ? prev : [...prev, payload]);
      } else {
        setUnreadCounts(prev => ({
          ...prev,
          [payload.channel]: (prev[payload.channel] || 0) + 1
        }));
      }
    });
    return () => { sock.off('message:created'); sock.emit('channel:leave', activeChannel); };
  }, [activeChannel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMembers = async () => {
    try {
      const m = await api.getChannelMembers(activeChannel);
      setMembers(m);
    } catch (e: any) {
      console.error(e);
    }
  };

  const loadEmployees = async () => {
    try {
      const emps = await api.employees();
      setEmployees(emps);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showMembers && isManagerOrCeo && employees.length === 0) {
      loadEmployees();
    }
    if (showMembers) {
      loadMembers();
    }
  }, [showMembers, activeChannel]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    const content = message.trim();
    setMessage('');
    try {
      const sent = await api.sendMessage(activeChannel, content);
      setMessages(prev => {
        if (prev.find(m => m.id === sent.id)) return prev;
        return [...prev, { ...sent, sender: { fullName: user?.fullName, role: { name: user?.role } } }];
      });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      await api.createChannel(newChannelName.toLowerCase().trim());
      toast.success('Channel created');
      setNewChannelName('');
      setShowCreate(false);
      await loadChannels();
      setActiveChannel(newChannelName.toLowerCase().trim());
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.addChannelMember(activeChannel, selectedUserId);
      toast.success('Member added');
      setSelectedUserId('');
      loadMembers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeChannelMember(activeChannel, userId);
      toast.success('Member removed');
      loadMembers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const activeChannelData = channels.find(c => c.name === activeChannel);
  const isGeneral = activeChannelData?.isGeneral;
  const isPrivate = activeChannel.startsWith('dm:');

  return (
    <div className="h-[calc(100vh-10rem)] flex overflow-hidden border border-outline-variant/30 rounded-2xl shadow-sm bg-white relative">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-outline-variant/30 bg-surface-container-low h-full z-20">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-none tracking-tight">ENAKO OS</h1>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Workspace</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-4 scrollbar-hide pb-6">
          <div>
            <div className="mb-4 space-y-2 px-3">
              <label className="text-xs font-bold" htmlFor="private-recipient">Private chat</label>
              <select id="private-recipient" className="w-full rounded border p-2 text-xs" value={privateRecipient} onChange={event => { setPrivateRecipient(event.target.value); void startPrivate(event.target.value); }}>
                <option value="">Choose an employee</option>
                {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.fullName}</option>)}
              </select>
              <button disabled={!privateRecipient || openingPrivate} onClick={() => startPrivate()} className="text-xs font-semibold disabled:opacity-50">{openingPrivate ? 'Opening private conversation...' : 'Open private conversation'}</button>
              <div className="space-y-1 pt-2">
                {channels.filter(channel => channel.name.startsWith('dm:')).map(channel => (
                  <button key={channel.id} onClick={() => { setActiveChannel(channel.name); setShowMembers(false); }}
                    className={cn("flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs", activeChannel === channel.name && "bg-white font-bold shadow-sm")}>
                    <Lock className="h-4 w-4 shrink-0" /><span className="truncate">{channelLabel(channel)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Channels</h3>
              {isManagerOrCeo && (
                <button onClick={() => setShowCreate(!showCreate)} className="text-primary hover:opacity-80">
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {showCreate && (
              <form onSubmit={handleCreateChannel} className="px-3 mb-3">
                <input 
                  type="text" 
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  placeholder="channel-name"
                  className="w-full text-xs p-2 rounded-lg border border-outline-variant/30 focus:ring-1 outline-none focus:border-primary"
                  autoFocus
                />
              </form>
            )}

            <div className="space-y-1">
              {channels.filter(channel => !channel.name.startsWith('dm:')).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { 
                    setActiveChannel(ch.name); 
                    setShowMembers(false); 
                    setUnreadCounts(prev => ({ ...prev, [ch.name]: 0 }));
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-left',
                    activeChannel === ch.name ? 'bg-white shadow-sm text-primary font-bold' : 'text-secondary hover:bg-surface-container-high',
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Hash className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider truncate">{ch.name}</span>
                  </div>
                  {unreadCounts[ch.name] > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {unreadCounts[ch.name]}
                    </span>
                  )}
                </button>
              ))}
              {channels.length === 0 && (
                <p className="text-xs text-secondary px-3 py-2">No channels available</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold">{isPrivate ? 'Private: ' : '#'}{channelLabel(activeChannelData)}</h2>
          </div>
                <button
            disabled={isPrivate}
            onClick={() => setShowMembers(!showMembers)}
            className={cn("p-2 rounded-lg transition-colors", showMembers ? "bg-primary-container text-primary" : "hover:bg-surface-container-low text-secondary")}
          >
            <Info className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {loading ? (
            <p className="text-center text-sm text-secondary animate-pulse">Loading messages…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="w-12 h-12 text-outline-variant mx-auto mb-4 opacity-30" />
              <p className="text-secondary text-sm font-bold uppercase tracking-widest">No messages yet</p>
              <p className="text-xs text-outline mt-1">{isPrivate ? 'Only you and this employee can read this conversation.' : 'Be the first to send a message.'}</p>
            </div>
          ) : messages.map((m, idx) => {
            const name = m.sender?.fullName ?? 'Unknown';
            const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id ?? idx} className={cn('flex gap-4', isMe && 'flex-row-reverse')}>
                {m.sender?.avatarUrl ? (
                  <img src={m.sender.avatarUrl} alt="Avatar" className="size-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="size-10 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className={cn('max-w-[70%] space-y-1', isMe && 'items-end flex flex-col')}>
                  <div className={cn('flex items-baseline gap-2', isMe && 'flex-row-reverse')}>
                    <span className="font-bold text-sm text-primary">{name}</span>
                    <span className="text-[10px] font-mono text-secondary">
                      {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-container-low text-on-surface rounded-tl-sm',
                  )}>
                    {m.reportReferenceId && (
                      <Link to={`/app/reports?reportId=${encodeURIComponent(m.reportReferenceId)}`} className="mb-2 block rounded border border-current/20 p-2 text-xs underline">
                        Review of your submitted report: {m.reportReferenceTitle || m.reportReferenceId}
                      </Link>
                    )}
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-outline-variant/30">
          <form
            className="flex items-end gap-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all"
            onSubmit={handleSend}
          >
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none placeholder-outline outline-none min-h-[40px] max-h-[120px]"
              placeholder={isPrivate ? 'Write a private reply' : `Message #${activeChannel}`}
              rows={1}
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Members Sidebar */}
      {showMembers && (
        <aside className="w-72 border-l border-outline-variant/30 bg-surface-container-lowest h-full flex flex-col z-20">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
            <h3 className="font-bold text-sm">Channel Info</h3>
            <button onClick={() => setShowMembers(false)} className="text-secondary hover:text-primary"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">About</h4>
              <p className="text-sm text-primary">#{activeChannel}</p>
              {isGeneral && <p className="text-xs text-secondary mt-1">This is a general channel. Everyone has access.</p>}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Members ({members.length})</h4>
            </div>

            {isManagerOrCeo && !isGeneral && (
              <form onSubmit={handleAddMember} className="mb-4 flex gap-2">
                <select 
                  className="flex-1 text-xs p-2 border border-outline-variant/30 rounded-lg outline-none focus:border-primary"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select user...</option>
                  {employees.filter(e => !members.find(m => m.id === e.id)).map(e => (
                    <option key={e.id} value={e.id}>{e.fullName}</option>
                  ))}
                </select>
                <button type="submit" disabled={!selectedUserId} className="bg-primary text-white p-2 rounded-lg disabled:opacity-50 hover:opacity-90">
                  <UserPlus className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="Avatar" className="size-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="size-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {member.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{member.fullName}</p>
                      <p className="text-[10px] text-secondary uppercase">{member.role?.name}</p>
                    </div>
                  </div>
                  {isManagerOrCeo && !isGeneral && member.id !== user?.id && (
                <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
