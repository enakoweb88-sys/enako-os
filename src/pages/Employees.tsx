import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Mail, Phone, Briefcase, X, Plus, RefreshCw, ArrowLeft, Edit2, Check, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

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
    fullName: '', email: '', phone: '', title: '',
    role: 'EMPLOYEE', department: 'Operations', password: '',
    dateOfBirth: '', address: '', personalEmail: '', employmentType: 'Full-Time',
    salary: '', emergencyContact: '', hireDate: '', ledDepartments: [] as string[],
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
      
      // Update viewEmployee if it was open
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
      await api.createEmployee(form);
      setShowModal(false);
      setForm({ fullName: '', email: '', phone: '', title: '', role: 'EMPLOYEE', department: 'Operations', password: '', dateOfBirth: '', address: '', personalEmail: '', employmentType: 'Full-Time', salary: '', emergencyContact: '', hireDate: '', ledDepartments: [] });
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
    setSubmitting(true);
    try {
      const payload = {
        fullName: editForm.fullName,
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
      await api.updateEmployee(viewEmployee.id, payload);
      setEditMode(false);
      load(); // Will refresh list and current viewEmployee
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Users className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Access Restricted</h2>
        <p className="text-secondary max-w-sm">The organization directory is only accessible by management and executive nodes.</p>
      </div>
    );
  }

  if (viewEmployee) {
    const data = editMode ? editForm : viewEmployee;
    const canEdit = role === 'ceo' || role === 'manager';

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

              <div className="p-4 bg-white rounded-xl border border-outline-variant/20 text-left">
                <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Corporate Email</p>
                <p className="text-sm font-medium truncate">{data.email}</p>
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
                    <select value={data.department} onChange={e => setEditForm({...data, department: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none">
                      {['Operations', 'Engineering', 'Finance', 'Compliance', 'Management', 'HR', 'Digital Marketer'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{data.department || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">Role Level</p>
                  {editMode ? (
                    <select value={data.role} onChange={e => setEditForm({...data, role: e.target.value})} className="w-full bg-white border border-outline-variant/30 rounded-lg p-2 text-sm outline-none">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-bold text-primary">Deploy New Operative</h3>
                  <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-1">Create employee account</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Full Name *</label>
                    <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="name@company.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="+237 6XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Lead Engineer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Role *</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CEO">CEO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Department</label>
                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      {['Operations', 'Engineering', 'Finance', 'Compliance', 'Management', 'HR', 'Digital Marketer'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Leads Departments</label>
                    <div className="bg-surface border border-outline-variant/30 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                      {['Operations', 'Engineering', 'Finance', 'Compliance', 'Management', 'HR', 'Digital Marketer'].map(d => (
                        <label key={d} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface-container-low p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={form.ledDepartments.includes(d)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm({
                                ...form,
                                ledDepartments: checked ? [...form.ledDepartments, d] : form.ledDepartments.filter(dep => dep !== d)
                              });
                            }}
                            className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                          />
                          {d} Head
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Employment Type</label>
                    <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      {['Full-Time', 'Part-Time', 'Contract'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Salary / Compensation (XAF)</label>
                    <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. 500000" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Home Address</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Full residential address" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Personal Email</label>
                    <input type="email" value={form.personalEmail} onChange={e => setForm({ ...form, personalEmail: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="personal@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Emergency Contact</label>
                    <input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Name & Phone" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Hire Date</label>
                    <input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Temporary Password *</label>
                    <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Min 8 characters" minLength={8} />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-60">
                    {submitting ? 'Creating…' : 'Deploy Operative'}
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
