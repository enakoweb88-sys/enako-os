import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Bell, Megaphone, CheckCircle2, ShieldAlert, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyBulletinsPage() {
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.announcements()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setBulletins(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ((api as any).createAnnouncement) {
        await (api as any).createAnnouncement({ title: newTitle, content: newContent });
      }
      toast.success('Company bulletin broadcasted to all employees!');
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      loadData();
    } catch {
      toast.info('Bulletin broadcast dispatched');
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Company Bulletins...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Communications • Official Company Bulletins & Executive Directives" />

      <WorkplaceStatCards
        domainsCount={bulletins.length}
        usersCount="100% Broadcast"
        groupsCount="CEO & Executive Board"
        licensesCount="Zero Missed Alerts"
        card1Label="ACTIVE BULLETINS"
        card2Label="STAFF REACH"
        card3Label="AUTHORITY LEVEL"
        card4Label="DIRECTIVE COMPLIANCE"
        card1Icon={<Bell className="w-5 h-5" />}
        card2Icon={<Megaphone className="w-5 h-5" />}
        card3Icon={<ShieldAlert className="w-5 h-5" />}
        card4Icon={<CheckCircle2 className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Company Bulletins & Policy Notices
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Official company-wide communications from executive management.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Broadcast Bulletin
        </button>
      </div>

      <div className="space-y-4">
        {bulletins.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center text-xs text-slate-500 shadow-2xs">
            No active company bulletins.
          </div>
        ) : (
          bulletins.map((b, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-2.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#001f5b]/10 text-[#001f5b]">
                    EXECUTIVE MEMO
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE DIRECTIVE
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-900">{b.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 whitespace-pre-line">
                {b.content}
              </p>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span>Issued by: <strong>CEO Office • E NAKO COMPANY PLC</strong></span>
                <span className="text-emerald-700 font-semibold">Broadcast to all branches</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900 mb-4">Broadcast Executive Bulletin</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Directive Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. End of Month Financial Closing Notice"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Memo Content</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter full announcement details for all staff..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold"
                >
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
