import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './lib/auth';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Chat from './pages/Chat';
import StaffMeals from './pages/StaffMeals';
import Announcements from './pages/Announcements';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import KYC from './pages/KYC';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Leads from './pages/Leads';
import Tickets from './pages/Tickets';
import Content from './pages/Content';
import Leaves from './pages/Leaves';
import ApiDocs from './pages/ApiDocs';
import Help from './pages/Help';
import Investments from './pages/Investments';
import DashboardLayout from './layouts/DashboardLayout';

// Outreach Manager Pages
import OutreachEvents from './pages/dashboards/outreach/OutreachEvents';
import OutreachApplications from './pages/dashboards/outreach/OutreachApplications';
import OutreachCMS from './pages/dashboards/outreach/OutreachCMS';
import OutreachNewsletters from './pages/dashboards/outreach/OutreachNewsletters';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/select-role" element={<RoleSelect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER']}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER']}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="kyc"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER']}>
                  <KYC />
                </ProtectedRoute>
              }
            />
            <Route path="expenses" element={<Expenses />} />
            <Route path="goals" element={<Goals />} />
            <Route path="chat" element={<Chat />} />
            <Route path="meals" element={<StaffMeals />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="leads" element={<Leads />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="support" element={<Navigate to="/app/tickets" replace />} />
            <Route path="content" element={<Content />} />
            <Route path="marketing" element={<Content />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="investments" element={<Investments />} />
            <Route path="docs" element={<ApiDocs />} />
            <Route path="help" element={<Help />} />

            {/* Outreach Routes */}
            <Route path="outreach/events" element={
              <ProtectedRoute roles={['OUTREACH_MANAGER']}>
                <OutreachEvents />
              </ProtectedRoute>
            } />
            <Route path="outreach/applications" element={
              <ProtectedRoute roles={['OUTREACH_MANAGER']}>
                <OutreachApplications />
              </ProtectedRoute>
            } />
            <Route path="outreach/cms" element={
              <ProtectedRoute roles={['OUTREACH_MANAGER']}>
                <OutreachCMS />
              </ProtectedRoute>
            } />
            <Route path="outreach/newsletters" element={
              <ProtectedRoute roles={['OUTREACH_MANAGER']}>
                <OutreachNewsletters />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
