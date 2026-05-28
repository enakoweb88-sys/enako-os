import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  CreditCard,
  Cloud,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  AppWindow,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userName = user?.fullName ?? 'Administrator';
  const userEmail = user?.email ?? '';

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
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
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight">System Preferences</h1>
        <p className="text-secondary text-base">Manage your personal profile, security tiers, and global OS configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 h-fit sticky top-8">
           <nav className="space-y-2">
             {[
               { name: 'Profile Account', icon: User, active: true },
               { name: 'Security & Auth', icon: Shield },
               { name: 'Notifications', icon: Bell },
               { name: 'Subscription', icon: CreditCard },
               { name: 'Data & Privacy', icon: Database },
               { name: 'Integrations', icon: Cloud },
             ].map((item) => (
               <button 
                 key={item.name}
                 className={cn(
                   "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all group",
                   item.active ? "bg-primary text-white shadow-xl" : "text-secondary hover:bg-surface-container"
                 )}
               >
                 <div className="flex items-center gap-4">
                   <item.icon className="w-5 h-5" />
                   <span>{item.name}</span>
                 </div>
                 {!item.active && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />}
               </button>
             ))}
           </nav>

           <div className="mt-12 p-8 bg-surface-container rounded-3xl border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <AppWindow className="w-5 h-5 text-primary-container" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">ENAKO OS V4.2.0</span>
              </div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-relaxed">Enterprise Edition • Licensed to Enako Global Ltd.</p>
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
                       <button className="mt-4 px-5 py-2 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Update Identity</button>
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
                 {[
                   { title: 'Enable Analytics Tracking', desc: 'Allow Enako Labs to collect anonymized performance data to improve OS speed.', active: true },
                   { title: 'Two-Factor Authentication', desc: 'Require a biometric scan or hardware key for all transaction approvals.', active: true },
                   { title: 'AI Workspace Optimization', desc: 'Automatically organize your dashboard based on your current deep work state.', active: false },
                 ].map((toggle, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/5">
                       <div className="max-w-md">
                          <p className="text-sm font-bold text-primary">{toggle.title}</p>
                          <p className="text-xs text-secondary mt-1">{toggle.desc}</p>
                       </div>
                       <button className={cn(
                         "w-12 h-6 rounded-full relative transition-all duration-300",
                         toggle.active ? "bg-primary" : "bg-outline-variant"
                       )}>
                          <div className={cn(
                            "absolute top-1 size-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                            toggle.active ? "left-7" : "left-1"
                          )}></div>
                       </button>
                    </div>
                 ))}
              </div>
           </section>

           <div className="flex justify-end gap-4">
              <button className="px-10 py-4 bg-surface-container-high text-secondary rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Discard Changes</button>
              <button className="px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all">Save System Profile</button>
           </div>
        </main>
      </div>
    </div>
  );
}
