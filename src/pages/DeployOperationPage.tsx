import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowRightLeft,
  X,
  Shield,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Operations',
  'Digital Marketing',
  'Compliance',
  'Management',
  'HR',
  'Outreach / NGO'
];

export default function DeployOperationPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const canManage = role === 'ceo' || role === 'manager' || role === 'admin';

  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Operations');
  const [employees, setEmployees] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reassignment Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedEmployeeToReassign, setSelectedEmployeeToReassign] = useState<any>(null);
  const [targetDepartment, setTargetDepartment] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  // Load available departments
  const loadDepartments = useCallback(async () => {
    try {
      const res = await api.departments();
      if (Array.isArray(res) && res.length > 0) {
        setDepartments(res);
        if (!selectedDepartment) {
          setSelectedDepartment(res[0].name);
        }
      } else {
        setDepartments(DEFAULT_DEPARTMENTS.map(d => ({ id: `dept-${d.toLowerCase()}`, name: d, _count: { users: 0 } })));
      }
    } catch {
      setDepartments(DEFAULT_DEPARTMENTS.map(d => ({ id: `dept-${d.toLowerCase()}`, name: d, _count: { users: 0 } })));
    }
  }, [selectedDepartment]);

  // Load employees for selected department
  const loadDepartmentEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // Load both department-specific and all employees for count & reassign dropdown
      const [deptRes, allRes] = await Promise.all([
        api.employees({ department: selectedDepartment, limit: 100 }),
        api.employees({ limit: 300 })
      ]);

      const deptItems = deptRes?.items || [];
      const allItems = allRes?.items || [];
      setEmployees(deptItems);
      setAllEmployees(allItems);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load departmental personnel');
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentEmployees();
    }
  }, [selectedDepartment, loadDepartmentEmployees]);

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeToReassign || !targetDepartment) {
      toast.error('Please select a valid employee and target department');
      return;
    }

    setReassigning(true);
    try {
      await api.updateEmployee(selectedEmployeeToReassign.id, {
        department: targetDepartment,
      });

      toast.success(`${selectedEmployeeToReassign.fullName} successfully deployed to ${targetDepartment}!`);
      setShowReassignModal(false);
      setSelectedEmployeeToReassign(null);
      loadDepartmentEmployees();
      loadDepartments();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reassign operative');
    } finally {
      setReassigning(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.title && emp.title.toLowerCase().includes(q)) ||
      (emp.role && emp.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link to="/app/employees" className="hover:text-slate-800 transition-colors">
              Human Resources
            </Link>
            <span>/</span>
            <Link to="/app/employees" className="hover:text-slate-800 transition-colors">
              Employees
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Deploy Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Deploy Operations & Departmental Staff Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review operational unit assignments, deploy team members, and inspect departmental workforce rosters.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManage && (
            <button
              onClick={() => {
                setSelectedEmployeeToReassign(employees[0] || allEmployees[0] || null);
                setTargetDepartment(departments[0]?.name || 'Operations');
                setShowReassignModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Deploy / Reassign Staff
            </button>
          )}

          <Link
            to="/app/employees"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Directory
          </Link>

          <button
            onClick={() => { loadDepartments(); loadDepartmentEmployees(); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* NO CARDS ON THIS PAGE PER SPECIFICATION */}

      {/* Department Selector & Search Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
        {/* Department Dropdown Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#001f5b]" />
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Department:
            </label>
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSearch('');
            }}
            className="px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all cursor-pointer min-w-[240px]"
          >
            {departments.map((dept) => {
              const name = dept.name;
              const count = dept._count?.users ?? allEmployees.filter(e => (e.department?.name || e.department) === name).length;
              return (
                <option key={dept.id || name} value={name}>
                  {name} ({count} Operatives)
                </option>
              );
            })}
          </select>
        </div>

        {/* Search within department */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search within ${selectedDepartment}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Selected Department Overview Banner */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {selectedDepartment} Unit Roster
            </h2>
            <p className="text-xs text-slate-500">
              Showing active operatives deployed to this functional area.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold self-start sm:self-auto">
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs font-bold text-slate-800">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Operative' : 'Operatives'} Assigned
          </span>
        </div>
      </div>

      {/* Department Employees Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Assigned Personnel & Roles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified corporate credentials and active workflow responsibilities.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filteredEmployees.length} Found
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-medium text-slate-500 animate-pulse">
            Loading departmental roster...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No operatives currently assigned</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No personnel are currently deployed to <strong>{selectedDepartment}</strong>. Use the button above to assign an operative to this department.
            </p>
            {canManage && (
              <button
                onClick={() => {
                  setSelectedEmployeeToReassign(allEmployees[0] || null);
                  setTargetDepartment(selectedDepartment);
                  setShowReassignModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Deploy Employee to {selectedDepartment}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Operative</th>
                  <th className="px-5 py-3">Role & Access</th>
                  <th className="px-5 py-3">Corporate Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Hire Date</th>
                  {canManage && <th className="px-5 py-3 text-right">Deployment</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#001f5b] text-xs">
                            {emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#001f5b] transition-colors">
                            {emp.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {emp.title || 'Operative'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {emp.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">
                      {emp.phone || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-block",
                        emp.status === 'ACTIVE'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[11px] text-slate-500">
                      {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Registered'}
                    </td>

                    {canManage && (
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedEmployeeToReassign(emp);
                            setTargetDepartment(selectedDepartment);
                            setShowReassignModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#001f5b] hover:bg-[#001f5b]/5 border border-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Reassign
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deploy / Reassign Modal */}
      <AnimatePresence>
        {showReassignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#001f5b]" />
                  <h3 className="font-bold text-slate-900 text-sm">Deploy / Reassign Operative</h3>
                </div>
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReassignSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Select Operative
                  </label>
                  <select
                    value={selectedEmployeeToReassign?.id || ''}
                    onChange={(e) => {
                      const found = allEmployees.find(emp => emp.id === e.target.value);
                      setSelectedEmployeeToReassign(found || null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                  >
                    {allEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.department?.name || emp.department || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Target Operational Department
                  </label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id || d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                  Deploying this operative will automatically update their organizational records, operational access, and system notifications.
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reassigning}
                    className="px-5 py-2 bg-[#001f5b] text-white rounded-lg text-xs font-bold hover:bg-[#001744] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {reassigning ? 'Deploying...' : 'Confirm Deployment'}
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
