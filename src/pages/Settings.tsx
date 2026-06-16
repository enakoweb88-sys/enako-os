import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Cloud,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  AppWindow,
  Monitor,
  Key,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  Github,
  Slack
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userName = user?.fullName ?? 'Administrator';
  const userEmail = user?.email ?? '';

  const [activeTab, setActiveTab] = useState('Profile Account');
  const [toggles, setToggles] = useState({
    analytics: true,
    mfa: true,
    ai: false,
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    slackInteg: true,
    awsInteg: false,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const handleToggle = (key: keyof typeof toggles, title: string) => {
    setToggles((prev) => {
      const newState = !prev[key];
      if (newState) {
        toast.success(`${title} enabled`);
      } else {
        toast.info(`${title} disabled`);
      }
      return { ...prev, [key]: newState };
    });
  };

  const handleSave = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: 'Saving system profile...',
      success: 'System profile updated successfully',
      error: 'Failed to update system profile',
    });
  };

  const handleDiscard = () => {
    toast.info('Changes discarded');
  };

  const handleUpdateIdentity = () => {
    toast.info('Identity update request initiated. Please check your email.');
  };

  const handleChangePassword = () => {
    toast.success('Password reset link sent to your corporate email.');
  };

  if (role !== 'ceo' && role !== 'admin') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <SettingsIcon className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">System Configuration Locked</h2>
        <p className="text-secondary max-w-sm">Only administrative nodes can modify global system parameters and security protocols.</p>
      </div>
    );
  }

  const tabs = [
    { name: 'Profile Account', icon: User },
    { name: 'Security & Auth', icon: Shield },
    { name: 'Notifications', icon: Bell },
    { name: 'Data & Privacy', icon: Database },
    { name: 'Integrations', icon: Cloud },
  ];

  const privacyToggles = [
    { key: 'analytics' as const, title: 'Enable Analytics Tracking', desc: 'Allow Enako Labs to collect anonymized performance data to improve OS speed.' },
    { key: 'mfa' as const, title: 'Two-Factor Authentication', desc: 'Require a biometric scan or hardware key for all transaction approvals.' },
    { key: 'ai' as const, title: 'AI Workspace Optimization', desc: 'Automatically organize your dashboard based on your current deep work state.' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight">System Preferences</h1>
        <p className="text-secondary text-base">Manage your personal profile, security tiers, and global OS configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 h-fit sticky top-8">
           <nav className="space-y-2">
             {tabs.map((item) => (
               <button 
                 key={item.name}
                 onClick={() => setActiveTab(item.name)}
                 className={cn(
                   "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all group",
                   activeTab === item.name ? "bg-primary text-white shadow-xl" : "text-secondary hover:bg-surface-container"
                 )}
               >
                 <div className="flex items-center gap-4">
                   <item.icon className="w-5 h-5" />
                   <span>{item.name}</span>
                 </div>
                 {activeTab !== item.name && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />}
               </button>
             ))}
           </nav>

           <div className="mt-12 p-8 bg-surface-container rounded-3xl border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <AppWindow className="w-5 h-5 text-primary-container" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">ENAKO OS V1.0.0</span>
              </div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-relaxed">Enterprise Edition • Licensed to Enako Fintech Ltd.</p>
              <button 
                onClick={handleLogout}
                className="mt-8 text-[11px] font-bold text-error uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from All Devices
              </button>
           </div>
        </aside>

        <main className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {/* ── PROFILE ACCOUNT ── */}
              {activeTab === 'Profile Account' && (
                <>
                  <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                      <User className="w-6 h-6 text-primary-container" />
                      Account Information
                    </h3>
                    <div className="space-y-8">
                      <div className="flex items-center gap-8">
                          <div className="relative group cursor-pointer">
                            <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-lg group-hover:opacity-80 transition-all">
                              <span className="text-4xl font-bold text-primary">{userName.charAt(0)}</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <Monitor className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-primary">{userName}</p>
                            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-1">Global {role} Node</p>
                            <button 
                              onClick={handleUpdateIdentity}
                              className="mt-4 px-5 py-2 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all cursor-pointer"
                            >
                              Update Identity
                            </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {[
                            { label: 'Full Name', val: userName },
                            { label: 'Corporate Email', val: userEmail },
                            { label: 'Identity Node ID', val: `E-OS-${role.toUpperCase()}` },
                            { label: 'Network Origin', val: 'Global (Encrypted)' },
                          ].map((field) => (
                            <div key={field.label} className="space-y-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{field.label}</label>
                                <input readOnly value={field.val} className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-6 py-4 text-sm font-medium text-primary outline-none" />
                            </div>
                          ))}
                      </div>
                    </div>
                  </section>

                  <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                      <Lock className="w-6 h-6 text-primary-container" />
                      Privacy & Platform OS
                    </h3>
                    <div className="space-y-6">
                      {privacyToggles.map((toggle) => {
                          const isActive = toggles[toggle.key as keyof typeof toggles];
                          return (
                            <div key={toggle.key} className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/5">
                              <div className="max-w-md">
                                  <p className="text-sm font-bold text-primary">{toggle.title}</p>
                                  <p className="text-xs text-secondary mt-1">{toggle.desc}</p>
                              </div>
                              <button 
                                onClick={() => handleToggle(toggle.key as keyof typeof toggles, toggle.title)}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                                  isActive ? "bg-primary" : "bg-outline-variant"
                                )}
                              >
                                  <div className={cn(
                                    "absolute top-1 size-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                    isActive ? "left-7" : "left-1"
                                  )}></div>
                              </button>
                            </div>
                          );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* ── SECURITY & AUTH ── */}
              {activeTab === 'Security & Auth' && (
                <>
                  <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                      <Key className="w-6 h-6 text-primary-container" />
                      Password Management
                    </h3>
                    <div className="space-y-6">
                      <p className="text-sm text-secondary">Ensure your account is using a long, random password to stay secure.</p>
                      <button 
                        onClick={handleChangePassword}
                        className="px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                      >
                        Change Password
                      </button>
                    </div>
                  </section>

                  <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-primary-container" />
                      Active Sessions
                    </h3>
                    <div className="space-y-4">
                      {[
                        { device: 'MacBook Pro 16"', location: 'Douala, CM', ip: '197.234.xx.xx', current: true },
                        { device: 'iPhone 14 Pro', location: 'Yaounde, CM', ip: '154.72.xx.xx', current: false },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-6 border border-outline-variant/20 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-primary">{session.device} {session.current && <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Current</span>}</p>
                            <p className="text-xs text-secondary mt-1">{session.location} • {session.ip}</p>
                          </div>
                          {!session.current && (
                            <button onClick={() => toast.success('Session revoked')} className="text-[10px] font-bold text-error uppercase hover:underline">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'Notifications' && (
                <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                    <Bell className="w-6 h-6 text-primary-container" />
                    Notification Channels
                  </h3>
                  <div className="space-y-6">
                    {[
                      { key: 'emailNotif', icon: Mail, title: 'Email Notifications', desc: 'Receive daily summaries and critical security alerts.' },
                      { key: 'pushNotif', icon: Monitor, title: 'In-App Push Alerts', desc: 'Real-time notifications within the ENAKO OS dashboard.' },
                      { key: 'smsNotif', icon: MessageSquare, title: 'SMS Alerts', desc: 'Get text messages for high-priority transaction approvals.' },
                    ].map((channel) => {
                      const isActive = toggles[channel.key as keyof typeof toggles];
                      return (
                        <div key={channel.key} className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/5">
                           <div className="flex items-start gap-4">
                             <div className="p-3 bg-white rounded-xl shadow-sm border border-outline-variant/10">
                               <channel.icon className="w-5 h-5 text-primary" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-primary">{channel.title}</p>
                                <p className="text-xs text-secondary mt-1">{channel.desc}</p>
                             </div>
                           </div>
                           <button 
                             onClick={() => handleToggle(channel.key as keyof typeof toggles, channel.title)}
                             className={cn(
                               "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                               isActive ? "bg-primary" : "bg-outline-variant"
                             )}
                           >
                              <div className={cn(
                                "absolute top-1 size-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                isActive ? "left-7" : "left-1"
                              )}></div>
                           </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── DATA & PRIVACY ── */}
              {activeTab === 'Data & Privacy' && (
                <>
                  <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                      <Download className="w-6 h-6 text-primary-container" />
                      Data Export
                    </h3>
                    <p className="text-sm text-secondary mb-6">Request a complete archive of your personal activity logs, transactions, and profile data in JSON or CSV format.</p>
                    <button onClick={() => toast.success('Data export started. You will receive an email when it is ready.')} className="px-6 py-3 border border-outline-variant text-primary rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors">
                      Request Archive
                    </button>
                  </section>

                  <section className="bg-error/5 border border-error/20 p-10 rounded-[2.5rem] shadow-sm mt-8">
                    <h3 className="text-xl font-bold text-error mb-4 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6" />
                      Danger Zone
                    </h3>
                    <p className="text-sm text-error/80 mb-6">Irreversibly delete your ENAKO OS account and all associated personal records. This action cannot be undone.</p>
                    <button onClick={() => toast.error('Only Global Admin can delete user accounts.')} className="px-6 py-3 bg-error text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                      Delete Account
                    </button>
                  </section>
                </>
              )}

              {/* ── INTEGRATIONS ── */}
              {activeTab === 'Integrations' && (
                <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-3">
                    <Cloud className="w-6 h-6 text-primary-container" />
                    Connected Applications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'slackInteg', name: 'Slack', icon: Slack, desc: 'Send alerts to #operations channel' },
                      { key: 'awsInteg', name: 'AWS Services', icon: Database, desc: 'Connect to external S3 buckets' },
                    ].map((app) => {
                      const isActive = toggles[app.key as keyof typeof toggles];
                      return (
                        <div key={app.key} className="p-6 border border-outline-variant/20 rounded-3xl flex flex-col items-start gap-4">
                          <app.icon className="w-8 h-8 text-primary" />
                          <div>
                            <p className="text-sm font-bold text-primary">{app.name}</p>
                            <p className="text-[11px] text-secondary mt-1">{app.desc}</p>
                          </div>
                          <div className="mt-auto pt-4 w-full flex items-center justify-between border-t border-outline-variant/10">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-green-600" : "text-secondary")}>
                              {isActive ? 'Connected' : 'Not Connected'}
                            </span>
                            <button 
                              onClick={() => handleToggle(app.key as keyof typeof toggles, app.name)}
                              className="text-[10px] font-bold text-primary uppercase hover:underline"
                            >
                              {isActive ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

            </motion.div>
          </AnimatePresence>

          {(activeTab === 'Profile Account' || activeTab === 'Notifications') && (
            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={handleDiscard}
                className="px-10 py-4 bg-surface-container-high text-secondary rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all cursor-pointer"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                className="px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                Save System Profile
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
