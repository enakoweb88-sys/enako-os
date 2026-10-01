import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { API_BASE_URL } from '../../lib/api/core';

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};

export default function KycRejectedPage() {
  const [rejectedList, setRejectedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.kyc({ status: 'REJECTED', limit: 100 });
      const list = (res || []).filter((k: any) => k.status === 'REJECTED');
      setRejectedList(list);
      setErrorMsg('');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to load rejected submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = rejectedList.filter((r) => {
    const term = search.toLowerCase();
    const name = (r.applicantName || '').toLowerCase();
    const email = (r.email || '').toLowerCase();
    const phone = (r.phone || '').toLowerCase();
    const type = (r.applicantType || '').toLowerCase();
    const reason = (r.rejectionReason || '').toLowerCase();
    const id = (r.id || '').toLowerCase();
    return (
      name.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      type.includes(term) ||
      reason.includes(term) ||
      id.includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans pb-24">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Compliance & Risk</span>
            <span>/</span>
            <Link to="/app/kyc" className="hover:underline text-slate-500 cursor-pointer">
              KYC
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Rejected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rejected Submissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagged or non-compliant KYC submissions with audit remarks and rejection reasons.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/app/kyc"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            All KYC Directory
          </Link>
          <Link
            to="/app/kyc/pending"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Pending Submissions
          </Link>
          <Link
            to="/app/kyc/approved"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Approved
          </Link>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── NOTE: NO METRIC CARDS AS EXPLICITLY REQUESTED ── */}

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search flagged filings by name, email, or rejection reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>Flagged Submissions:</span>
          <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px]">
            {filtered.length} Flagged
          </span>
        </div>
      </div>

      {/* Rejected Submissions Table Only */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Flagged Submissions Ledger
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Audit remarks recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Details</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Entity Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rejection Audit Reason</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Flagged</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Audited By</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs font-semibold text-slate-500">
                    Loading flagged submissions...
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-rose-600 bg-rose-50/50">
                    {errorMsg}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-500">
                    No rejected KYC records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.applicantName}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p>{item.email || '—'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        {item.applicantType || 'INDIVIDUAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="max-w-xs">
                        <span className="text-rose-700 font-medium bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] line-clamp-2">
                          {item.rejectionReason || 'Non-compliant documents or invalid identification details.'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                      {item.reviewedBy?.fullName || 'Compliance Officer'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 inline-block">
                        REJECTED
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(item)}
                        className="px-3 py-1 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Audit Modal (No Icons) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  {selectedRecord.applicantName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: {selectedRecord.applicantType} · Flagged:{' '}
                  {new Date(selectedRecord.updatedAt || selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 space-y-1">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  Official Compliance Rejection Reason
                </p>
                <p className="text-xs text-rose-900 font-medium leading-relaxed">
                  {selectedRecord.rejectionReason || 'No specific rejection reason was provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Audited By</p>
                  <p className="font-semibold text-slate-900">{selectedRecord.reviewedBy?.fullName || 'Compliance Officer'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="font-bold text-rose-700 uppercase">REJECTED</p>
                </div>
              </div>

              {selectedRecord.documents?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Attached Files ({selectedRecord.documents.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRecord.documents.map((doc: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{doc.documentType || `Document ${i + 1}`}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.fileName || 'file'}</p>
                        </div>
                        {doc.fileUrl && (
                          <a
                            href={getFileUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 hover:bg-slate-100 uppercase tracking-wider"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
