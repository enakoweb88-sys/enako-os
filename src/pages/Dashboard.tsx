import React from 'react';
import { useAuth } from '../lib/auth';
import { CEODashboard } from './dashboards/CeoDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { EmployeeDashboard } from './dashboards/EmployeeDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { BDOfficerDashboard } from './dashboards/BDOfficerDashboard';
import { DigitalDashboard } from './dashboards/DigitalDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SupportDashboard } from './dashboards/SupportDashboard';
import { HeadDashboard } from './dashboards/HeadDashboard';
import { EngineeringDashboard } from './dashboards/EngineeringDashboard';
import OutreachOverview from './dashboards/outreach/OutreachOverview';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';
  const dept = (user?.department?.name || user?.department || '').toString().toLowerCase();
  const isHead = (user?.ledDepartments?.length ?? 0) > 0;

  const activeDepartment = () => {
    if (role === 'ceo') return 'ceo';
    if (role === 'manager' || dept.includes('management') || dept.includes('executive') || dept.includes('strategy') || dept.includes('director')) return 'manager';
    if (role === 'outreach_manager') return 'outreach';

    if (role === 'engineering' || dept.includes('engineering') || dept.includes('software') || dept.includes('tech') || dept.includes('developer') || dept.includes('dev')) return 'engineering';
    if (role === 'finance' || dept.includes('finance') || dept.includes('account')) return 'finance';
    if (role === 'digital' || dept.includes('digital') || dept.includes('marketing') || dept.includes('media') || dept.includes('communication')) return 'digital';
    if (role === 'bd' || dept.includes('business') || dept.includes('sales') || dept.includes('bd')) return 'bd';
    if (role === 'support' || dept.includes('support') || dept.includes('customer') || dept.includes('help')) return 'support';
    if (role === 'admin' || dept.includes('admin') || dept.includes('hr') || dept.includes('human')) return 'admin';
    if (dept.includes('outreach') || dept.includes('community')) return 'outreach';

    return 'employee';
  };

  const currentDept = activeDepartment();

  const getDashboardTitle = () => {
    switch(currentDept) {
      case 'ceo': return 'Enterprise Command Center';
      case 'manager': return 'Management Strategy & Operations Hub';
      case 'engineering': return 'Engineering & Software Architecture Center';
      case 'finance': return 'Financial Overview & Accounting Workspace';
      case 'bd': return 'Business Development & Sales Hub';
      case 'digital': return 'Digital Marketing & Social Media Command Center';
      case 'admin': return 'HR & Administrative Hub';
      case 'support': return 'Customer Support & Help Desk Center';
      case 'outreach': return 'Outreach & Community Impact Hub';
      default: return 'My Workspace';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary">
            {getDashboardTitle()}
          </h2>
          <p className="text-secondary text-base">
            Welcome back, <span className="text-primary font-bold">{user?.fullName}</span>. System status is nominal.
          </p>
        </div>
      </div>

      {currentDept === 'ceo' && <CEODashboard />}
      {currentDept === 'manager' && <ManagerDashboard />}
      {currentDept === 'engineering' && <EngineeringDashboard />}
      {currentDept === 'finance' && <FinanceDashboard />}
      {currentDept === 'bd' && <BDOfficerDashboard />}
      {currentDept === 'digital' && <DigitalDashboard />}
      {currentDept === 'admin' && <AdminDashboard />}
      {currentDept === 'support' && <SupportDashboard />}
      {currentDept === 'outreach' && <OutreachOverview />}
      {currentDept === 'employee' && isHead && <HeadDashboard />}
      {currentDept === 'employee' && !isHead && <EmployeeDashboard />}
    </div>
  );
}
