import { Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function OutreachApplications() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applications: any[] = [];

  const handleVerify = (id: number) => {
    toast.success(`Application #${id} verified and forwarded to Executive Review.`);
  };

  return (
    <div className="p-6 pb-20">
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary">Applications Inbox</h3>
          <button className="border border-outline-variant px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Filter className="w-4 h-4"/> Filter
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50 text-secondary text-sm">
              <th className="pb-3 font-semibold">Applicant Name</th>
              <th className="pb-3 font-semibold">Level</th>
              <th className="pb-3 font-semibold">Date Applied</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-b border-outline-variant/20 last:border-0">
                <td className="py-4 font-bold text-primary">{app.name}</td>
                <td className="py-4 text-sm text-secondary">{app.level}</td>
                <td className="py-4 text-sm text-secondary">{app.date}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {app.status === 'PENDING' && (
                    <button onClick={() => handleVerify(app.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">
                      Verify & Forward
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
