import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { UtensilsCrossed, Users, CheckCircle, DollarSign, Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportTablePdf } from '../../lib/pdf-export';

function fmt(val: string | number | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function TodaysMealOrdersPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.staffMeals()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setMeals(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMeals = meals.length;
  const eatenMeals = meals.filter(m => m.status === 'ATE').length;
  const companySubsidy = eatenMeals * 1000;
  const employeeContrib = eatenMeals * 500;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Today's Meal Roster...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Operations & Workflows • Today's Staff Welfare Meal Orders & Catering Roster" />

      <WorkplaceStatCards
        domainsCount={totalMeals}
        usersCount={eatenMeals}
        groupsCount={fmt(companySubsidy)}
        licensesCount={fmt(employeeContrib)}
        card1Label="TOTAL MEALS LOGGED"
        card2Label="CONSUMED / DELIVERED"
        card3Label="ENAKO SUBSIDY (50%)"
        card4Label="STAFF CONTRIBUTION"
        card1Icon={<UtensilsCrossed className="w-5 h-5" />}
        card2Icon={<CheckCircle className="w-5 h-5" />}
        card3Icon={<DollarSign className="w-5 h-5" />}
        card4Icon={<Users className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Daily Catering Orders & Staff Welfare Roster
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily lunch delivery breakdown by employee and branch.
          </p>
        </div>

        <button
          onClick={() => {
            try {
              const rows = meals.map(m => [
                m.employee?.fullName || m.userName || 'Employee',
                m.employee?.department || 'Operations',
                m.mealName || 'Standard Lunch Menu',
                m.status === 'ATE' ? 'Confirmed & Consumed' : 'Did Not Eat',
                fmt(m.price || 1500),
                m.orderTime ? new Date(m.orderTime).toLocaleTimeString() : new Date().toLocaleTimeString()
              ]);

              const success = exportTablePdf({
                title: 'TODAY’S CATERING DELIVERY & MEAL ROSTER',
                subtitle: `Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} • Orders: ${meals.length} (${eatenMeals} confirmed)`,
                headers: ['Employee Name', 'Department', 'Meal Selection', 'Status', 'Cost', 'Log Time'],
                rows,
                fileName: `Catering_Delivery_Sheet_${new Date().toISOString().split('T')[0]}.pdf`
              });

              if (success) {
                toast.success('Downloaded Catering Delivery Sheet PDF');
              } else {
                toast.error('Failed to download PDF');
              }
            } catch (err: any) {
              console.error(err);
              toast.error('Failed to export catering sheet');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Catering Sheet
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-800">Today's Employee Meal Orders</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Selected Meal</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Catering Partner</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Subsidy</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No meal orders recorded for today yet.
                  </td>
                </tr>
              ) : (
                meals.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                      {m.employee?.fullName || `Staff Member #${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {m.employee?.department?.name || m.employee?.department || 'Operations'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-800 font-medium">
                      {m.mealName || m.meal || 'Executive Special Platter'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {m.vendor || 'Enako Central Catering'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-right font-bold text-emerald-700">
                      1,000 FCFA
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        m.status === 'ATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {m.status || 'ORDERED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
