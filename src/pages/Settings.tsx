import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userName = user?.fullName ?? 'Administrator';
  const userEmail = user?.email ?? '';

  const [activeTab, setActiveTab] = useState('Profile Account');
  const [toggles, setToggles] = useState({
    analytics: true,
    mfa: false,
    aiWorkspace: false,
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    slackConnected: false,
    awsConnected: false,
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [prefs, sess] = await Promise.all([
          api.settings.getPreferences(),
          api.settings.getSessions()
        ]);
        if (prefs) {
          setToggles({
            analytics: prefs.analytics,
            mfa: prefs.mfa,
            aiWorkspace: prefs.aiWorkspace,
            emailNotif: prefs.emailNotif,
            pushNotif: prefs.pushNotif,
            smsNotif: prefs.smsNotif,
            slackConnected: prefs.slackConnected,
            awsConnected: prefs.awsConnected,
          });
        }
        if (sess) setSessions(sess);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const handleToggle = async (key: keyof typeof toggles, title: string) => {
    const newState = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newState }));
    try {
      await api.settings.updatePreferences({ [key]: newState });
      if (newState) toast.success(`${title} enabled`);
      else toast.info(`${title} disabled`);
    } catch (err) {
      toast.error('Failed to update preference');
      setToggles((prev) => ({ ...prev, [key]: !newState }));
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await api.settings.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success('Session revoked');
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.settings.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enako-os-archive.json';
      a.click();
      toast.success('Data export complete.');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await api.settings.deleteAccount();
      toast.success('Account deleted successfully');
      handleLogout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  if (!['ceo', 'admin', 'manager'].includes(role)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-3 p-8">
        <h2 className="text-xl font-bold text-slate-900">System Configuration Locked</h2>
        <p className="text-slate-500 text-xs max-w-sm">Only administrative nodes can modify global system parameters and security protocols.</p>
      </div>
    );
  }

  const tabs = [
    'Profile Account',
    'Security & Auth',
    'Notifications',
    'Data & Privacy',
    'Integrations',
  ];

  const privacyToggles = [
    { key: 'analytics' as const, title: 'Enable Analytics Tracking', desc: 'Allow Enako Labs to collect anonymized performance data to improve OS speed.' },
    { key: 'mfa' as const, title: 'Two-Factor Authentication', desc: 'Require authentication verification for all transaction approvals.' },
    { key: 'aiWorkspace' as const, title: 'AI Workspace Optimization', desc: 'Automatically organize your dashboard based on your current deep work state.' },
  ];

  return (
    <div className="space-y-6 font-sans pb-24">
      {/* Clean Top Header & Breadcrumb (No heavy card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>System</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Preferences & Information
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal account parameters, operational communication channels, and security settings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportData}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Export Archive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs (Clean vertical list, no outer cards) */}
        <aside className="lg:col-span-3 space-y-4">
          <nav className="space-y-1">
            {tabs.map((tabName) => (
              <button 
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  activeTab === tabName
                    ? "bg-[#001f5b] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {tabName}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Node</p>
            <p className="text-slate-600 font-medium">Logged in as <strong className="text-slate-900">{userName}</strong></p>
            <p className="text-slate-400 text-[11px]">Role clearance: {role.toUpperCase()}</p>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline uppercase tracking-wider block pt-2 cursor-pointer"
            >
              Sign Out from All Devices
            </button>
          </div>
        </aside>

        {/* Tab Content (Informational messages & clean dividers, no nested cards) */}
        <main className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Profile Account */}
              {activeTab === 'Profile Account' && (
                <div className="space-y-8">
                  {/* Account Information Section */}
                  <div className="space-y-4 border-b border-slate-200/80 pb-8">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Account Information</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Your official enterprise profile credentials recorded on the personnel directory.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-4 text-xs">
                      <div className="size-12 rounded-lg bg-[#001f5b] text-white flex items-center justify-center font-bold text-lg">
                        {userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{userName}</p>
                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{role} Authority Node • {userEmail}</p>
                      </div>
                    </div>

                    <form className="space-y-4 pt-2" onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const form = e.target as HTMLFormElement;
                        const data = {
                          fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
                          email: (form.elements.namedItem('email') as HTMLInputElement).value,
                          phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
                          title: (form.elements.namedItem('title') as HTMLInputElement).value,
                          address: (form.elements.namedItem('address') as HTMLInputElement).value,
                        };
                        const updated = await api.updateMe(data);
                        const storedStr = sessionStorage.getItem('enako_user');
                        if (storedStr) {
                          sessionStorage.setItem('enako_user', JSON.stringify({ ...JSON.parse(storedStr), ...updated }));
                        }
                        toast.success('System profile updated successfully');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to update profile');
                      }
                    }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Full Name</label>
                          <input name="fullName" defaultValue={userName} required className="w-full bg-white border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Corporate Email</label>
                          <input name="email" defaultValue={userEmail} required type="email" className="w-full bg-white border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Title / Position</label>
                          <input name="title" defaultValue={user?.title || ''} className="w-full bg-white border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                          <input name="phone" defaultValue={user?.phone || ''} className="w-full bg-white border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Office Address</label>
                          <input name="address" defaultValue={user?.address || ''} className="w-full bg-white border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" className="px-5 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer">
                          Save Identity Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Privacy & Platform Preferences */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Privacy & Telemetry Policies</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Control automated telemetry tracking and background workspace optimizations.</p>
                    </div>

                    <div className="space-y-3">
                      {privacyToggles.map((toggle) => {
                        const isActive = toggles[toggle.key as keyof typeof toggles];
                        return (
                          <div key={toggle.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="max-w-md">
                              <p className="text-xs font-bold text-slate-900">{toggle.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{toggle.desc}</p>
                            </div>
                            <button 
                              onClick={() => handleToggle(toggle.key as keyof typeof toggles, toggle.title)}
                              className={cn(
                                "w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0",
                                isActive ? "bg-[#001f5b]" : "bg-slate-300"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 size-4 bg-white rounded-full transition-all shadow-sm",
                                isActive ? "left-6" : "left-1"
                              )}></div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Auth */}
              {activeTab === 'Security & Auth' && (
                <div className="space-y-8">
                  <div className="space-y-3 border-b border-slate-200/80 pb-6">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Access Credentials</h3>
                    <p className="text-xs text-slate-500">Regularly update your login passphrase to protect corporate financial ledger records.</p>
                    <button 
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                    >
                      Update Passphrase
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Active Device Sessions</h3>
                    <p className="text-xs text-slate-500">Authorized browsers and devices currently authenticated with your identity token.</p>
                    
                    <div className="space-y-2.5">
                      {sessions.length === 0 && <p className="text-xs text-slate-500">No active remote sessions found.</p>}
                      {sessions.map((session, i) => (
                        <div key={session.id} className="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {session.device || 'Unknown Device'} 
                              {i === 0 && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold">Current</span>}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{session.location || 'Douala'} • {session.ipAddress}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Started: {new Date(session.createdAt).toLocaleString()}</p>
                          </div>
                          {i !== 0 && (
                            <button onClick={() => handleRevokeSession(session.id)} className="text-xs font-semibold text-rose-600 uppercase hover:underline">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'Notifications' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Alert & Message Channels</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Configure operational notifications delivered via email, in-app badges, and SMS.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'emailNotif', title: 'Corporate Email Notifications', desc: 'Receive daily audit reports, settlement summaries, and urgent executive alerts.' },
                      { key: 'pushNotif', title: 'In-App Live Telemetry Alerts', desc: 'Real-time toaster notifications when transactions and KYC submissions arrive.' },
                      { key: 'smsNotif', title: 'Critical SMS Alerts', desc: 'Direct mobile phone text alerts for emergency cash collections and vault clearances.' },
                    ].map((channel) => {
                      const isActive = toggles[channel.key as keyof typeof toggles];
                      return (
                        <div key={channel.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{channel.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{channel.desc}</p>
                          </div>
                          <button 
                            onClick={() => handleToggle(channel.key as keyof typeof toggles, channel.title)}
                            className={cn(
                              "w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0",
                              isActive ? "bg-[#001f5b]" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 size-4 bg-white rounded-full transition-all shadow-sm",
                              isActive ? "left-6" : "left-1"
                            )}></div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data & Privacy */}
              {activeTab === 'Data & Privacy' && (
                <div className="space-y-8">
                  <div className="space-y-3 border-b border-slate-200/80 pb-6">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Compliance Data Export</h3>
                    <p className="text-xs text-slate-500">Request a complete cryptographic archive of your personal activity logs, transactions, and profile data in JSON format.</p>
                    <button onClick={handleExportData} className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-2xs">
                      Export Data Archive
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-rose-700 uppercase tracking-wider">Account Deletion Zone</h3>
                    <p className="text-xs text-slate-500">Permanently de-provision your account credentials and revoke cryptographic certificates.</p>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-colors shadow-2xs">
                      De-provision Account
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'Integrations' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Connected Infrastructure Applications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Manage external webhook endpoints and enterprise communication bridges.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'slackConnected', name: 'Slack Messaging Webhooks', desc: 'Post instant notifications to corporate audit channels' },
                      { key: 'awsConnected', name: 'AWS Cloud Services', desc: 'Secure document storage bucket integration' },
                    ].map((app) => {
                      const isActive = toggles[app.key as keyof typeof toggles];
                      return (
                        <div key={app.key} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{app.name}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{app.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-200">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "text-emerald-700" : "text-slate-500")}>
                              {isActive ? 'Connected' : 'Not Connected'}
                            </span>
                            <button 
                              onClick={() => handleToggle(app.key as keyof typeof toggles, app.name)}
                              className="text-xs font-semibold text-slate-900 uppercase hover:underline cursor-pointer"
                            >
                              {isActive ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Change Password Modal */}
          {showChangePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChangePassword(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 z-10">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <button onClick={() => setShowChangePassword(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold cursor-pointer">✕</button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdatingPassword(true);
                  try {
                    await api.settings.changePassword(currentPassword, newPassword);
                    toast.success('Password updated successfully!');
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to change password');
                  } finally {
                    setUpdatingPassword(false);
                  }
                }} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Current Password</label>
                    <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-[#001f5b] text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">New Password</label>
                    <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-[#001f5b] text-slate-900" minLength={8} />
                  </div>
                  <button type="submit" disabled={updatingPassword} className="w-full py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider mt-4 transition-colors disabled:opacity-50 shadow-2xs cursor-pointer">
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
