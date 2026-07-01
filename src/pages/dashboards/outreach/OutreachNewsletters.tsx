import { toast } from 'sonner';

export default function OutreachNewsletters() {
  const handleSendNewsletter = () => {
    toast.success('Newsletter broadcast dispatched successfully.');
  };

  return (
    <div className="p-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary mb-6">Compose Newsletter</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Subject (English & French)</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none" placeholder="Enter newsletter subject..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Message Body</label>
              <textarea className="w-full h-40 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none resize-none" placeholder="Write your newsletter content here..." />
            </div>
            <div className="flex justify-end pt-4 border-t border-outline-variant/50">
              <button onClick={handleSendNewsletter} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90">Send to 0 Subscribers</button>
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
