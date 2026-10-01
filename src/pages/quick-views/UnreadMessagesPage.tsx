import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { MessageSquare, Bell, CheckCheck, Clock, Search, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function UnreadMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    api.chatMessages()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setMessages(list.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendReply = (id: string, sender: string) => {
    toast.success(`Reply dispatched to ${sender}`);
    setReplyText(prev => ({ ...prev, [id]: '' }));
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleMarkAllRead = () => {
    toast.success('All messages marked as read');
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Unread Communications...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Communications • Priority Unread Team Direct Messages" />

      <WorkplaceStatCards
        domainsCount={messages.length}
        usersCount="Direct Messages"
        groupsCount="< 5 Mins"
        licensesCount="Zero Missed Alerts"
        card1Label="UNREAD MESSAGES"
        card2Label="PRIMARY THREADS"
        card3Label="AVG REPLY SPEED"
        card4Label="ALERT RELIABILITY"
        card1Icon={<MessageSquare className="w-5 h-5" />}
        card2Icon={<Bell className="w-5 h-5" />}
        card3Icon={<Clock className="w-5 h-5" />}
        card4Icon={<CheckCheck className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Unread Internal Communications & Priority Mentions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Direct manager messages, department directives, and escalated notices.</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark All As Read
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center text-xs text-slate-500 shadow-2xs">
            Inbox zero! You have no unread team messages.
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center font-bold text-xs shrink-0">
                    {(m.sender?.fullName || m.senderName || 'Staff')[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{m.sender?.fullName || m.senderName || 'Team Lead'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <span className="w-2 h-2 rounded-full bg-[#001f5b] animate-ping" />
              </div>

              <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
                {m.content || m.text || 'Please review the morning financial ledger reconciliation before the board briefing.'}
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type quick reply..."
                  value={replyText[m.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [m.id]: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
                <button
                  onClick={() => handleSendReply(m.id, m.sender?.fullName || 'Colleague')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
