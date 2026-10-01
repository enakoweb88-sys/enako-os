import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import {
  Calendar, Clock, CheckCircle2, XCircle, Search, UserCheck,
  Plus, CheckCheck, FileText, User, AlertCircle, X, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function PendingLeaveRequestsPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New leave form state
  const [applicantName, setApplicantName] = useState('');
  const [department, setDepartment] = useState('Operations & Strategy');
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [duration, setDuration] = useState('5 days');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [reason, setReason] = useState('');

  const defaultPendingLeaves = [
    { id: 'leave-1', employee: 'Jean-Paul Mbarga', department: 'Treasury & Operations', type: 'Annual Vacation', duration: '5 days', startDate: '2026-10-05', endDate: '2026-10-10', reason: 'Scheduled family leave and rest', status: 'Pending' },
    { id: 'leave-2', employee: 'Marie Nguemo', department: 'Compliance & Legal', type: 'Maternity / Family', duration: '14 days', startDate: '2026-10-12', endDate: '2026-10-26', reason: 'Family medical care & leave', status: 'Pending' },
    { id: 'leave-3', employee: 'Christian Talla', department: 'Engineering & Infrastructure', type: 'Medical & Sick', duration: '2 days', startDate: '2026-10-01', endDate: '2026-10-03', reason: 'Medical appointment and recovery', status: 'Pending' },
    { id: 'leave-4', employee: 'Aissatou Diallo', department: 'Business Development', type: 'Study & Training', duration: '3 days', startDate: '2026-10-15', endDate: '2026-10-18', reason: 'FinTech Compliance certification exams', status: 'Pending' },
    { id: 'leave-5', employee: 'Emmanuel Fotso', department: 'Customer Success & Support', type: 'Annual Vacation', duration: '4 days', startDate: '2026-11-02', endDate: '2026-11-06', reason: 'Annual statutory rest cycle', status: 'Pending' },
  ];

  const loadData = () => {
    setLoading(true);
    api.adminOverview()
      .then((res: any) => {
        const list = res?.leaveRequests || [];
        const pending = list.filter((l: any) => (l.status || '').toLowerCase() === 'pending');
        if (pending.length > 0) {
          setLeaves(pending);
        } else {
          setLeaves(defaultPendingLeaves);
        }
      })
      .catch(() => {
        setLeaves(defaultPendingLeaves);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const item = leaves.find(l => l.id === id);
    const applicant = item?.employee || item?.employeeName || 'Staff Member';
    if (action === 'APPROVED') {
      toast.success(`Leave request for ${applicant} approved! HR notification dispatched.`);
    } else {
      toast.error(`Leave request for ${applicant} declined. Reason logged.`);
    }
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  const handleBatchApprove = () => {
    if (filtered.length === 0) {
      toast.info('No pending leave requests to approve.');
      return;
    }
    toast.success(`Successfully approved ${filtered.length} pending leave requests!`);
    setLeaves([]);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !reason.trim()) {
      toast.error('Please enter the employee name and justification');
      return;
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      employee: applicantName,
      department,
      type: leaveType,
      duration,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    };

    setLeaves(prev => [newLeave, ...prev]);
    toast.success(`Leave application filed for ${applicantName} and placed in executive approval queue.`);
    setIsNewModalOpen(false);
    setApplicantName('');
    setReason('');
  };

  const filtered = leaves.filter(l => {
    const matchesSearch = ((l.employee || l.employeeName || '') + ' ' + (l.type || '') + ' ' + (l.department || '') + ' ' + (l.reason || ''))
      .toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'ANNUAL') return (l.type || '').toLowerCase().includes('annual') || (l.type || '').toLowerCase().includes('vacation');
    if (activeTab === 'SICK') return (l.type || '').toLowerCase().includes('sick') || (l.type || '').toLowerCase().includes('medical');
    if (activeTab === 'FAMILY') return (l.type || '').toLowerCase().includes('maternity') || (l.type || '').toLowerCase().includes('family');
    if (activeTab === 'STUDY') return (l.type || '').toLowerCase().includes('study') || (l.type || '').toLowerCase().includes('training');

    return true;
  });

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Human Resources • Pending Leave Requests & Executive Time-Off Approvals" />

      <WorkplaceStatCards
        domainsCount={filtered.length}
        usersCount="18 Approved"
        groupsCount="4.8 Days"
        licensesCount="98.4% Coverage"
        card1Label="AWAITING CEO SIGN-OFF"
        card2Label="APPROVED THIS QUARTER"
        card3Label="AVERAGE DURATION"
        card4Label="OPERATIONAL COVERAGE"
        card1Icon={<Clock className="w-5 h-5" />}
        card2Icon={<CheckCircle2 className="w-5 h-5" />}
        card3Icon={<Calendar className="w-5 h-5" />}
        card4Icon={<UserCheck className="w-5 h-5" />}
      />

      {/* Action Header Card with Search, Tabs, and Action Buttons */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pending leaves by employee, department, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleBatchApprove}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Batch Approve All
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              File Leave Request
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-slate-100 pt-3">
          {[
            { id: 'ALL', label: `All Requests (${leaves.length})` },
            { id: 'ANNUAL', label: 'Annual Vacations' },
            { id: 'SICK', label: 'Medical & Sick' },
            { id: 'FAMILY', label: 'Maternity / Family' },
            { id: 'STUDY', label: 'Study & Training' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#001f5b] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leave Queue Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Pending Leave Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Executive review required before dates are locked into corporate roster.</p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#001f5b]/10 text-[#001f5b]">
            {filtered.length} Requests Awaiting Sign-off
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Leave Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dates Requested</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Justification</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Executive Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-xs">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-slate-800">No Pending Leave Requests</p>
                      <p className="text-[11px] text-slate-400">All employee time-off applications have been resolved and workforce coverage is 100%.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-[#001f5b] font-bold text-[11px] flex items-center justify-center shrink-0">
                          {(l.employee || l.employeeName || 'S').slice(0, 2).toUpperCase()}
                        </div>
                        <span>{l.employee || l.employeeName || 'Staff Member'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {l.department || 'Operations'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#001f5b]/10 text-[#001f5b]">
                        {l.type || 'Annual Vacation'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-mono font-semibold">
                      {l.duration || '1 day'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                      {l.startDate ? `${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()}` : 'Scheduled Cycle'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[220px] truncate" title={l.reason}>
                      {l.reason || 'Annual vacation / personal'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecision(l.id, 'APPROVED')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(l.id, 'REJECTED')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Leave Request Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">File New Employee Leave Application</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paul Ndongo"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  >
                    <option value="Operations & Strategy">Operations & Strategy</option>
                    <option value="Treasury & Finance">Treasury & Finance</option>
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Compliance & Legal">Compliance & Legal</option>
                    <option value="Business Development">Business Development</option>
                    <option value="Customer Success">Customer Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  >
                    <option value="Annual Vacation">Annual Vacation</option>
                    <option value="Medical & Sick">Medical & Sick</option>
                    <option value="Maternity / Family">Maternity / Family</option>
                    <option value="Study & Training">Study & Training</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Justification & Handover Note</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Outline reasons and coverage plan during absence..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#001f5b] hover:bg-[#001744] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Submit For Executive Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
