import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
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
import { ProtectedRoute } from './lib/auth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<ProtectedRoute roles={['CEO', 'MANAGER']}><Employees /></ProtectedRoute>} />
          <Route path="transactions" element={<ProtectedRoute roles={['CEO', 'MANAGER']}><Transactions /></ProtectedRoute>} />
          <Route path="investments" element={<ProtectedRoute roles={['CEO']}><Investments /></ProtectedRoute>} />
          <Route path="kyc" element={<ProtectedRoute roles={['CEO', 'MANAGER']}><KYC /></ProtectedRoute>} />
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
