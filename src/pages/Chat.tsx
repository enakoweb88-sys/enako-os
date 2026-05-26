import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  PlusCircle, 
  Smile, 
  Mic, 
  FileText, 
  Video, 
  Phone, 
  Info, 
  Hash, 
  Star,
  Download,
  Settings,
  X,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

const channels = ['operations', 'compliance', 'finance', 'management', 'announcements'];
const users: any[] = [];

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState('operations');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userName = localStorage.getItem('enako_user_name') || 'Executive';
  const role = localStorage.getItem('enako_user_role') || 'ceo';

  useEffect(() => {
    const stored = localStorage.getItem('enako_messages');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const initial = [
        { 
          channel: 'operations', 
          user: 'System', 
          content: 'Operative Node Alpha established connection.', 
          time: '08:00 AM', 
          initials: 'OS' 
        }
      ];
      setMessages(initial);
      localStorage.setItem('enako_messages', JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      channel: activeChannel,
      user: userName,
      content: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      initials: userName.split(' ').map(n => n[0]).join('')
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('enako_messages', JSON.stringify(updated));
    setMessage('');
  };

  const currentChannelMessages = messages.filter(m => m.channel === activeChannel);

  return (
    <div className="h-[calc(100vh-10rem)] flex overflow-hidden border border-outline-variant/30 rounded-2xl shadow-sm bg-white">
      {/* Sidebar Navigation */}
      <aside className="w-72 flex flex-col border-r border-outline-variant/30 bg-surface-container-low h-full">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-none tracking-tight">ENAKO OS</h1>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Workspace</p>
            </div>
          </div>
          <div className="relative group mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input className="w-full bg-surface-container-highest border-none rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="Jump to..." type="text"/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-hide">
          <nav className="space-y-1">
            {['Threads', 'Activity', 'Drafts'].map((item) => (
              <div key={item} className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors">
                <Hash className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{item}</span>
              </div>
            ))}
          </nav>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Channels</h3>
              <PlusCircle className="w-4 h-4 cursor-pointer hover:text-primary transition-colors text-secondary" />
            </div>
            <div className="space-y-1">
              {channels.map((ch) => (
                <div 
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
                    activeChannel === ch ? "bg-white shadow-sm text-primary font-bold" : "text-secondary hover:bg-surface-container-high"
                  )}
                >
                  <Hash className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{ch}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Direct Messages</h3>
              <PlusCircle className="w-4 h-4 cursor-pointer hover:text-primary transition-colors text-secondary" />
            </div>
            <div className="space-y-1">
              {users.map((u) => (
                <div key={u.name} className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors">
                  <div className="relative">
                    <img src={u.img} className="w-6 h-6 rounded-full object-cover border border-outline-variant" alt={u.name} referrerPolicy="no-referrer" />
                    {u.online && <div className="absolute -bottom-0.5 -right-0.5 size-2 bg-green-500 rounded-full border-2 border-surface-container-low"></div>}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 glass-header sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold">#{activeChannel}</h2>
            <div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
            <p className="text-xs text-secondary font-medium truncate max-w-sm">Internal logistics and day-to-day workflow coordination.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
            </div>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-surface-container-low rounded-lg text-secondary transition-colors"><Phone className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-surface-container-low rounded-lg text-secondary transition-colors"><Video className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-surface-container-low rounded-lg text-secondary transition-colors"><Info className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {currentChannelMessages.map((m, idx) => (
            <div key={idx} className="group flex gap-5 p-2 -mx-2 rounded-xl transition-colors hover:bg-surface-container-low/30">
              <div className="size-11 rounded-lg overflow-hidden shrink-0 shadow-sm">
                {m.img ? (
                  <img src={m.img} className="w-full h-full object-cover" alt={m.user} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-primary-container flex items-center justify-center text-white font-bold">{m.initials}</div>
                )}
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm text-primary">{m.user}</span>
                  <span className="text-[10px] font-mono text-secondary">{m.time}</span>
                </div>
                <p className="text-sm text-on-surface leading-relaxed">{m.content}</p>
                
                {m.attachment && (
                  <div className="max-w-md bg-white border border-outline-variant/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="size-12 bg-error-container text-error rounded-lg flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{m.attachment.name}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{m.attachment.size} • {m.attachment.type}</p>
                    </div>
                    <Download className="w-5 h-5 text-secondary" />
                  </div>
                )}

                {m.reactions && (
                  <div className="flex gap-2 mt-3">
                    {m.reactions.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-outline-variant/50 hover:border-primary transition-all cursor-pointer">
                        <span className="text-sm">{r.emoji}</span>
                        <span className="text-[10px] font-bold text-primary">{r.count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {m.replies && (
                  <div className="flex items-center gap-3 mt-4 cursor-pointer group/thread">
                    <div className="flex -space-x-1.5">
                      <div className="size-5 rounded-full border-2 border-white bg-primary-fixed"></div>
                      <div className="size-5 rounded-full border-2 border-white bg-secondary-container"></div>
                    </div>
                    <span className="text-[10px] font-bold text-primary-container uppercase tracking-widest hover:underline">{m.replies} replies</span>
                    <span className="text-[10px] text-secondary font-medium">• Last reply 5m ago</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 pt-0">
          <form className="bg-surface-container-low border border-outline-variant/30 rounded-2xl focus-within:ring-2 focus-within:ring-primary/5 focus-within:border-primary transition-all" onSubmit={handleSendMessage}>
            <div className="flex items-center gap-1 p-2 border-b border-outline-variant/20 mb-2">
               {['bold', 'italic', 'list', 'code', 'smile'].map((icon, i) => (
                 <button key={i} type="button" className="p-2 hover:bg-surface-container-high rounded text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                 </button>
               ))}
            </div>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-transparent border-none focus:ring-0 text-sm p-4 resize-none placeholder-outline outline-none" 
              placeholder={`Message #${activeChannel}`} 
              rows={3}
            ></textarea>
            <div className="flex items-center justify-between p-2 px-4 pb-4">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 hover:bg-surface-container-high rounded-full text-secondary transition-colors">
                  <PlusCircle className="w-6 h-6" />
                </button>
                <div className="h-6 w-[1px] bg-outline-variant/30 mx-1"></div>
                <div className="flex items-center gap-3 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/30">
                  <Mic className="w-4 h-4 text-error animate-pulse" />
                  <div className="flex gap-0.5 items-center">
                    {[12, 20, 8, 24, 16].map((h, i) => (
                      <div key={i} className="w-1 bg-primary rounded-full" style={{ height: h }}></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary tracking-tighter">0:12</span>
                </div>
              </div>
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
                Send
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Right Sidebar Detail */}
      <aside className="w-80 border-l border-outline-variant/30 bg-white hidden xl:flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 sticky top-0">
          <h3 className="font-bold text-sm uppercase tracking-widest">Channel Details</h3>
          <button className="p-1.5 hover:bg-surface-container-low rounded-full">
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide">
          <div className="aspect-video rounded-xl overflow-hidden relative group shadow-sm border border-outline-variant/30">
            <img 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTFz4DemU6WNr_zpS4W_W1atAYgo_pkuIsudr-mzSvdygKNQQM5bd-nKLNuqfAJmIVo5gjWQ-z1gevENwj1K55E_GWp7CGhEll48OPjIO5FNbL92e1u_Yefbl_wk5KIrN8Nyp7OKvM0VnEfaaS0roYjueH_bKw11bIrApLTar5D7zwO-orPvWWXucZFlNOOPb_q6T4RhffQhHnNQqmrSCmf_3zixeDKMp3AGIqVd7EWHtCwrbxItgTR-6LJbInGUrFjnm_mJo002u_" 
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
               alt="Channel Cover" 
               referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">About Channel</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Central hub for ENAKO OS internal operations. Coordination of deployments, infrastructure monitoring, and resource allocation.</p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Pinned Files</h4>
            <div className="space-y-3">
              <p className="text-[10px] text-center text-secondary py-4 uppercase font-bold tracking-widest">No pinned files</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
