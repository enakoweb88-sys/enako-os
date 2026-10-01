import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

const ALL_POSITIONS_MAP: Record<string, string[]> = {
  'Engineering': ['Backend Engineer', 'Frontend Engineer', 'Full Stack Developer', 'DevOps / Infrastructure Engineer', 'Mobile Developer (iOS/Android)', 'QA / Software Test Engineer', 'Cybersecurity Specialist', 'Software Architect'],
  'Finance': ['Financial Analyst', 'Treasury & FX Officer', 'Accountant / Bookkeeper', 'B2B Settlement Specialist', 'Payroll Administrator', 'Tax & Audit Specialist', 'Risk & Loss Prevention Officer'],
  'Digital Marketing': ['Social Media Manager', 'Content Creator & Copywriter', 'Growth & Paid Ads Marketer', 'SEO & Web Analytics Specialist', 'Video Producer & Graphic Designer', 'Brand Strategy Officer'],
  'Operations': ['Operations Officer', 'Mobile Money Float Coordinator', 'Customer Operations Specialist', 'Logistics & Branch Coordinator', 'Process & Workflow Associate'],
  'Compliance': ['Compliance & Regulatory Officer', 'KYC / AML Analyst', 'Financial Crime Prevention Specialist', 'Data Protection & Privacy Officer', 'Internal Audit Inspector'],
  'Management': ['Strategic Planning Associate', 'Executive Operations Assistant', 'Departmental Coordinator', 'KPI Performance Analyst', 'Project Management Specialist'],
  'HR': ['HR Generalist', 'Talent Acquisition / Recruiter', 'Onboarding & Culture Specialist', 'Employee Relations Associate', 'Training & Development Officer'],
  'Outreach / NGO': ['Outreach Manager', 'Field Operations Coordinator', 'Fundraising & Grants Specialist', 'Community Liaison Officer', 'Scholarship Administrator'],
};

export default function DepartmentsPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';
  const canReassign = role === 'ceo' || role === 'manager';

  const [searchParams, setSearchParams] = useSearchParams();
  const paramDept = searchParams.get('dept');

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [search, setSearch] = useState('');

  // Reassign Modal State
  const [reassigningEmployee, setReassigningEmployee] = useState<any | null>(null);
  const [targetDept, setTargetDept] = useState<string>('Engineering');
  const [targetPosition, setTargetPosition] = useState<string>('Backend Engineer');
  const [savingReassign, setSavingReassign] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.employees({ limit: 1000 });
      const items: any[] = res.items || [];
      setEmployees(items);
    } catch (e: any) {
      toast.error('Failed to load employee roster');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group employees by department
  const departmentGroups: Record<string, any[]> = {};
  employees.forEach((emp) => {
    const dept = (emp.department || '').trim();
    if (dept) {
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(emp);
    }
  });

  // ONLY list departments that currently have assigned employees
  const activeDepartments = Object.keys(departmentGroups)
    .filter((d) => departmentGroups[d].length > 0)
    .sort();

  // Ensure selectedDept points to the paramDept or a valid department with employees
  useEffect(() => {
    if (activeDepartments.length > 0) {
      if (paramDept && activeDepartments.includes(paramDept)) {
        setSelectedDept(paramDept);
      } else if (!selectedDept || !departmentGroups[selectedDept] || departmentGroups[selectedDept].length === 0) {
        setSelectedDept(activeDepartments[0]);
      }
    }
  }, [activeDepartments, selectedDept, paramDept]);

  // Operatives in the currently selected department
  const currentDeptEmployees = (departmentGroups[selectedDept] || []).filter((emp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.title && emp.title.toLowerCase().includes(q)) ||
      (emp.role && emp.role.toLowerCase().includes(q))
    );
  });

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningEmployee) return;

    setSavingReassign(true);
    try {
      await api.updateEmployee(reassigningEmployee.id, {
        department: targetDept,
        title: targetPosition,
      });
      toast.success(`${reassigningEmployee.fullName} moved to ${targetDept}`);
      setReassigningEmployee(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reassign department.');
    } finally {
      setSavingReassign(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-20">
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
            <span className="text-[#001f5b] font-bold">Departments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Department Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active organizational units and employee assignments across the firm.
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
            to="/app/employees"
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            All Employees
          </Link>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Department Selector Bar (Dropdown of departments with employees only) */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Select Department ({activeDepartments.length} Active Departments)
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDept(val);
                setSearchParams({ dept: val });
                setSearch('');
              }}
              className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]"
            >
              {activeDepartments.length === 0 ? (
                <option value="">No departments with assigned employees</option>
              ) : (
                activeDepartments.map((dept) => {
                  const count = (departmentGroups[dept] || []).length;
                  return (
                    <option key={dept} value={dept}>
                      {dept} — {count} {count === 1 ? 'employee' : 'employees'}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div className="w-full sm:w-72 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Search Within Department
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Employee List Table (Strictly NO cards on this page) */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {selectedDept || 'Department'} Operatives
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing employees assigned to {selectedDept || 'this department'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#001f5b] bg-[#001f5b]/10 px-2.5 py-1 rounded-md">
            {currentDeptEmployees.length} {currentDeptEmployees.length === 1 ? 'Operative' : 'Operatives'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Position / Title
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Role Level
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                {canReassign && (
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                    Loading department operatives...
                  </td>
                </tr>
              ) : currentDeptEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                    No employees found in {selectedDept}.
                  </td>
                </tr>
              ) : (
                currentDeptEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{emp.title || 'Operative'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-slate-600">{emp.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-block',
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {canReassign && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setReassigningEmployee(emp);
                            setTargetDept(emp.department || 'Engineering');
                            const positions = ALL_POSITIONS_MAP[emp.department || 'Engineering'] || [];
                            setTargetPosition(positions[0] || emp.title || 'Operative');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          Reassign
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Department Modal */}
      {reassigningEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Reassign Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Moving {reassigningEmployee.fullName} to another operational unit.
              </p>
            </div>

            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Target Department
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setTargetDept(dept);
                    const positions = ALL_POSITIONS_MAP[dept] || [];
                    setTargetPosition(positions[0] || 'Operative');
                  }}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]"
                >
                  {Object.keys(ALL_POSITIONS_MAP).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  New Position / Title
                </label>
                <select
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]"
                >
                  {(ALL_POSITIONS_MAP[targetDept] || []).map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassigningEmployee(null)}
                  className="flex-1 py-2.5 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReassign}
                  className="flex-1 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {savingReassign ? 'Reassigning...' : 'Confirm Reassign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
