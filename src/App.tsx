import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Solutions from './pages/landing/Solutions';
import Platform from './pages/landing/Platform';
import Enterprise from './pages/landing/Enterprise';
import Security from './pages/landing/Security';
import Pricing from './pages/landing/Pricing';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Chat from './pages/Chat';
import StaffMeals from './pages/StaffMeals';
import Announcements from './pages/Announcements';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import KYC from './pages/KYC';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import LandingLayout from './layouts/LandingLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing pages */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/security" element={<Security />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Auth flow */}
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />

        {/* Protected app */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="investments" element={<Investments />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="goals" element={<Goals />} />
          <Route path="chat" element={<Chat />} />
          <Route path="meals" element={<StaffMeals />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
