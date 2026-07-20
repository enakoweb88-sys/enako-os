import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Target,
  X,
  Lock,
  PauseCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userName = user?.fullName ?? 'Executive';
  const userEmail = user?.email ?? '';

  const [showCertModal, setShowCertModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [activeTimer, setActiveTimer] = useState('00:00:00');

  useEffect(() => {
    api.getProfileStats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    if (pauseTimer) return;
    const startTime = stats?.activeTask?.startedAt ? new Date(stats.activeTask.startedAt).getTime() : new Date(user?.createdAt || Date.now()).getTime();
    
    const updateTimer = () => {
      const diff = Math.max(0, Date.now() - startTime);
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setActiveTimer(`${h}:${m}:${s}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [stats, pauseTimer, user?.createdAt]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editTitle, setEditTitle] = useState(user?.title || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editPersonalEmail, setEditPersonalEmail] = useState(user?.personalEmail || '');
  const [editEmergencyContact, setEditEmergencyContact] = useState(user?.emergencyContact || '');
  const [editDateOfBirth, setEditDateOfBirth] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const handlePause = () => {
    setShowPauseModal(false);
    toast.success('Operational flow paused.');
    setPauseTimer(Date.now());
  };

  const getRoleSpecificData = () => {
    const completion = stats ? `${stats.taskCompletion || 0}%` : '0%';
    const goals = stats ? `${stats.completedGoals || 0}/${stats.totalGoals || 0}` : '0/0';
    const uptime = stats ? `${stats.networkUptime || 99.9}%` : '99.9%';
    const badges = stats?.badges || [];

    const defaultTitle = role.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    return {
      title: user?.title || defaultTitle,
      stats: [
        { label: 'Task completion', value: completion, icon: CheckCircle2, color: 'text-primary' },
        { label: 'System Uptime', value: uptime, icon: Zap, color: 'text-secondary' },
        { label: 'Goals Reached', value: goals, icon: Target, color: 'text-tertiary' },
      ],
      badges: badges.length ? badges : ['Verified Member'],
      bio: `Professional profile for ${userName}, serving as ${user?.title || defaultTitle} within the organization.`
    };
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
            <div className="relative group size-32 rounded-[2rem] bg-primary border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black overflow-hidden cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{userName.charAt(0)}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-wider font-bold">Upload</span>
              </div>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
                  
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const base64 = ev.target?.result as string;
                    try {
                      const apiModule = await import('../lib/api');
                      const updatedUser = await apiModule.api.updateMe({ avatarUrl: base64 });
                      
                      const storedStr = localStorage.getItem('enako_user');
                      if (storedStr) {
                        const parsed = JSON.parse(storedStr);
                        localStorage.setItem('enako_user', JSON.stringify({ ...parsed, ...updatedUser }));
                      }

                      toast.success('Profile picture updated!');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err: any) {
                      toast.error(err.message || 'Upload failed');
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            
            <div className="flex-1 pb-4">
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-display font-bold text-primary tracking-tight">{userName}</h1>
                  <UserCheck className="w-6 h-6 text-green-500" />
               </div>
               <div className="flex items-center gap-4 mt-2 text-secondary">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{data.title}</span>
                  <span className="size-1 rounded-full bg-outline-variant"></span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user?.address || 'Headquarters'}
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
                <div className="flex gap-4">
                  <button onClick={() => { 
                    setEditName(userName); 
                    setEditPhone(user?.phone || ''); 
                    setEditTitle(user?.title || ''); 
                    setEditAddress(user?.address || '');
                    setEditPersonalEmail(user?.personalEmail || '');
                    setEditEmergencyContact(user?.emergencyContact || '');
                    setEditDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
                    setShowEditProfile(true); 
                  }} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Edit Profile</button>
                  <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setShowChangePassword(true); }} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Change Password</button>
                </div>
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
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Languages</p>
                      <p className="text-sm font-bold text-primary">English, French</p>
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
                      <p className="text-sm font-bold text-primary">{user?.department || (role === 'ceo' ? 'Executive Board' : 'General Operations')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">System Access</p>
                      <p className="text-sm font-bold text-primary">Level {role === 'ceo' ? '1' : role.includes('manager') ? '2' : '3'} Authorization</p>
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
            <button onClick={() => setShowCertModal(true)} className="w-full mt-8 py-4 border border-outline-variant/20 rounded-2xl text-[10px] font-bold text-secondary uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all">
              View All Certifications
            </button>
          </section>

          <section className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h3 className="text-[10px] font-bold text-primary-fixed/60 uppercase tracking-[0.2em] mb-6">Current Work Stream</h3>
             <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed/80">Active Task</p>
                  <p className="text-xl font-bold mt-1">{stats?.activeTask?.title || 'General Operations'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary-fixed/80">Time Logged</p>
                  <p className="text-lg font-mono font-bold mt-1">
                    {pauseTimer ? 'PAUSED' : activeTimer}
                  </p>
                </div>
                <button onClick={() => setShowPauseModal(true)} className="w-full py-4 bg-white text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                  {pauseTimer ? 'Resume Session' : 'Pause Session'}
                </button>
             </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProfile(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 z-10">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2"><User className="w-5 h-5 text-secondary" /> Edit Profile</h3>
                <button onClick={() => setShowEditProfile(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setUpdatingProfile(true);
                try {
                  const updated = await api.updateMe({ 
                    fullName: editName, 
                    phone: editPhone, 
                    title: editTitle,
                    address: editAddress,
                    personalEmail: editPersonalEmail,
                    emergencyContact: editEmergencyContact,
                    dateOfBirth: editDateOfBirth ? new Date(editDateOfBirth).toISOString() : undefined
                  });
                  const storedStr = localStorage.getItem('enako_user');
                  if (storedStr) {
                    localStorage.setItem('enako_user', JSON.stringify({ ...JSON.parse(storedStr), ...updated }));
                  }
                  toast.success('Profile updated successfully!');
                  setShowEditProfile(false);
                  setTimeout(() => window.location.reload(), 1000);
                } catch (err: any) {
                  toast.error(err.message || 'Failed to update profile');
                } finally {
                  setUpdatingProfile(false);
                }
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Full Name</label>
                    <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Phone Number</label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title</label>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Date of Birth</label>
                    <input type="date" value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Personal Email</label>
                    <input type="email" value={editPersonalEmail} onChange={e => setEditPersonalEmail(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Emergency Contact</label>
                    <input value={editEmergencyContact} onChange={e => setEditEmergencyContact(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Address</label>
                    <input value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                </div>
                <button type="submit" disabled={updatingProfile} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-50">
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChangePassword(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 z-10">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2"><Lock className="w-5 h-5 text-secondary" /> Change Password</h3>
                <button onClick={() => setShowChangePassword(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setUpdatingPassword(true);
                try {
                  await api.changePassword({ currentPassword, newPassword });
                  toast.success('Password updated successfully!');
                  setShowChangePassword(false);
                } catch (err: any) {
                  toast.error(err.message || 'Failed to change password');
                } finally {
                  setUpdatingPassword(false);
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Current Password</label>
                  <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">New Password</label>
                  <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" minLength={8} />
                </div>
                <button type="submit" disabled={updatingPassword} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-50">
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCertModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2"><Award className="w-5 h-5 text-secondary" /> Certifications & Badges</h3>
                <button onClick={() => setShowCertModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                {data.badges.map((badge: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-outline-variant/30 rounded-2xl">
                    <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{badge}</h4>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Issued {new Date().getFullYear()}</p>
                    </div>
                  </div>
                ))}
                {data.badges.length === 0 && (
                  <p className="text-center text-secondary text-sm">No certifications awarded yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showPauseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPauseModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <PauseCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Pause Work Session?</h3>
              <p className="text-sm text-secondary mb-8">This will pause your active operational timer and mark your status as 'Away' across the network.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowPauseModal(false)} className="flex-1 py-3 bg-surface border border-outline-variant/30 text-secondary rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
                <button onClick={handlePause} className="flex-1 py-3 bg-yellow-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-yellow-600 transition-all">Pause Flow</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
