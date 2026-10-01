import { useEffect, useState } from 'react';
import { outreachAPI } from '../../../lib/api';

interface Donation {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  method: string;
  sector: string;
  frequency: string;
  status: string;
  documents: string[];
  createdAt: string;
}

export default function OutreachDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await outreachAPI.getDonations();
      setDonations(data || []);
    } catch (err) {
      console.error('Failed to load donations', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SETTLED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const totalAmount = donations.reduce((acc, d) => acc + Number(d.amount || 0), 0);
  const settledCount = donations.filter(d => d.status === 'SETTLED' || d.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Donations & Contributions</h1>
          <p className="text-slate-500 text-sm mt-1">Audit, track, and manage incoming outreach philanthropic contributions</p>
        </div>
        <button 
          onClick={fetchDonations} 
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Featured Overview Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Philanthropy Telemetry</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Aggregated Contributed Capital</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalAmount.toLocaleString()} XAF</p>
              <p className="text-slate-600 text-xs mt-2">
                Settled donor contributions financing educational scholarships, clean water initiatives, and local healthcare grants.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Donations: <strong className="text-slate-900">{donations.length} Contributions</strong></span>
            <span>Settlement Rate: <strong className="text-emerald-700">{donations.length > 0 ? `${Math.round((settledCount / donations.length) * 100)}%` : '0%'}</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Fund Health</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Settled Donors</span>
                <span className="font-mono text-emerald-700 font-bold">{settledCount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Pending Approvals</span>
                <span className="font-mono text-amber-700 font-bold">{donations.length - settledCount}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Audit logs synchronized
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Registered Contributor Records</h3>
          <span className="text-xs text-slate-500 font-medium">{donations.length} donations recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Donor</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Contact</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Method</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Sector</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Date</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-xs text-slate-500 animate-pulse">Loading donations...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-xs text-slate-400">No donations found.</td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{donation.fullName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div>{donation.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{donation.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{donation.amount?.toLocaleString()} {donation.currency}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {donation.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs capitalize text-slate-700">
                      <div>{donation.sector}</div>
                      <div className="text-[10px] text-slate-400">{donation.frequency}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedDonation(donation)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Donation Details</h2>
              <button 
                onClick={() => setSelectedDonation(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">{selectedDonation.amount?.toLocaleString()} {selectedDonation.currency}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(selectedDonation.status)}`}>
                    {selectedDonation.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Donor Name</p>
                  <p className="font-semibold text-slate-900">{selectedDonation.fullName}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Payment Method</p>
                  <p className="font-semibold text-slate-900">{selectedDonation.method}</p>
                </div>
                <div className="col-span-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Info</p>
                  <p className="font-medium text-slate-700">{selectedDonation.email} • {selectedDonation.phone}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sector</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedDonation.sector}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Frequency</p>
                  <p className="font-semibold text-slate-900">{selectedDonation.frequency}</p>
                </div>
              </div>

              {selectedDonation.documents && selectedDonation.documents.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Attached Documents</h3>
                  <div className="space-y-1.5">
                    {selectedDonation.documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href={doc} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                      >
                        <span>Receipt / Document {idx + 1}</span>
                        <span className="text-[11px] text-slate-400">View file →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
