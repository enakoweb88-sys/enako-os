import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Globe, Megaphone, PenTool, Mail, FileText, CheckCircle2,
  XCircle, Filter, Calendar, Users, Briefcase
} from 'lucide-react';

export function OutreachManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'applications' | 'cms' | 'newsletters'>('events');

  // MOCK DATA
  const events = [
    { id: 1, title: '2026 Primary Scholarship', type: 'SCHOLARSHIP', status: 'OPEN', applicants: 142, closeDate: '2026-08-30' },
    { id: 2, title: 'Clean Water Fundraiser', type: 'FUNDRAISER', status: 'OPEN', raised: '450,000 XAF', target: '1,000,000 XAF' }
  ];

  const applications = [
    { id: 101, name: 'John Doe', level: 'UNIVERSITY', status: 'PENDING', date: '2026-07-01' },
    { id: 102, name: 'Jane Smith', level: 'SECONDARY', status: 'VERIFIED_BY_OUTREACH', date: '2026-06-28' }
  ];

  const handleVerify = (id: number) => {
    toast.success(`Application #${id} verified and forwarded to Executive Review.`);
  };

  const handleSendNewsletter = () => {
    toast.success('Newsletter broadcast dispatched successfully.');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Events', value: '4', icon: Globe },
          { label: 'Pending Applications', value: '18', icon: FileText },
          { label: 'Blog Posts', value: '24', icon: PenTool },
          { label: 'Newsletter Subscribers', value: '1,204', icon: Users },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-surface-container rounded-lg shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-outline-variant/50 pb-2">
        {[
          { id: 'events', label: 'Events & Scholarships', icon: Calendar },
          { id: 'applications', label: 'Applications Inbox', icon: FileText },
          { id: 'cms', label: 'Blog & CMS', icon: PenTool },
          { id: 'newsletters', label: 'Newsletters', icon: Mail },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-container'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'events' && (
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-primary">Manage Outreach Events</h3>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Create Event</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 text-secondary text-sm">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="border-b border-outline-variant/20 last:border-0">
                  <td className="py-4 font-bold text-primary">{ev.title}</td>
                  <td className="py-4 text-sm text-secondary">{ev.type}</td>
                  <td className="py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{ev.status}</span></td>
                  <td className="py-4 text-sm text-secondary">{ev.type === 'SCHOLARSHIP' ? `${ev.applicants} Applicants` : `${ev.raised} / ${ev.target}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-primary">Applications Inbox</h3>
            <button className="border border-outline-variant px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Filter className="w-4 h-4"/> Filter</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 text-secondary text-sm">
                <th className="pb-3 font-semibold">Applicant Name</th>
                <th className="pb-3 font-semibold">Level</th>
                <th className="pb-3 font-semibold">Date Applied</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className="border-b border-outline-variant/20 last:border-0">
                  <td className="py-4 font-bold text-primary">{app.name}</td>
                  <td className="py-4 text-sm text-secondary">{app.level}</td>
                  <td className="py-4 text-sm text-secondary">{app.date}</td>
                  <td className="py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{app.status.replace(/_/g, ' ')}</span></td>
                  <td className="py-4 text-right">
                    {app.status === 'PENDING' && (
                      <button onClick={() => handleVerify(app.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">Verify & Forward</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cms' && (
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-20">
          <PenTool className="w-16 h-16 text-outline-variant mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">Content Management System</h3>
          <p className="text-secondary text-sm mb-6 max-w-md text-center">Write blog posts, upload images/videos, and manage content on the main charity website directly from here.</p>
          <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold">Write New Post</button>
        </div>
      )}

      {activeTab === 'newsletters' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-primary mb-6">Compose Newsletter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Subject</label>
                <input type="text" className="w-full border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:border-primary" placeholder="Enako Outreach June Highlights..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Message Body</label>
                <textarea rows={8} className="w-full border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:border-primary" placeholder="Write your newsletter here..."></textarea>
              </div>
              <button onClick={handleSendNewsletter} className="bg-primary text-white w-full py-3 rounded-lg font-bold hover:bg-primary/90 flex justify-center items-center gap-2">
                <Megaphone className="w-5 h-5" /> Broadcast to 1,204 Subscribers
              </button>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 h-fit">
            <h4 className="font-bold text-primary mb-4">Mailing List Stats</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li className="flex justify-between border-b border-outline-variant/50 pb-2"><span>Total Subscribers</span><span className="font-bold text-primary">1,204</span></li>
              <li className="flex justify-between border-b border-outline-variant/50 pb-2"><span>Active Readers</span><span className="font-bold text-primary">942</span></li>
              <li className="flex justify-between pb-2"><span>Last Sent</span><span className="font-bold text-primary">2 weeks ago</span></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
