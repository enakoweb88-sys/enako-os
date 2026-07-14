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
    <div className="p-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary mb-6">Compose Newsletter</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Target Audience</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none mb-4">
                <option value="ALL">All Groups</option>
                <option value="SUBSCRIBERS">General Subscribers</option>
                <option value="DONATORS">Donators</option>
                <option value="SCHOLARSHIPS">Scholarship Applicants</option>
                <option value="VOLUNTEERS">Voluntary Workers</option>
                <option value="FAMILIES">Families In Need</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Subject (English & French)</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none" placeholder="Enter newsletter subject..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Message Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-40 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none resize-none" placeholder="Write your newsletter content here..." />
            </div>
            <div className="flex justify-end pt-4 border-t border-outline-variant/50">
              <button disabled={isSending} onClick={handleSendNewsletter} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
                {isSending ? 'Dispatching...' : 'Dispatch Newsletter'}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h4 className="font-bold text-primary mb-4">Subscriber Demographics</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-secondary font-semibold">Active Subscribers</span>
              <span className="font-bold text-primary">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary font-semibold">Open Rate</span>
              <span className="font-bold text-primary">0%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary font-semibold">New This Month</span>
              <span className="font-bold text-primary">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
