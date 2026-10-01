import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [stats, setStats] = useState<any>(null);
  const [activeTimer, setActiveTimer] = useState('00:00:00');

  useEffect(() => {
    api.getProfileStats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    let loginTime = sessionStorage.getItem('enako_login_time');
    if (!loginTime) {
      loginTime = new Date().toISOString();
      sessionStorage.setItem('enako_login_time', loginTime);
    }
    const startTime = new Date(loginTime).getTime();
    
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
  }, []);

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

  const getRoleSpecificData = () => {
    const completion = stats ? `${stats.taskCompletion || 0}%` : '0%';
    const goals = stats ? `${stats.completedGoals || 0}/${stats.totalGoals || 0}` : '0/0';
    const uptime = stats ? `${stats.networkUptime || 99.9}%` : '99.9%';
    const badges = stats?.badges || [];

    const defaultTitle = role.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    return {
      title: user?.title || defaultTitle,
      stats: [
        { label: 'Task completion', value: completion },
        { label: 'System Uptime', value: uptime },
        { label: 'Goals Reached', value: goals },
      ],
      badges: badges.length ? badges : ['Verified Member'],
      bio: `Professional profile for ${userName}, serving as ${user?.title || defaultTitle} within the ${user?.department || 'Operations'} organization.`
    };
  };

  const data = getRoleSpecificData();

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Human Resources</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Executive & Operative Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal credentials, security clearances, and workspace activity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={() => { 
              setEditName(userName); 
              setEditPhone(user?.phone || ''); 
              setEditTitle(user?.title || ''); 
              setEditAddress(user?.address || '');
              setEditPersonalEmail(user?.personalEmail || '');
              setEditEmergencyContact(user?.emergencyContact || '');
              setEditDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
              setShowEditProfile(true); 
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => { setCurrentPassword(''); setNewPassword(''); setShowChangePassword(true); }}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Change Password
          </button>
          <button 
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
          >
            Deauthorize Session
          </button>
        </div>
      </div>

      {/* Hero Profile Banner Card (No Icons) */}
      <div className="relative rounded-lg overflow-hidden bg-white border border-slate-200/90 shadow-2xs">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-[#001f5b] via-[#002d7a] to-[#001744] relative flex items-center justify-end px-6">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            ENAKO CLOUD SYSTEMS • AUTHORIZED ACCESS
          </span>
        </div>
        
        <div className="px-6 sm:px-8 pb-6 -mt-12 sm:-mt-14 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <div 
                className="relative group size-24 sm:size-28 rounded-lg bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-slate-800 text-3xl font-black overflow-hidden cursor-pointer shrink-0" 
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userName.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <span className="text-[9px] uppercase tracking-wider font-bold">Change</span>
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
                        
                        const storedStr = sessionStorage.getItem('enako_user');
                        if (storedStr) {
                          const parsed = JSON.parse(storedStr);
                          sessionStorage.setItem('enako_user', JSON.stringify({ ...parsed, ...updatedUser }));
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
              
              <div className="pb-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{userName}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Verified
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{data.title}</span>
                  <span className="size-1 rounded-full bg-slate-300"></span>
                  <span>{user?.department || 'Operations'} Department</span>
                  <span className="size-1 rounded-full bg-slate-300"></span>
                  <span>{user?.address || 'Headquarters • Yaoundé'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 self-stretch md:self-auto">
              <button 
                onClick={() => navigate('/app/settings')} 
                className="flex-1 md:flex-initial px-4 py-2 border border-slate-200/90 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                OS Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP METRIC CARDS WITH COLORED BOTTOM ACCENT (Matching Main Dashboard, No Icons) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Red Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TASK COMPLETION</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{data.stats[0].value}</p>
        </div>

        {/* Card 2: Green Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">SYSTEM UPTIME</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{data.stats[1].value}</p>
        </div>

        {/* Card 3: Oxford Navy #001f5b Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">GOALS REACHED</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{data.stats[2].value}</p>
        </div>

        {/* Card 4: Amber Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TIME LOGGED</p>
          <p className="text-2xl font-mono font-bold text-slate-900 leading-tight mt-1">{activeTimer}</p>
        </div>
      </div>

      {/* Main Grid: Details & Achievements (No Icons) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier & Identity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dossier */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-lg shadow-2xs">
            <div className="mb-3 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Professional Dossier
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {data.bio}
            </p>
          </div>

          {/* Contact Particulars */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contact Particulars & Identity
                </h3>
              </div>
              <button 
                onClick={() => { 
                  setEditName(userName); 
                  setEditPhone(user?.phone || ''); 
                  setEditTitle(user?.title || ''); 
                  setEditAddress(user?.address || '');
                  setEditPersonalEmail(user?.personalEmail || '');
                  setEditEmergencyContact(user?.emergencyContact || '');
                  setEditDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
                  setShowEditProfile(true); 
                }} 
                className="text-xs font-bold text-[#001f5b] hover:underline cursor-pointer"
              >
                Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{userEmail || '—'}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department Assignment</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{user?.department || (role === 'ceo' ? 'Executive Board' : 'General Operations')}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Contact</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{user?.phone || '—'}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Access Level</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  Level {role === 'ceo' ? '1 (Executive Direct)' : role.includes('manager') ? '2 (Department Oversight)' : '3 (Operative)'} Authorization
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personal Email</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{user?.personalEmail || '—'}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{user?.emergencyContact || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Active Work Stream */}
        <div className="lg:col-span-4 space-y-6">
          {/* Achievements */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-lg shadow-2xs">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Node Achievements
              </h3>
            </div>
            <div className="space-y-2.5">
              {data.badges.map((badge, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                  <span className="text-xs font-semibold text-slate-800">{badge}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowCertModal(true)} 
              className="w-full mt-4 py-2 border border-slate-200/90 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              View All Certifications
            </button>
          </div>

          {/* Current Work Stream */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-lg shadow-2xs">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Current Work Stream
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Task Deliverable</p>
                <p className="text-base font-bold mt-1 text-slate-900">{stats?.activeTask?.title || 'General Operations'}</p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Continuous Time Logged</p>
                <p className="text-lg font-mono font-bold mt-1 text-[#001f5b]">
                  {activeTimer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Modals (No Icons) */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProfile(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 z-10 text-slate-900">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Edit Profile Particulars</h3>
                  <p className="text-xs text-slate-500">Update personal and contact information.</p>
                </div>
                <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">Close</button>
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
                  const storedStr = sessionStorage.getItem('enako_user');
                  if (storedStr) {
                    sessionStorage.setItem('enako_user', JSON.stringify({ ...JSON.parse(storedStr), ...updated }));
                  }
                  toast.success('Profile updated successfully!');
                  setShowEditProfile(false);
                  setTimeout(() => window.location.reload(), 1000);
                } catch (err: any) {
                  toast.error(err.message || 'Failed to update profile');
                } finally {
                  setUpdatingProfile(false);
                }
              }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Full Name *</label>
                    <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Phone Number</label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" placeholder="+237 6XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Title / Position</label>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Date of Birth</label>
                    <input type="date" value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Personal Email</label>
                    <input type="email" value={editPersonalEmail} onChange={e => setEditPersonalEmail(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Emergency Contact</label>
                    <input value={editEmergencyContact} onChange={e => setEditEmergencyContact(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" placeholder="Name & contact phone number" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Home Address</label>
                    <input value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-2.5 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={updatingProfile} className="flex-1 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                    {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChangePassword(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 z-10 text-slate-900">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your account authentication credentials.</p>
                </div>
                <button onClick={() => setShowChangePassword(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">Close</button>
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
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Current Password *</label>
                  <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">New Password (min 8 chars) *</label>
                  <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b]" minLength={8} />
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowChangePassword(false)} className="flex-1 py-2.5 border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={updatingPassword} className="flex-1 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCertModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh] text-slate-900">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Certifications & Badges</h3>
                  <p className="text-xs text-slate-500">Verified credentials and professional badges.</p>
                </div>
                <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">Close</button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3">
                {data.badges.map((badge: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-lg bg-slate-50/70">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{badge}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Issued {new Date().getFullYear()} • Verified by ENAKO</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">Active</span>
                  </div>
                ))}
                {data.badges.length === 0 && (
                  <p className="text-center text-slate-500 text-xs py-8">No certifications awarded yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
