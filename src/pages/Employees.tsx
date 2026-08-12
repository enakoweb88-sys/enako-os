import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, User, Search, Mail, Phone, Briefcase, X, Plus, RefreshCw,
  ArrowLeft, Edit2, Check, ShieldAlert, Activity, Target, Award, ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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

    // Validate the new corporate email format if provided
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      toast.error('Please enter a valid corporate email address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        fullName: editForm.fullName,
        email: editForm.email,          // Always send — backend validates & checks uniqueness
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
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setViewEmployee(null); setEditMode(false); }}
            className="p-3 bg-white border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </button>
          <div>
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Operative Profile</h1>
            <p className="text-secondary text-base">Detailed records and administrative controls.</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Area */}
          <div className="w-full md:w-80 bg-surface-container-low border-r border-outline-variant/20 p-8 flex flex-col items-center text-center">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-3xl" />
            ) : (
              <div className="size-32 rounded-3xl bg-primary-fixed flex items-center justify-center font-bold text-primary text-4xl shadow-inner border border-primary/20 mb-6">
                {data.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            
            {editMode ? (
              <input value={data.fullName} onChange={e => setEditForm({...data, fullName: e.target.value})} className="w-full text-center font-display text-2xl font-bold text-primary bg-surface border border-outline-variant/30 rounded-lg p-2 mb-2" />
            ) : (
              <h2 className="font-display text-2xl font-bold text-primary mb-2">{data.fullName}</h2>
            )}

            {editMode ? (
              <input value={data.title || ''} onChange={e => setEditForm({...data, title: e.target.value})} placeholder="Title" className="w-full text-center text-xs font-bold text-secondary uppercase tracking-widest bg-surface border border-outline-variant/30 rounded-lg p-2 mb-6" />
            ) : (
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">{data.title || 'Operative'}</p>
            )}

            <div className="w-full space-y-3">
              <div className="p-4 bg-white rounded-xl border border-outline-variant/20 text-left">
                <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">System Status</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                    data.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  )}>{data.status}</span>
                  
                  {canEdit && !editMode && (
                    <button 
                      onClick={() => handleSuspend(data.id, data.status)}
                      className="text-[10px] font-bold text-primary underline"
                    >
                      {data.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-xl border text-left",
                editMode && role === 'ceo' ? "bg-amber-50 border-amber-300" : "bg-white border-outline-variant/20"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Corporate Email
                  </p>
                  {editMode && role === 'ceo' && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-[9px] font-black uppercase tracking-wider">CEO Editable</span>
                  )}
                </div>
                {editMode && role === 'ceo' ? (
                  <div className="space-y-2">
                    <input 
                      type="email"
                      value={editForm?.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-white border-2 border-amber-400 rounded-lg p-2.5 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-amber-400/40"
                      placeholder="firstname.lastname@enako.com"
                    />
                    <p className="text-[10px] text-amber-700 font-medium">This will update the employee's login email address.</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium truncate text-primary">{data.email}</p>
                )}
              </div>

              {canEdit && (
                <div className="pt-4 border-t border-outline-variant/20 w-full space-y-2">
                  {!editMode ? (
                    <button onClick={startEditMode} className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90">
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleEditSubmit} disabled={submitting} className="w-full py-3 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                        <Check className="w-4 h-4" /> Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="w-full py-3 border border-outline-variant/30 text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 content-start">
            
            {/* Organization Identity */}
            <section className="bg-surface-container-low/30 rounded-2xl p-6 border border-outline-variant/20">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Organization Identity
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Department</p>
                  {editMode ? (
                    <select value={data.department} onChange={e => setEditForm({...data, department: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none font-bold">
                      {['Engineering', 'Finance', 'Digital Marketing', 'Operations', 'Compliance', 'Management', 'HR', 'Outreach / NGO'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{data.department || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Role Level</p>
                  {editMode ? (
                    <select value={data.role} onChange={e => setEditForm({...data, role: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none font-bold">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="OUTREACH_MANAGER">Outreach Manager</option>
                      <option value="CEO">CEO</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{data.role}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Leadership Roles (Heads)</p>
                  {editMode ? (
                    <div className="bg-white border border-outline-variant/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {['Operations', 'Engineering', 'Finance', 'Compliance', 'Management', 'HR', 'Digital Marketer'].map(d => (
                        <label key={d} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface-container-low p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={(data.ledDepartments || []).includes(d)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = data.ledDepartments || [];
                              setEditForm({
                                ...data,
                                ledDepartments: checked ? [...current, d] : current.filter((dep: string) => dep !== d)
                              });
                            }}
                            className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                          />
                          {d} Head
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.ledDepartments?.length > 0 ? (
                        data.ledDepartments.map((d: string) => (
                          <span key={d} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest">{d} Head</span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-secondary">No leadership roles</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Overall Performance */}
            {(role === 'manager' || role === 'ceo') && (
              <section className="bg-surface-container-low/30 rounded-2xl p-6 border border-outline-variant/20 xl:col-span-2">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Overall Performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-outline-variant/30 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Logged In Time</p>
                    <p className="text-xl font-bold text-primary">
                      {data.performanceStats?.totalLoginTime 
                        ? `${Math.floor(data.performanceStats.totalLoginTime / 3600)} hrs ${Math.floor((data.performanceStats.totalLoginTime % 3600) / 60)} mins`
                        : '0 hrs 0 mins'}
                    </p>
                  </div>
                  <div className="bg-white border border-outline-variant/30 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Average Session</p>
                    <p className="text-xl font-bold text-primary">
                      {data.performanceStats?.averageLoginTime 
                        ? `${Math.floor(data.performanceStats.averageLoginTime / 3600)} hrs ${Math.floor((data.performanceStats.averageLoginTime % 3600) / 60)} mins`
                        : '0 hrs 0 mins'}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* HR & Payroll */}
            <section className="bg-surface-container-low/30 rounded-2xl p-6 border border-outline-variant/20">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Users className="w-4 h-4" /> HR & Payroll
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Employment Type</p>
                  {editMode ? (
                    <select value={data.employmentType} onChange={e => setEditForm({...data, employmentType: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none">
                      {['Full-Time', 'Part-Time', 'Contract'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{data.employmentType || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Salary (XAF)</p>
                  {editMode ? (
                    <input type="number" value={data.salary || ''} onChange={e => setEditForm({...data, salary: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                  ) : (
                    <p className="text-sm font-mono font-bold text-primary">{data.salary ? Number(data.salary).toLocaleString() : '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Hire Date</p>
                  {editMode ? (
                    <input type="date" value={data.hireDate ? new Date(data.hireDate).toISOString().split('T')[0] : ''} onChange={e => setEditForm({...data, hireDate: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                  ) : (
                    <p className="text-sm font-medium">{data.hireDate ? new Date(data.hireDate).toLocaleDateString() : '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Date of Birth</p>
                  {editMode ? (
                    <input type="date" value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setEditForm({...data, dateOfBirth: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                  ) : (
                    <p className="text-sm font-medium">{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : '—'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-surface-container-low/30 rounded-2xl p-6 border border-outline-variant/20">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Phone Number</p>
                    {editMode ? (
                      <input value={data.phone || ''} onChange={e => setEditForm({...data, phone: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                    ) : (
                      <p className="text-sm font-medium">{data.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Personal Email</p>
                    {editMode ? (
                      <input type="email" value={data.personalEmail || ''} onChange={e => setEditForm({...data, personalEmail: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                    ) : (
                      <p className="text-sm font-medium">{data.personalEmail || '—'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Home Address</p>
                  {editMode ? (
                    <input value={data.address || ''} onChange={e => setEditForm({...data, address: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                  ) : (
                    <p className="text-sm font-medium">{data.address || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Emergency Contact</p>
                  {editMode ? (
                    <input value={data.emergencyContact || ''} onChange={e => setEditForm({...data, emergencyContact: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none" />
                  ) : (
                    <p className="text-sm font-medium">{data.emergencyContact || '—'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Security & Access */}
            {canEdit && !editMode && (
              <section className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                <h4 className="text-[10px] font-bold text-red-700 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Security & Access
                </h4>
                
                <div className="space-y-4">
                  {!showResetPassword ? (
                    <div>
                      <p className="text-sm text-red-900 mb-3">If this operative has lost access, you can securely override their credentials.</p>
                      <button
                        onClick={() => setShowResetPassword(true)}
                        className="text-[10px] font-bold text-red-700 border border-red-200 bg-white px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors uppercase tracking-widest shadow-sm"
                      >
                        Reset Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (min 8 chars)"
                        className="flex-1 bg-white border border-red-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 shadow-sm"
                      />
                      <button type="submit" className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm">
                        Confirm
                      </button>
                      <button type="button" onClick={() => setShowResetPassword(false)} className="border border-red-200 text-red-700 bg-white px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 shadow-sm">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Organization Directory</h1>
          <p className="text-secondary text-base">Manage global headcount and operative deployment. {total} total.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Deploy Operative
        </button>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Search name, email, role…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </div>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Department</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading employees…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary">No employees found.</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt="Avatar" className="size-10 rounded-xl object-cover" />
                      ) : (
                        <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary text-sm">
                          {emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-primary">{emp.fullName}</p>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{emp.title ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                      {emp.department ?? '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{emp.role}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border w-fit',
                      emp.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    )}>{emp.status}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {(role === 'ceo' || role === 'manager') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewEmployee(emp); }}
                          className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        >
                          View Profile
                        </button>
                      )}
                      {role === 'ceo' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSuspend(emp.id, emp.status); }}
                          className={cn(
                            'text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all',
                            emp.status === 'ACTIVE' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100',
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

        <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
          <span>Showing {employees.length} of {total}</span>
          <div className="flex gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-primary transition-colors disabled:opacity-30">Previous</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={employees.length < 20} className="hover:text-primary transition-colors disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="text-2xl font-bold text-primary font-display">Create Employee Account</h3>
                  <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-1">Configure Personal Info, Department, Position, & Access</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-8 overflow-y-auto">
                
                {/* 1. Personal Information */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <User className="w-4 h-4 text-primary" /> 1. Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Full Name *</label>
                      <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Corporate Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="corporate@enako.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Temporary Password *</label>
                      <input required type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Min 8 characters" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="+237 6XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Personal Email</label>
                      <input type="email" value={form.personalEmail} onChange={e => setForm({ ...form, personalEmail: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="personal@gmail.com" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Home Address</label>
                      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Full residential address" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Date of Birth</label>
                      <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Emergency Contact</label>
                      <input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Name & Phone Number" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Hire Date</label>
                      <input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Employment Type</label>
                      <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                        <option>Full-Time</option>
                        <option>Part-Time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Salary / Monthly Compensation (XAF)</label>
                      <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 500000" />
                    </div>
                  </div>
                </section>

                {/* 2. Role */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <ShieldAlert className="w-4 h-4 text-primary" /> 2. Role Level Assignment *
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'EMPLOYEE', label: 'Employee', desc: 'Standard Operative & Departmental Access', icon: '👤' },
                      { id: 'MANAGER', label: 'Manager', desc: 'Departmental Leadership & Team Oversight', icon: '👔' },
                      { id: 'OUTREACH_MANAGER', label: 'Outreach Manager', desc: 'ENAKO Outreach Foundation & NGO Lead', icon: '🌍' },
                    ].map(r => (
                      <label key={r.id} className={cn(
                        "p-4 border rounded-2xl cursor-pointer flex flex-col justify-between transition-all",
                        form.role === r.id ? "border-primary bg-primary/5 text-primary shadow-xs font-bold" : "border-outline-variant/30 hover:bg-surface-container-low"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{r.icon}</span>
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
                            className="text-primary focus:ring-primary"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">{r.label}</p>
                          <p className="text-[10px] text-secondary mt-1 font-normal line-clamp-2">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Manager / Outreach Manager Dedicated Workspace Banner */}
                {form.role !== 'EMPLOYEE' ? (
                  <div className="p-5 bg-surface-container-low border border-primary/20 rounded-2xl flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {form.role === 'OUTREACH_MANAGER' ? '🌍' : '👔'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        {form.role === 'OUTREACH_MANAGER' ? 'Outreach Manager Workspace' : 'Department Manager Workspace'}
                      </p>
                      <p className="text-[11px] text-secondary mt-0.5 font-medium leading-relaxed">
                        {form.role === 'OUTREACH_MANAGER'
                          ? 'This manager account is automatically configured with dedicated access to the ENAKO Outreach Foundation & NGO Dashboard.'
                          : 'This manager account is automatically configured with full Departmental Manager Dashboard access and team supervision controls.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 3. Department (For Employees Only) */}
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                        <Briefcase className="w-4 h-4 text-primary" /> 3. Department Assignment
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
                            "p-3.5 border rounded-2xl cursor-pointer flex items-center justify-between transition-all",
                            form.department === d ? "border-primary bg-primary/5 text-primary font-bold shadow-xs" : "border-outline-variant/30 hover:bg-surface-container-low"
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
                              className="text-primary focus:ring-primary"
                            />
                          </label>
                        ))}
                      </div>
                    </section>

                    {/* 4. Position (For Employees Only) */}
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                        <Activity className="w-4 h-4 text-primary" /> 4. Job Position ({form.department} Department)
                      </h4>
                      <div>
                        <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Select Position / Job Title *</label>
                        <select
                          required
                          value={form.position}
                          onChange={e => setForm({ ...form, position: e.target.value, title: e.target.value })}
                          className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
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
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <Check className="w-4 h-4 text-primary" /> 5. Core Responsibilities
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Key Operational Responsibilities & Duties</label>
                    <textarea rows={3} value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="List core daily responsibilities, key functions, and deliverables..." />
                  </div>
                </section>

                {/* 6. Goals */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <Users className="w-4 h-4 text-primary" /> 6. Initial Employee Goals
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Assigned Goals & Objectives</label>
                    <textarea rows={3} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Define quarterly targets, KPIs, and deliverables for this employee..." />
                  </div>
                </section>

                {/* 7. Permissions */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <ShieldAlert className="w-4 h-4 text-primary" /> 7. Permissions & Access Control
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">System Access Level</label>
                    <select value={form.permissions} onChange={e => setForm({ ...form, permissions: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="Standard Operations Access">Standard Operations Access (Department Dashboard & Tasks)</option>
                      <option value="Executive Management Access">Executive Management Access (Financial & Operational Reports)</option>
                      <option value="Full System Administrative Privileges">Full System Administrative Privileges (CEO Controls & User Edit)</option>
                    </select>
                  </div>
                </section>

                <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 border border-outline-variant/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-60">
                    {submitting ? 'Creating Employee…' : 'Create Employee'}
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
