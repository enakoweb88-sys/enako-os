import { useState } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';

export default function OutreachNewsletters() {
  const [audience, setAudience] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendNewsletter = async () => {
    if (!subject || !body) return toast.error('Subject and body are required.');
    setIsSending(true);
    try {
      const res = await apiRequest<any>('/outreach/newsletters/send', {
        method: 'POST',
        body: JSON.stringify({ subject, body, audience })
      });
      toast.success(res.message || `Dispatched to ${res.recipientsCount} recipients.`);
      setSubject('');
      setBody('');
    } catch (e) {
      toast.error('Failed to dispatch newsletter');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 pb-20 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Outreach Communications
        </div>
        <h2 className="text-3xl font-bold font-display text-slate-900">Community Newsletters & Announcements</h2>
        <p className="text-slate-600 text-sm mt-1">
          Broadcast campaigns, project milestones, and community dispatches directly to subscribers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold text-slate-900">Compose Newsletter</h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Direct Broadcast
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Target Audience</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 mb-2">
                <option value="ALL">All Groups</option>
                <option value="SUBSCRIBERS">General Subscribers</option>
                <option value="DONATORS">Donators</option>
                <option value="SCHOLARSHIPS">Scholarship Applicants</option>
                <option value="VOLUNTEERS">Voluntary Workers</option>
                <option value="FAMILIES">Families In Need</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Subject (English & French)</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="Enter newsletter subject..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Message Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-40 bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none" placeholder="Write your newsletter content here..." />
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button disabled={isSending} onClick={handleSendNewsletter} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 text-sm shadow-sm transition-all">
                {isSending ? 'Dispatching...' : 'Dispatch Newsletter'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-base">Subscriber Demographics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-medium">Active Subscribers</span>
                <span className="font-bold text-slate-900">0</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-medium">Open Rate</span>
                <span className="font-bold text-slate-900">0%</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-medium">New This Month</span>
                <span className="font-bold text-slate-900">0</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md mt-6 text-center">
            Mailing List Synchronized
          </div>
        </div>
      </div>
    </div>
  );
}
