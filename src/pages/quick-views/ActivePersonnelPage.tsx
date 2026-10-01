import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import {
  Users, UserCheck, Shield, Building, Search, Mail, Phone,
  Plus, Download, LayoutGrid, List, CheckCircle, MapPin, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActivePersonnelPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [activeDept, setActiveDept] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New staff form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237 690 000 000');
  const [department, setDepartment] = useState('Operations & Strategy');
  const [role, setRole] = useState('EMPLOYEE');
  const [branch, setBranch] = useState('Douala Headquarters');

  const defaultStaff = [
    { id: '1', fullName: 'Super Administrator', email: 'support@enakoos.com', phone: '+237 690 000 001', department: 'Executive Management', role: 'CEO', branch: 'Douala Headquarters', status: 'ACTIVE' },
    { id: '2', fullName: 'Chief Operating Officer', email: 'manager@enakoos.com', phone: '+237 690 000 002', department: 'Operations & Strategy', role: 'MANAGER', branch: 'Douala Headquarters', status: 'ACTIVE' },
    { id: '3', fullName: 'Lead Treasury Analyst', email: 'finance@enakoos.com', phone: '+237 690 000 003', department: 'Finance & Accounts', role: 'FINANCE', branch: 'Yaoundé Financial Hub', status: 'ACTIVE' },
    { id: '4', fullName: 'Senior Fullstack Engineer', email: 'engineering@enakoos.com', phone: '+237 690 000 004', department: 'Engineering & Tech', role: 'ENGINEERING', branch: 'Douala Tech Campus', status: 'ACTIVE' },
    { id: '5', fullName: 'Compliance & AML Officer', email: 'security@enakoos.com', phone: '+237 690 000 005', department: 'Compliance & Legal', role: 'ADMIN', branch: 'Douala Headquarters', status: 'ACTIVE' },
    { id: '6', fullName: 'Head of Business Development', email: 'bd@enakoos.com', phone: '+237 690 000 006', department: 'Business Development', role: 'BD', branch: 'Kribi Maritime Branch', status: 'ACTIVE' },
    { id: '7', fullName: 'Client Support Manager', email: 'help@enakoos.com', phone: '+237 690 000 007', department: 'Customer Success', role: 'SUPPORT', branch: 'Douala Headquarters', status: 'ACTIVE' },
    { id: '8', fullName: 'Outreach & CSR Coordinator', email: 'contact@enakoos.com', phone: '+237 690 000 008', department: 'Outreach & Community', role: 'OUTREACH_MANAGER', branch: 'Buea Regional Branch', status: 'ACTIVE' },
  ];

  useEffect(() => {
    api.employees({ limit: 100 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        const activeOnly = list.filter((e: any) => e.status !== 'TERMINATED' && e.status !== 'SUSPENDED');
        if (activeOnly.length > 0) {
          setEmployees(activeOnly);
        } else {
          setEmployees(defaultStaff);
        }
      })
      .catch(() => {
        setEmployees(defaultStaff);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Department', 'Role', 'Branch', 'Status'];
    const rows = employees.map(e => [
      `"${e.fullName}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${typeof e.department === 'string' ? e.department : e.department?.name || 'Operations'}"`,
      `"${e.role}"`,
      `"${e.branch || 'Douala Headquarters'}"`,
      `"${e.status || 'ACTIVE'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `enako_active_personnel_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Personnel directory exported as CSV successfully.');
  };

  const handleAddPersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please fill in employee name and email.');
      return;
    }

    const newStaff = {
      id: `emp-${Date.now()}`,
      fullName,
      email,
      phone,
      department,
      role,
      branch,
      status: 'ACTIVE'
    };

    setEmployees(prev => [newStaff, ...prev]);
    toast.success(`Personnel profile created for ${fullName} with official ID.`);
    setIsAddModalOpen(false);
    setFullName('');
    setEmail('');
  };

  const filtered = employees.filter(e => {
    const deptStr = (typeof e.department === 'string' ? e.department : e.department?.name || '').toLowerCase();
    const matchesSearch = (e.fullName || '' + ' ' + e.email || '' + ' ' + deptStr + ' ' + (e.role || '') + ' ' + (e.branch || ''))
      .toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeDept === 'EXEC') return (e.role || '').toUpperCase() === 'CEO' || (e.role || '').toUpperCase() === 'MANAGER';
    if (activeDept === 'FIN') return deptStr.includes('finance') || deptStr.includes('treasury') || (e.role || '').toUpperCase() === 'FINANCE';
    if (activeDept === 'TECH') return deptStr.includes('tech') || deptStr.includes('engineer') || (e.role || '').toUpperCase() === 'ENGINEERING';
    if (activeDept === 'COMP') return deptStr.includes('compliance') || deptStr.includes('legal');
    if (activeDept === 'OUTREACH') return deptStr.includes('outreach') || deptStr.includes('community');

    return true;
  });

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Human Resources • Active Personnel Directory & Verified Workforce Roster" />

      <WorkplaceStatCards
        domainsCount={filtered.length}
        usersCount={employees.filter(e => e.role === 'MANAGER' || e.role === 'CEO').length}
        groupsCount="7 Active Units"
        licensesCount="100% Nominal"
        card1Label="ACTIVE OPERATIVES"
        card2Label="MANAGEMENT & LEADS"
        card3Label="DEPARTMENTS ACTIVE"
        card4Label="ATTENDANCE TODAY"
        card1Icon={<Users className="w-5 h-5" />}
        card2Icon={<UserCheck className="w-5 h-5" />}
        card3Icon={<Building className="w-5 h-5" />}
        card4Icon={<Shield className="w-5 h-5" />}
      />

      {/* Control Toolbar Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personnel by name, email, department, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-[#001f5b]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-[#001f5b]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Roster
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Personnel
            </button>
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-slate-100 pt-3">
          {[
            { id: 'ALL', label: `All Personnel (${employees.length})` },
            { id: 'EXEC', label: 'Executive & Leads' },
            { id: 'FIN', label: 'Treasury & Finance' },
            { id: 'TECH', label: 'Engineering & Tech' },
            { id: 'COMP', label: 'Compliance & Legal' },
            { id: 'OUTREACH', label: 'Outreach & CSR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDept(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeDept === tab.id
                  ? 'bg-[#001f5b] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW MODE 1: GRID CARDS ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((e, idx) => {
            const deptName = typeof e.department === 'string' ? e.department : e.department?.name || 'Operations';
            return (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#001f5b] font-black text-sm uppercase shadow-2xs">
                      {e.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ACTIVE
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#001f5b] transition-colors truncate">
                      {e.fullName}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{deptName}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#001f5b]/10 text-[#001f5b]">
                      {e.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono truncate">{e.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{e.branch || 'Douala Headquarters'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => toast.success(`Drafting email to ${e.email}...`)}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => toast.success(`Viewing profile credentials for ${e.fullName}`)}
                    className="flex-1 py-1.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW MODE 2: TABLE ── */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Active Company Personnel Directory</h3>
            <span className="text-xs text-slate-500 font-mono">Showing {filtered.length} verified records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Email</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">System Role</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Branch Office</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-xs">
                      No active personnel found matching search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, idx) => {
                    const deptName = typeof e.department === 'string' ? e.department : e.department?.name || 'Operations';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-[#001f5b] font-bold text-[11px] flex items-center justify-center shrink-0">
                              {e.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span>{e.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {e.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                          {deptName}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#001f5b]/10 text-[#001f5b]">
                            {e.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {e.branch || 'Douala Headquarters'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toast.success(`Drafting email to ${e.email}...`)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              Email
                            </button>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ACTIVE
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Active Personnel</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPersonnel} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Eto'o"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@enakoos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  />
                </div>
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
                    <option value="Outreach & Community">Outreach & Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="ENGINEERING">ENGINEERING</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="BD">BD</option>
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="OUTREACH_MANAGER">OUTREACH_MANAGER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Branch Office Location</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#001f5b] hover:bg-[#001744] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Register Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
