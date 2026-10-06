import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './lib/auth';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import CashCollectionsPage from './pages/CashCollectionsPage';
import Expenses from './pages/Expenses';
import Chat from './pages/Chat';
import StaffMeals from './pages/StaffMeals';
import Announcements from './pages/Announcements';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import CreateTransactionPage from './pages/CreateTransactionPage';
import UpdateRatesPage from './pages/UpdateRatesPage';
import AllTransactionsPage from './pages/AllTransactionsPage';
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
import WebsitesPage from './pages/WebsitesPage';

// Digital Marketing Pages
import SocialAccounts from './pages/marketing/SocialAccounts';
import MarketingCampaigns from './pages/marketing/MarketingCampaigns';
import CreatePostStudio from './pages/marketing/CreatePostStudio';

// Outreach Manager Pages
import OutreachEvents from './pages/dashboards/outreach/OutreachEvents';
import OutreachProjects from './pages/dashboards/outreach/OutreachProjects';
import OutreachApplications from './pages/dashboards/outreach/OutreachApplications';
import OutreachCMS from './pages/dashboards/outreach/OutreachCMS';
import OutreachNewsletters from './pages/dashboards/outreach/OutreachNewsletters';
import WebInsights from './pages/dashboards/outreach/WebInsights';
import OutreachStats from './pages/dashboards/outreach/OutreachStats';
import OutreachScholarships from './pages/dashboards/outreach/OutreachScholarships';
import OutreachDonations from './pages/dashboards/outreach/OutreachDonations';

