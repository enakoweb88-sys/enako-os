import React, { useAuth } from '../lib/auth';
import { CEODashboard } from './dashboards/CeoDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { EmployeeDashboard } from './dashboards/EmployeeDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { BDOfficerDashboard } from './dashboards/BDOfficerDashboard';
import { DigitalDashboard } from './dashboards/DigitalDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SupportDashboard } from './dashboards/SupportDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const getDashboardTitle = () => {
    switch(role) {
      case 'ceo': return 'Enterprise Command Center';
      case 'manager': return 'Operations Dashboard';
      case 'finance': return 'Financial Overview';
      case 'bd': return 'Business Development';
      case 'digital': return 'Digital Command Center';
      case 'admin': return 'HR & Admin Hub';
      case 'support': return 'Customer Support Center';
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

      {role === 'ceo' && <CEODashboard />}
      {role === 'manager' && <ManagerDashboard />}
      {role === 'finance' && <FinanceDashboard />}
      {role === 'bd' && <BDOfficerDashboard />}
      {role === 'digital' && <DigitalDashboard />}
      {role === 'admin' && <AdminDashboard />}
      {role === 'support' && <SupportDashboard />}
      {role === 'employee' && <EmployeeDashboard />}
      {/* Fallback if role is unmapped but exists */}
      {!['ceo', 'manager', 'finance', 'bd', 'digital', 'admin', 'support', 'employee'].includes(role) && <EmployeeDashboard />}
    </div>
  );
}
