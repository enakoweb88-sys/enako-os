import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

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

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: 'Backend Engineer',
    role: 'EMPLOYEE',
    department: 'Engineering',
    password: '',
    dateOfBirth: '',
    address: '',
    personalEmail: '',
    employmentType: 'Full-Time',
    salary: '',
    emergencyContact: '',
    hireDate: '',
    position: 'Backend Engineer',
    responsibilities: '',
    goals: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        title: form.position || form.title,
        role: form.role,
        department: form.department,
        password: form.password,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address || undefined,
        personalEmail: form.personalEmail || undefined,
        employmentType: form.employmentType,
        salary: form.salary ? Number(form.salary) : undefined,
        emergencyContact: form.emergencyContact || undefined,
        hireDate: form.hireDate || undefined,
        responsibilities: form.responsibilities || undefined,
        goals: form.goals || undefined,
      };

      await api.createEmployee(payload);
      toast.success(`Employee ${form.fullName} created successfully!`);
      navigate('/app/employees');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employee profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-20 max-w-4xl mx-auto">
      {/* Header & Breadcrumbs (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Human Resources</span>
            <span>/</span>
            <Link to="/app/employees" className="hover:underline text-slate-500">
              Employees
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Add Employee</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add New Employee
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure personal information, department assignment, job position, and access credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/employees"
            className="px-3.5 py-1.5 border border-slate-200/90 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            Back to Directory
          </Link>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-6 sm:p-8 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Personal Particulars */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Personal & Contact Particulars
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Jean-Luc Nde"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Corporate Email *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@enako.com"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Temporary Password *
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Personal Email
                </label>
                <input
                  type="email"
                  value={form.personalEmail}
                  onChange={e => setForm({ ...form, personalEmail: e.target.value })}
                  placeholder="personal@gmail.com"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="City, District, Street address"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="Name & contact phone number"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Employment Type */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Contract & Compensation Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Employment Type
                </label>
                <select
                  value={form.employmentType}
                  onChange={e => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                >
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Hire / Commencement Date
                </label>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={e => setForm({ ...form, hireDate: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Monthly Compensation (FCFA)
                </label>
                <input
                  type="number"
                  value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. 450000"
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Role Level */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              3. Organization Role Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'EMPLOYEE', label: 'Employee', desc: 'Standard operative and departmental access permissions' },
                { id: 'MANAGER', label: 'Manager', desc: 'Departmental leadership and direct team supervision' },
                { id: 'OUTREACH_MANAGER', label: 'Outreach Manager', desc: 'ENAKO Outreach Foundation lead and community oversight' },
              ].map(r => (
                <label
                  key={r.id}
                  className={cn(
                    "p-3.5 border rounded-lg cursor-pointer flex flex-col justify-between transition-colors",
                    form.role === r.id
                      ? "border-[#001f5b] bg-[#001f5b]/5 text-slate-900 font-bold"
                      : "border-slate-200/90 bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider">{r.label}</span>
                    <input
                      type="radio"
                      name="role_level"
                      value={r.id}
                      checked={form.role === r.id}
                      onChange={e => {
                        const sel = e.target.value;
                        if (sel === 'OUTREACH_MANAGER') {
                          const pos = (DEPARTMENT_POSITIONS['Outreach / NGO'] || [])[0] || 'Outreach Manager';
                          setForm({ ...form, role: sel, department: 'Outreach / NGO', position: pos, title: pos });
                        } else if (sel === 'MANAGER') {
                          setForm({ ...form, role: sel, department: 'Management', position: 'Department Manager', title: 'Department Manager' });
                        } else {
                          const pos = (DEPARTMENT_POSITIONS['Engineering'] || [])[0] || 'Backend Engineer';
                          setForm({ ...form, role: sel, department: 'Engineering', position: pos, title: pos });
                        }
                      }}
                      className="text-[#001f5b]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">{r.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Department & Position */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              4. Department & Position Assignment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Assigned Department *
                </label>
                <select
                  value={form.department}
                  onChange={e => {
                    const dept = e.target.value;
                    const positions = DEPARTMENT_POSITIONS[dept] || [];
                    const firstPos = positions[0] || '';
                    setForm({ ...form, department: dept, position: firstPos, title: firstPos });
                  }}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                >
                  {Object.keys(DEPARTMENT_POSITIONS).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Assigned Job Title / Position *
                </label>
                <select
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value, title: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                >
                  {(DEPARTMENT_POSITIONS[form.department] || []).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Responsibilities & Initial Goals */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              5. Responsibilities & Objectives
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Key Operational Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={form.responsibilities}
                  onChange={e => setForm({ ...form, responsibilities: e.target.value })}
                  placeholder="Detail the operational deliverables, workflows, and core expectations for this employee..."
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Initial Quarterly Goals / Targets
                </label>
                <textarea
                  rows={3}
                  value={form.goals}
                  onChange={e => setForm({ ...form, goals: e.target.value })}
                  placeholder="Specify performance benchmarks, KPIs, and deliverables..."
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/app/employees"
              className="px-4 py-2 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {submitting ? 'Creating Employee...' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