// Dedicated Quick-View Pages
import RealTimeMetricsPage from './pages/quick-views/RealTimeMetricsPage';
import ExecutiveSummariesPage from './pages/quick-views/ExecutiveSummariesPage';
import DailyLedgerPage from './pages/quick-views/DailyLedgerPage';
import PendingExpensesPage from './pages/PendingExpensesPage';
import CreateExpensePage from './pages/CreateExpensePage';
import CreateCashTaskPage from './pages/CreateCashTaskPage';
import CreateSubscriptionPage from './pages/CreateSubscriptionPage';
import CreateTaskPage from './pages/CreateTaskPage';
import CreateGoalPage from './pages/CreateGoalPage';
import TrackGoalsPage from './pages/TrackGoalsPage';
import DeployOperationPage from './pages/DeployOperationPage';
import CreateEmployeePage from './pages/CreateEmployeePage';
import DepartmentsPage from './pages/DepartmentsPage';
import LogMealPage from './pages/LogMealPage';
import AuditedCashBatchesPage from './pages/quick-views/AuditedCashBatchesPage';
import OpenTasksPage from './pages/quick-views/OpenTasksPage';
import TodaysMealOrdersPage from './pages/quick-views/TodaysMealOrdersPage';
import TeamObjectivesPage from './pages/quick-views/TeamObjectivesPage';
import ActivePersonnelPage from './pages/quick-views/ActivePersonnelPage';
import PendingLeaveRequestsPage from './pages/quick-views/PendingLeaveRequestsPage';
import SecurityProfilePage from './pages/quick-views/SecurityProfilePage';
import KycPendingPage from './pages/quick-views/KycPendingPage';
import KycApprovedPage from './pages/quick-views/KycApprovedPage';
import KycRejectedPage from './pages/quick-views/KycRejectedPage';
import UnreadMessagesPage from './pages/quick-views/UnreadMessagesPage';
import OpenTicketsPage from './pages/quick-views/OpenTicketsPage';
import CompanyBulletinsPage from './pages/quick-views/CompanyBulletinsPage';
import KnowledgeBasePage from './pages/quick-views/KnowledgeBasePage';
import ApiSpecsPage from './pages/quick-views/ApiSpecsPage';
import SecurityBadgePage from './pages/quick-views/SecurityBadgePage';
import SecuritySessionsPage from './pages/quick-views/SecuritySessionsPage';
import SecurityAuditPage from './pages/quick-views/SecurityAuditPage';
import AccountPreferencesPage from './pages/quick-views/AccountPreferencesPage';

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
            
            {/* Dedicated Quick-Views & Executive Sections */}
            <Route path="metrics" element={<RealTimeMetricsPage />} />
            <Route path="reports/summaries" element={<ExecutiveSummariesPage />} />
            <Route path="transactions/ledger" element={<DailyLedgerPage />} />
            <Route path="expenses/pending" element={<PendingExpensesPage />} />
            <Route path="cash-collections/audited" element={<AuditedCashBatchesPage />} />
            <Route path="tasks/open" element={<OpenTasksPage />} />
            <Route path="meals/today" element={<TodaysMealOrdersPage />} />
            <Route path="goals/objectives" element={<TeamObjectivesPage />} />
            <Route path="employees/active" element={<ActivePersonnelPage />} />
            <Route path="leaves/pending" element={<PendingLeaveRequestsPage />} />
            <Route path="profile/security" element={<SecurityProfilePage />} />
            <Route path="kyc/pending" element={<KycPendingPage />} />
            <Route path="kyc/approved" element={<KycApprovedPage />} />
            <Route path="kyc/rejected" element={<KycRejectedPage />} />
            <Route path="chat/unread" element={<UnreadMessagesPage />} />
            <Route path="tickets/open" element={<OpenTicketsPage />} />
            <Route path="announcements/bulletins" element={<CompanyBulletinsPage />} />
            <Route path="help/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="apis" element={<ApiSpecsPage />} />
            <Route path="api" element={<Navigate to="/app/apis" replace />} />
            <Route path="security" element={<SecurityProfilePage />} />
            <Route path="security/badge" element={<SecurityBadgePage />} />
            <Route path="security/sessions" element={<SecuritySessionsPage />} />
            <Route path="security/audit" element={<SecurityAuditPage />} />
            <Route path="settings/preferences" element={<AccountPreferencesPage />} />
            
            {/* Websites & Online Platforms Hub */}
            <Route path="websites" element={<WebsitesPage />} />
            <Route path="websites/:platformSlug" element={<WebsitesPage />} />
            <Route path="websites/:platformSlug/:subSection" element={<WebsitesPage />} />
            <Route path="outreach" element={<Navigate to="/app/websites" replace />} />

            <Route
              path="employees"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER']}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/new"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER', 'ADMIN']}>
                  <CreateEmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/departments"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER', 'ADMIN']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/deploy"
              element={
                <ProtectedRoute roles={['CEO', 'MANAGER', 'ADMIN']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            {/* Transactions and KYC routes have been transferred to the Cash Dashboard */}
            <Route path="transactions" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="transactions/*" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="kyc" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="kyc/*" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses/new" element={<CreateExpensePage />} />
            <Route path="expenses/pending" element={<PendingExpensesPage />} />
            <Route path="expenses/pending-review" element={<Navigate to="/app/expenses/pending" replace />} />
            <Route path="cash-collections" element={<CashCollectionsPage />} />
            <Route path="cash-collections/new" element={<CreateCashTaskPage />} />
            <Route path="goals" element={<Goals />} />
            <Route path="goals/new" element={<CreateGoalPage />} />
            <Route path="goals/track" element={<TrackGoalsPage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="meals" element={<StaffMeals />} />
            <Route path="meals/new" element={<LogMealPage />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/new" element={<CreateSubscriptionPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/new" element={<CreateTaskPage />} />
            <Route path="leads" element={<Leads />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="support" element={<Navigate to="/app/tickets" replace />} />
            <Route path="content" element={<Content />} />
            <Route path="marketing" element={<Content />} />
            <Route path="marketing/accounts" element={<SocialAccounts />} />
            <Route path="marketing/campaigns" element={<MarketingCampaigns />} />
            <Route path="marketing/create-post" element={<CreatePostStudio />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="docs" element={<ApiDocs />} />
            <Route path="help" element={<Help />} />

            {/* Outreach Routes - Redirect to Dedicated Website Pages */}
            <Route path="outreach/web-insights" element={<Navigate to="/app/websites/outreach/insights" replace />} />
            <Route path="outreach/projects" element={<Navigate to="/app/websites/outreach/projects" replace />} />
            <Route path="outreach/applications" element={<Navigate to="/app/websites/outreach/applications" replace />} />
            <Route path="outreach/events" element={<Navigate to="/app/websites/outreach/events" replace />} />
            <Route path="outreach/donations" element={<Navigate to="/app/websites/outreach/donations" replace />} />
            <Route path="outreach/stats" element={<Navigate to="/app/websites/outreach" replace />} />
            <Route path="outreach/cms" element={<Navigate to="/app/websites/outreach" replace />} />
            <Route path="outreach/newsletters" element={<Navigate to="/app/websites/outreach" replace />} />
            <Route path="outreach/scholarships" element={<Navigate to="/app/websites/outreach/projects" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
