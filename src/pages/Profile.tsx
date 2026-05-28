import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  MapPin, 
  Briefcase, 
  Globe, 
  CheckCircle2, 
  Award, 
  BarChart3,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  UserCheck,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userName = user?.fullName ?? 'Executive';
  const userEmail = user?.email ?? '';

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const getRoleSpecificData = () => {
    switch (role) {
      case 'ceo':
        return {
          title: 'Strategic Overseer',
          stats: [
            { label: 'Company Stability', value: '0.00%', icon: Shield, color: 'text-primary' },
            { label: 'Global Compliance', value: 'Lvl 0', icon: Globe, color: 'text-secondary' },
            { label: 'Executive Tenure', value: '0 Days', icon: Clock, color: 'text-tertiary' },
          ],
          badges: ['Founder', 'Strategic Visionary', 'High-Trust Node'],
          bio: 'Architect of the Enako financial ecosystem. Dedicated to deep liquidity and algorithmic transparency.'
        };
      case 'manager':
        return {
          title: 'Operational Lead',
          stats: [
            { label: 'Team Velocity', value: '0%', icon: Zap, color: 'text-primary' },
            { label: 'Resource Efficiency', value: '0%', icon: BarChart3, color: 'text-secondary' },
            { label: 'Active Projects', value: '0', icon: Briefcase, color: 'text-tertiary' },
          ],
          badges: ['Efficiency Expert', 'Team Catalyst', 'Operational Authority'],
          bio: 'Bridging high-level strategy with operative execution. Managing the workflow of Node Alpha and Beta.'
        };
      default:
        return {
          title: 'Operative Node',
          stats: [
            { label: 'Task completion', value: '0%', icon: CheckCircle2, color: 'text-primary' },
            { label: 'Network Uptime', value: '0%', icon: Zap, color: 'text-secondary' },
            { label: 'Goals Reached', value: '0/0', icon: Target, color: 'text-tertiary' },
          ],
          badges: ['Rising Star', 'Bug Hunter', 'Reliability Hero'],
          bio: 'Functional unit within the Enako OS ecosystem. Specializing in high-frequency data synthesis and reporting.'
        };
    }
  };

  const data = getRoleSpecificData();

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Hero Profile Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-outline-variant/30 shadow-sm">
        <div className="h-48 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="px-12 pb-12 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="size-32 rounded-[2rem] bg-primary border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black">
              {userName.charAt(0)}
            </div>
            
            <div className="flex-1 pb-4">
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-display font-bold text-primary tracking-tight">{userName}</h1>
                  <UserCheck className="w-6 h-6 text-green-500" />
               </div>
               <div className="flex items-center gap-4 mt-2 text-secondary">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{data.title} • {role.toUpperCase()}</span>
                  <span className="size-1 rounded-full bg-outline-variant"></span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    London Hub
                  </span>
               </div>
            </div>

            <div className="flex gap-3 mb-4">
               <button onClick={() => navigate('/app/settings')} className="px-6 py-3 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Edit OS Preferences
               </button>
               <button onClick={handleLogout} className="px-6 py-3 bg-error text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Deauthorize Session
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Stats/Bio */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-8">Professional Dossier</h3>
            <p className="text-lg text-primary leading-relaxed font-medium">
              {data.bio}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {data.stats.map((stat, i) => (
                <div key={i} className="p-6 bg-surface-container-low/50 border border-outline-variant/10 rounded-3xl">
                  <stat.icon className={cn("w-5 h-5 mb-4", stat.color)} />
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-mono font-bold text-primary mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Contact & Identity</h3>
                <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Request Credentials Change</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Corporate Email</p>
                      <p className="text-sm font-bold text-primary">{userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Language Nodes</p>
                      <p className="text-sm font-bold text-primary">English (Native), French (Fluent)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Department</p>
                      <p className="text-sm font-bold text-primary">{role === 'ceo' ? 'Executive Board' : (role === 'manager' ? 'Global Operations' : 'Internal Node')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Network Access</p>
                      <p className="text-sm font-bold text-primary">Tier {role === 'ceo' ? '1 (Absolute)' : '2 (Managerial)'}</p>
                    </div>
                  </div>
                </div>
             </div>
          </section>
        </div>

        {/* Right Sidebar: Achievements/Timeline */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white border border-outline-variant/30 p-10 rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-8">Node Achievements</h3>
            <div className="space-y-4">
              {data.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl group hover:bg-primary/10 transition-all">
                  <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider">{badge}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 border border-outline-variant/20 rounded-2xl text-[10px] font-bold text-secondary uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all">
              View All Certifications
            </button>
          </section>

          <section className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h3 className="text-[10px] font-bold text-primary-fixed/60 uppercase tracking-[0.2em] mb-6">Current Work Stream</h3>
             <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed/80">Project Focus</p>
                  <p className="text-xl font-bold mt-1">Global OS V5.0 Migration</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed/80">Work Session</p>
                  <p className="text-lg font-mono font-bold mt-1">00:00:00</p>
                </div>
                <button className="w-full py-4 bg-white text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                  Pause Operational Flow
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
