import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api';

export default function UnreadMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setMessages(await api.unreadMessages()); setError(''); }
    catch { setError('Could not load unread messages. Please refresh.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const markRead = async (items: any[]) => {
    setSaving(true);
    try {
      const groups = new Map<string, string[]>();
      for (const message of items) groups.set(message.channel, [...(groups.get(message.channel) || []), message.id]);
      for (const [channel, ids] of groups) await api.markMessagesRead(channel, ids);
      await load();
    } catch { toast.error('Could not save read status. Please try again.'); await load(); }
    finally { setSaving(false); }
  };
  return <div className="space-y-4 pb-12">
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-xl font-bold">Unread messages</h1>
      <button disabled={saving || !messages.length} onClick={() => void markRead(messages)} className="rounded-lg bg-[#001f5b] px-4 py-2 text-sm text-white disabled:opacity-50">Mark displayed messages as read</button>
    </div>
    {error && <p role="alert" className="text-red-700">{error} <button onClick={() => void load()}>Refresh</button></p>}
    {loading ? <p>Loading unread messages...</p> : !error && !messages.length ? <p>No unread messages.</p> : messages.map(message => <article key={message.id} className="space-y-3 rounded-lg border bg-white p-4">
      <div className="font-semibold">{message.sender?.fullName || 'Employee'} <span className="text-xs font-normal text-slate-500">{new Date(message.createdAt).toLocaleString()}</span></div>
      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      <div className="flex gap-4 text-sm">
        <Link to={'/app/chat?channel=' + encodeURIComponent(message.channel)} className="font-semibold text-blue-700">Open conversation / reply</Link>
        <button disabled={saving} onClick={() => void markRead([message])}>Mark as read</button>
      </div>
    </article>)}
  </div>;
}
