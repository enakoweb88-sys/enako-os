import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Target, Award, CheckCircle, TrendingUp } from 'lucide-react';

export default function TeamObjectivesPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.goals()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setGoals(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED' || g.status === 'DONE').length;
  const inProgressGoals = totalGoals - completedGoals;
  const avgCompletion = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 78;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Strategic Objectives & OKRs...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Operations & Workflows • Company OKRs & Team Strategic Objectives" />

      <WorkplaceStatCards
        domainsCount={totalGoals}
        usersCount={inProgressGoals}
        groupsCount={completedGoals}
        licensesCount={`${avgCompletion}%`}
        card1Label="ACTIVE OBJECTIVES"
        card2Label="IN FLIGHT (IN PROGRESS)"
        card3Label="DELIVERED / COMPLETED"
        card4Label="CYCLE PROGRESS RATE"
        card1Icon={<Target className="w-5 h-5" />}
        card2Icon={<TrendingUp className="w-5 h-5" />}
        card3Icon={<CheckCircle className="w-5 h-5" />}
        card4Icon={<Award className="w-5 h-5" />}
      />

      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Quarterly Company OKRs & Milestone Status
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Tracking strategic alignment across Fintech engineering, business development, compliance, and growth.
        </p>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No strategic team objectives recorded.
            </div>
          ) : (
            goals.map((g, idx) => {
              const current = Number(g.currentValue ?? 45);
              const target = Number(g.targetValue ?? 100);
              const pct = Math.min(100, Math.round((current / (target || 1)) * 100));

              return (
                <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-lg space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#001f5b]/10 text-[#001f5b]">
                          {g.department || 'Enterprise'}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono">
                          Target: {target} {g.unit || '%'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900">{g.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{g.description || 'Deliver core business impact'}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {g.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Milestone Progress</span>
                      <span className="font-mono font-bold text-slate-800">{pct}% ({current} / {target} {g.unit || '%'})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#001f5b] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
