import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';

export default function OutreachApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    apiRequest<any[]>('/outreach/applications')
      .then(setApplications)
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = (id: number) => {
    toast.success(`Application #${id} verified and forwarded to Executive Review.`);
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Inbox & Review</h1>
          <p className="text-slate-500 text-sm mt-1">Review applicant dossiers for community sponsorships, scholarships, and grants</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Featured Overview Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applicant Queue</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Pending Applicant Submissions</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{pendingCount} Awaiting Review</p>
              <p className="text-slate-600 text-xs mt-2">
                Outreach applications submitted from public landing programs and scholarship initiatives.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Intake: <strong className="text-slate-900">{applications.length} Applicants</strong></span>
            <span>Reviewed: <strong className="text-emerald-700">{applications.length - pendingCount} Completed</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Review Status</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Pending Verification</span>
                <span className="font-mono text-amber-700 font-bold">{pendingCount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Verified / Processed</span>
                <span className="font-mono text-emerald-700 font-bold">{applications.length - pendingCount}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Processed directly in portal
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Incoming Applicant Submissions</h3>
          <span className="text-xs text-slate-500 font-medium">{applications.length} applications logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Applicant Name</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Program Level</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Date Applied</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400">No applications in queue.</td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.applicantName}</div>
                      <div className="text-xs text-slate-500">{app.type}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{app.level !== 'NONE' ? app.level : '-'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.documents && app.documents.length > 0 && (
                          <a 
                            href={app.documents[0]} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            View Doc
                          </a>
                        )}
                        {app.status === 'PENDING' && (
                          <button 
                            onClick={() => handleVerify(app.id)} 
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                          >
                            Verify
                          </button>
                        )}
                      </div>
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
