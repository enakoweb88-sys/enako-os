import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw, 
  ArrowRightLeft, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Lock,
  X,
  UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { EmployeeDashboard } from './dashboards/EmployeeDashboard';

const DEPARTMENT_POSITIONS: Record<string, string[]> = {
  'Engineering': [
    'Backend Engineer',
    'Frontend Engineer',
    'Full Stack Developer',
    'DevOps / Infrastructure Engineer',
    'Mobile Developer (iOS/Android)',
    'QA / Software Test Engineer',
    'Cybersecurity Specialist',
    'Software Architect'
  ],
  'Finance': [
    'Financial Analyst',
    'Treasury & FX Officer',
    'Accountant / Bookkeeper',
    'B2B Settlement Specialist',
    'Payroll Administrator',
    'Tax & Audit Specialist',
    'Risk & Loss Prevention Officer'
  ],
  'Digital Marketing': [
    'Social Media Manager',
    'Content Creator & Copywriter',
    'Growth & Paid Ads Marketer',
    'SEO & Web Analytics Specialist',
    'Video Producer & Graphic Designer',
    'Brand Strategy Officer'
  ],
  'Operations': [
    'Operations Officer',
    'Mobile Money Float Coordinator',
    'Customer Operations Specialist',
    'Logistics & Branch Coordinator',
    'Process & Workflow Associate'
  ],
  'Compliance': [
    'Compliance & Regulatory Officer',
    'KYC / AML Analyst',
    'Financial Crime Prevention Specialist',
    'Data Protection & Privacy Officer',
    'Internal Audit Inspector'
  ],
  'Management': [
    'Strategic Planning Associate',
    'Executive Operations Assistant',
    'Departmental Coordinator',
    'KPI Performance Analyst',
    'Project Management Specialist'
  ],
  'HR': [
    'HR Generalist',
    'Talent Acquisition / Recruiter',
    'Onboarding & Culture Specialist',
    'Employee Relations Associate',
    'Training & Development Officer'
  ],
  'Outreach / NGO': [
    'Outreach Manager',
    'Field Operations Coordinator',
    'Fundraising & Grants Specialist',
    'Community Liaison Officer',
    'Scholarship Administrator'
  ]
};

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', title: 'Backend Engineer',
    role: 'EMPLOYEE', department: 'Engineering', password: '',
    dateOfBirth: '', address: '', personalEmail: '', employmentType: 'Full-Time',
    salary: '', emergencyContact: '', hireDate: '',
    position: 'Backend Engineer', responsibilities: '', goals: '', permissions: 'Standard Operations Access',
  });

  const [viewEmployee, setViewEmployee] = useState<any>(null);
  const [showEmployeeDashboardModal, setShowEmployeeDashboardModal] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.employees({ search, page, limit: 20 });
      setEmployees(res.items);
      setTotal(res.total);

      if (viewEmployee) {
        const updated = res.items.find((e: any) => e.id === viewEmployee.id);
        if (updated) setViewEmployee(updated);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, viewEmployee?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        title: form.position || form.title,
        role: form.role,
        department: form.department,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        personalEmail: form.personalEmail,
        employmentType: form.employmentType,
        salary: form.salary,
        emergencyContact: form.emergencyContact,
        hireDate: form.hireDate,
        responsibilities: form.responsibilities,
        goals: form.goals,
      };
      await api.createEmployee(payload);
      setShowModal(false);
      setForm({
        fullName: '', email: '', phone: '', title: '',
        role: 'EMPLOYEE', department: 'Engineering', password: '',
        dateOfBirth: '', address: '', personalEmail: '', employmentType: 'Full-Time',
        salary: '', emergencyContact: '', hireDate: '',
        position: '', responsibilities: '', goals: '', permissions: 'Standard Operations Access',
      });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async (id: string, status: string) => {
    try {
      if (status === 'ACTIVE') await api.suspendEmployee(id);
      else await api.activateEmployee(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewEmployee || !newPassword) return;
    try {
      await api.resetEmployeePassword(viewEmployee.id, newPassword);
      alert('Password reset successfully.');
      setShowResetPassword(false);
      setNewPassword('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEditMode = () => {
    setEditForm({ ...viewEmployee });
    setEditMode(true);
  };

  const handleEditSubmit = async () => {
    if (!editForm) return;

    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      toast.error('Please enter a valid corporate email address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        title: editForm.title,
        role: editForm.role,
        department: editForm.department,
        employmentType: editForm.employmentType,
        salary: editForm.salary ? Number(editForm.salary) : undefined,
        address: editForm.address,
        personalEmail: editForm.personalEmail,
        emergencyContact: editForm.emergencyContact,
        ledDepartments: editForm.ledDepartments,
        hireDate: editForm.hireDate ? new Date(editForm.hireDate).toISOString() : undefined,
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : undefined,
        responsibilities: editForm.responsibilities,
        goals: editForm.goals,
      };
      if (viewEmployee.id === user?.id && role !== 'ceo' && role !== 'manager') {
        await api.updateMe(payload);
        const storedStr = sessionStorage.getItem('enako_user');
        if (storedStr) {
          sessionStorage.setItem('enako_user', JSON.stringify({ ...JSON.parse(storedStr), ...payload }));
        }
      } else {
        await api.updateEmployee(viewEmployee.id, payload);
      }
      toast.success(`Profile updated successfully! Corporate email set to ${editForm.email}`);
      setEditMode(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (viewEmployee) {
    const data = editMode ? editForm : viewEmployee;
    const canEdit = role === 'ceo' || role === 'manager' || viewEmployee.id === user?.id;

    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-sans pb-20">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>Human Resources</span>
              <span>/</span>
              <button 
                onClick={() => { setViewEmployee(null); setEditMode(false); }}
                className="hover:underline text-slate-500 cursor-pointer"
              >
                Employees
              </button>
              <span>/</span>
              <span className="text-[#001f5b] font-bold">{data.fullName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setViewEmployee(null); setEditMode(false); }}
                className="px-3 py-1.5 rounded-lg border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Directory
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Operative Profile
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed employee records, departmental roles, and administrative controls.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEmployeeDashboardModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            Live Workspace Dashboard
          </button>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Area */}
          <div className="w-full md:w-80 bg-slate-50/60 border-r border-slate-200/80 p-6 flex flex-col items-center text-center">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Avatar" className="w-24 h-24 object-cover rounded-full border border-slate-200/90 mb-4 shadow-2xs" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-2xl border border-slate-200 mb-4 shadow-2xs">
                {data.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}

            {editMode ? (
              <input value={data.fullName} onChange={e => setEditForm({ ...data, fullName: e.target.value })} className="w-full text-center text-lg font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-2 mb-2" />
            ) : (
              <h2 className="text-lg font-bold text-slate-900 mb-1">{data.fullName}</h2>
            )}

            {editMode ? (
              <input value={data.title || ''} onChange={e => setEditForm({ ...data, title: e.target.value })} placeholder="Title" className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-300 rounded-lg p-2 mb-4" />
            ) : (
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{data.title || 'Operative'}</p>
            )}

            <div className="w-full space-y-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">System Status</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border',
                    data.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                  )}>{data.status}</span>

                  {canEdit && !editMode && (
                    <button
                      onClick={() => handleSuspend(data.id, data.status)}
                      className="text-[10px] font-bold text-slate-900 underline uppercase"
                    >
                      {data.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>

              <div className={cn(
                "p-3 rounded-lg border text-left",
                editMode && role === 'ceo' ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Corporate Email</p>
                  {editMode && role === 'ceo' && (
                    <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-[9px] font-bold uppercase">CEO Editable</span>
                  )}
                </div>
                {editMode && role === 'ceo' ? (
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={editForm?.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-white border border-amber-400 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none"
                      placeholder="firstname.lastname@enako.com"
                    />
                    <p className="text-[9px] text-amber-700 font-medium">Updates employee login email.</p>
                  </div>
                ) : (
                  <p className="text-xs font-medium truncate text-slate-900">{data.email}</p>
                )}
              </div>

              {canEdit && (
                <div className="pt-3 border-t border-slate-200 w-full space-y-2">
                  {!editMode ? (
                    <button onClick={startEditMode} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleEditSubmit} disabled={submitting} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50">
                        Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="w-full py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 content-start">

            {/* Organization Identity */}
            <section className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Organization Identity
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Department</p>
                  {editMode ? (
                    <select value={data.department} onChange={e => setEditForm({ ...data, department: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none font-bold text-slate-900">
                      {['Engineering', 'Finance', 'Digital Marketing', 'Operations', 'Compliance', 'Management', 'HR', 'Outreach / NGO'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.department || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Role Level</p>
                  {editMode ? (
                    <select value={data.role} onChange={e => setEditForm({ ...data, role: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none font-bold text-slate-900">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="OUTREACH_MANAGER">Outreach Manager</option>
                      <option value="CEO">CEO</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.role}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Core Responsibilities & Goals */}
            <section className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Core Responsibilities & Goals
              </h4>
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duties & Responsibilities</p>
                  {editMode ? (
                    <textarea
                      rows={3}
                      value={editForm?.responsibilities || ''}
                      onChange={e => setEditForm({ ...editForm, responsibilities: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 outline-none"
                      placeholder="Enter core duties..."
                    />
                  ) : (
                    <p className="text-xs font-medium text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {data.responsibilities || 'No specific responsibilities assigned yet.'}
                    </p>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Goals & Targets</p>
                  {editMode ? (
                    <textarea
                      rows={3}
                      value={editForm?.goals || ''}
                      onChange={e => setEditForm({ ...editForm, goals: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 outline-none"
                      placeholder="Enter assigned goals..."
                    />
                  ) : (
                    <p className="text-xs font-medium text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {data.goals || 'No specific initial goals assigned yet.'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* HR & Payroll */}
            <section className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                HR & Payroll
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Employment Type</p>
                  {editMode ? (
                    <select value={data.employmentType} onChange={e => setEditForm({ ...data, employmentType: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none">
                      {['Full-Time', 'Part-Time', 'Contract'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.employmentType || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Salary (XAF)</p>
                  {editMode ? (
                    <input type="number" value={data.salary || ''} onChange={e => setEditForm({ ...data, salary: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                  ) : (
                    <p className="text-sm font-mono font-bold text-slate-900">{data.salary ? Number(data.salary).toLocaleString() : '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Hire Date</p>
                  {editMode ? (
                    <input type="date" value={data.hireDate ? new Date(data.hireDate).toISOString().split('T')[0] : ''} onChange={e => setEditForm({ ...data, hireDate: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.hireDate ? new Date(data.hireDate).toLocaleDateString() : '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Date of Birth</p>
                  {editMode ? (
                    <input type="date" value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setEditForm({ ...data, dateOfBirth: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : '—'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Phone Number</p>
                    {editMode ? (
                      <input value={data.phone || ''} onChange={e => setEditForm({ ...data, phone: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900">{data.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Personal Email</p>
                    {editMode ? (
                      <input type="email" value={data.personalEmail || ''} onChange={e => setEditForm({ ...data, personalEmail: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900">{data.personalEmail || '—'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Home Address</p>
                  {editMode ? (
                    <input value={data.address || ''} onChange={e => setEditForm({ ...data, address: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.address || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Emergency Contact</p>
                  {editMode ? (
                    <input value={data.emergencyContact || ''} onChange={e => setEditForm({ ...data, emergencyContact: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{data.emergencyContact || '—'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Security & Access */}
            {canEdit && !editMode && (
              <section className="bg-rose-50 rounded-lg p-5 border border-rose-200 xl:col-span-2">
                <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-2">
                  Security & Access Control
                </h4>

                <div className="space-y-3">
                  {!showResetPassword ? (
                    <div>
                      <p className="text-xs text-rose-700 mb-2">If this operative has lost access, you can securely override their credentials.</p>
                      <button
                        onClick={() => setShowResetPassword(true)}
                        className="text-xs font-bold text-rose-700 border border-rose-200 bg-white px-3.5 py-2 rounded-lg hover:bg-rose-50 transition-colors uppercase tracking-wider shadow-sm"
                      >
                        Reset Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="flex gap-2 max-w-sm">
                      <div className="relative flex-1">
                        <input
                          type={showResetPasswordText ? "text" : "password"}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="New password (min 8 chars)"
                          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-rose-300 shadow-sm"
                        />
                      </div>
                      <button type="submit" className="bg-rose-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-sm">
                        Confirm
                      </button>
                      <button type="button" onClick={() => setShowResetPassword(false)} className="border border-rose-200 text-rose-700 bg-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-50 shadow-sm">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>

        <AnimatePresence>
          {showEmployeeDashboardModal && viewEmployee && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 md:p-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">
                      {viewEmployee.fullName}'s Live Workspace Dashboard
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                      {viewEmployee.title || 'Operative'} ({viewEmployee.department || 'General'})
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowEmployeeDashboardModal(false)}
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    Close
                  </button>
                </div>

                <EmployeeDashboard targetUser={viewEmployee} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const activeDeptsCount = new Set(
    employees.map((e) => (e.department || '').trim()).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Human Resources</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Employees</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Organization Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage global headcount, organizational hierarchy, and employee deployment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/employees/new"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            + Add Employee
          </Link>
          <Link
            to="/app/employees/departments"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Departments
          </Link>
          <button
            onClick={load}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── TOP METRIC CARDS: 1 BIG CARD (TOTAL STAFF) + 3 SIDE CARDS (No Icons) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1: TOTAL STAFF (Big Main Card with Red Bottom Accent) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL STAFF</p>
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mt-2">{total}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Global Operations Roster</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Deployed
            </span>
          </div>
        </div>

        {/* The other three placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 justify-between">
          {/* Card 2: Green Accent */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">ACTIVE OPERATIVES</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{total}</p>
              <span className="text-xs text-slate-500">Active roster</span>
            </div>
          </div>

          {/* Card 3: Oxford Navy #001f5b Accent */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">DEPARTMENTS</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{activeDeptsCount || 8}</p>
              <span className="text-xs text-slate-500">Units with staff</span>
            </div>
          </div>

          {/* Card 4: Amber Accent */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">SUSPENDED</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">0</p>
              <span className="text-xs text-slate-500">Zero sanctions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, role, department..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
            <span>Showing {employees.length} of {total} operatives</span>
          </div>
        </div>

        {error && <div className="p-4 text-xs text-rose-700 bg-rose-50 border-b border-rose-200">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">Loading operatives...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">No operatives found.</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200/90" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200">
                          {emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{emp.title ?? emp.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      {emp.department ?? 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-semibold text-slate-600">{emp.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border w-fit inline-block',
                      emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                    )}>{emp.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(role === 'ceo' || role === 'manager') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewEmployee(emp); }}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                        >
                          View Profile
                        </button>
                      )}
                      {role === 'ceo' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSuspend(emp.id, emp.status); }}
                          className={cn(
                            'text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border cursor-pointer shadow-2xs',
                            emp.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                          )}
                        >
                          {emp.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Showing {employees.length} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-slate-200/90 hover:bg-slate-50 disabled:opacity-30 cursor-pointer">Previous</button>
            <span className="px-3 py-1.5">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={employees.length < 20} className="px-3 py-1.5 rounded-lg border border-slate-200/90 hover:bg-slate-50 disabled:opacity-30 cursor-pointer">Next</button>
          </div>
        </div>
      </div>

      {/* Deploy Operative Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">Create Employee Account</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Configure Personal Info, Department, Position, & Access</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">
                  Close
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto">

                {/* 1. Personal Information */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    1. Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Full Name *</label>
                      <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Corporate Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="corporate@enako.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Temporary Password *</label>
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400"
                        placeholder="Min 8 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="+237 6XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Personal Email</label>
                      <input type="email" value={form.personalEmail} onChange={e => setForm({ ...form, personalEmail: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="personal@gmail.com" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Home Address</label>
                      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="Full residential address" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                      <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Emergency Contact</label>
                      <input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="Name & Phone Number" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Hire Date</label>
                      <input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Employment Type</label>
                      <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400">
                        <option>Full-Time</option>
                        <option>Part-Time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Salary / Monthly Compensation (XAF)</label>
                      <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="e.g. 500000" />
                    </div>
                  </div>
                </section>

                {/* 2. Role */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    2. Role Level Assignment *
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'EMPLOYEE', label: 'Employee', desc: 'Standard Operative & Departmental Access' },
                      { id: 'MANAGER', label: 'Manager', desc: 'Departmental Leadership & Team Oversight' },
                      { id: 'OUTREACH_MANAGER', label: 'Outreach Manager', desc: 'ENAKO Outreach Foundation & NGO Lead' },
                    ].map(r => (
                      <label key={r.id} className={cn(
                        "p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all",
                        form.role === r.id ? "border-slate-900 bg-slate-50 text-slate-900 font-bold" : "border-slate-200 hover:bg-slate-50"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">{r.label}</span>
                          <input
                            type="radio"
                            name="employee_role_level"
                            value={r.id}
                            checked={form.role === r.id}
                            onChange={e => {
                              const selectedRole = e.target.value;
                              if (selectedRole === 'OUTREACH_MANAGER') {
                                const outPos = (DEPARTMENT_POSITIONS['Outreach / NGO'] || [])[0] || 'Outreach Manager';
                                setForm({
                                  ...form,
                                  role: selectedRole,
                                  department: 'Outreach / NGO',
                                  position: outPos,
                                  title: outPos
                                });
                              } else if (selectedRole === 'MANAGER') {
                                setForm({
                                  ...form,
                                  role: selectedRole,
                                  department: 'Management',
                                  position: 'Department Manager',
                                  title: 'Department Manager'
                                });
                              } else {
                                const defaultDept = 'Engineering';
                                const firstPos = (DEPARTMENT_POSITIONS[defaultDept] || [])[0] || 'Backend Engineer';
                                setForm({
                                  ...form,
                                  role: selectedRole,
                                  department: defaultDept,
                                  position: firstPos,
                                  title: firstPos
                                });
                              }
                            }}
                            className="text-slate-900"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal">{r.desc}</p>
                      </label>
                    ))}
                  </div>
                </section>

                {form.role === 'EMPLOYEE' && (
                  <>
                    {/* 3. Department */}
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                        3. Department Assignment
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'Engineering',
                          'Finance',
                          'Digital Marketing',
                          'Operations',
                          'Compliance',
                          'Management',
                          'HR',
                          'Outreach / NGO'
                        ].map(d => (
                          <label key={d} className={cn(
                            "p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all",
                            form.department === d ? "border-slate-900 bg-slate-50 text-slate-900 font-bold" : "border-slate-200 hover:bg-slate-50"
                          )}>
                            <span className="text-xs font-bold">{d}</span>
                            <input
                              type="radio"
                              name="employee_dept"
                              value={d}
                              checked={form.department === d}
                              onChange={e => {
                                const deptName = e.target.value;
                                const positions = DEPARTMENT_POSITIONS[deptName] || [];
                                const firstPos = positions[0] || '';
                                setForm({ ...form, department: deptName, position: firstPos, title: firstPos });
                              }}
                              className="text-slate-900"
                            />
                          </label>
                        ))}
                      </div>
                    </section>

                    {/* 4. Position */}
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                        4. Job Position ({form.department} Department)
                      </h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Select Position / Job Title *</label>
                        <select
                          required
                          value={form.position}
                          onChange={e => setForm({ ...form, position: e.target.value, title: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                        >
                          {(DEPARTMENT_POSITIONS[form.department] || []).map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                    </section>
                  </>
                )}

                {/* 5. Responsibilities */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    5. Core Responsibilities
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Key Operational Responsibilities & Duties</label>
                    <textarea rows={3} value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="List core daily responsibilities, key functions, and deliverables..." />
                  </div>
                </section>

                {/* 6. Goals */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    6. Initial Employee Goals
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Assigned Goals & Objectives</label>
                    <textarea rows={3} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-slate-400" placeholder="Define quarterly targets, KPIs, and deliverables for this employee..." />
                  </div>
                </section>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all text-slate-700">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-60">
                    {submitting ? 'Creating Employee...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
