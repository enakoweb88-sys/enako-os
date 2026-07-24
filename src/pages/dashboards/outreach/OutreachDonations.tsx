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
      setDonations(data);
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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recent Donations</h1>
          <p className="text-slate-500 font-medium">View and manage donation submissions.</p>
        </div>
        <button onClick={fetchDonations} className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4 font-bold">Donor</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Method</th>
                <th className="p-4 font-bold">Sector / Freq</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                    <p>Loading donations...</p>
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="font-medium text-slate-900">No donations found.</p>
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-bold text-slate-900">{donation.fullName}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate max-w-[150px]" title={donation.email}>{donation.email}</span>
                        <span className="text-xs text-slate-400">{donation.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-slate-900">{donation.amount?.toLocaleString()} {donation.currency}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                        {donation.method}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700 capitalize">{donation.sector}</span>
                        <span className="text-xs text-slate-400">{donation.frequency}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedDonation(donation)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Donation Details</h2>
              <button 
                onClick={() => setSelectedDonation(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-blue-900">{selectedDonation.amount?.toLocaleString()} {selectedDonation.currency}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedDonation.status)}`}>
                    {selectedDonation.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Donor Name</p>
                  <p className="font-bold text-slate-900">{selectedDonation.fullName}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="font-bold text-slate-900">{selectedDonation.method}</p>
                </div>
                <div className="col-span-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Info</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {selectedDonation.email}
                    </p>
                    <p className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {selectedDonation.phone}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sector</p>
                  <p className="font-bold text-slate-900 capitalize">{selectedDonation.sector}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency</p>
                  <p className="font-bold text-slate-900">{selectedDonation.frequency}</p>
                </div>
              </div>

              {selectedDonation.documents && selectedDonation.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Attached Documents</h3>
                  <div className="space-y-2">
                    {selectedDonation.documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href={doc} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Receipt / Document {idx + 1}</p>
                            <p className="text-xs text-slate-400">Click to view file</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedDonation(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
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
