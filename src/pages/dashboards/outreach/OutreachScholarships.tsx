import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api/outreach';
import { toast } from 'sonner';
import { 
  BookOpen, Plus, Target, CheckCircle2, Trash2, 
  FileText, Sparkles, Filter, X, Calendar, Clock, Send,
  Globe, AlertCircle, RefreshCw, Check, Layers, Award, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_DEMO_SCHOLARSHIPS = [
  {
    id: 'sch-001',
    title: '2026 Primary Excellence Scholarship',
    description: 'Full tuition sponsorship for top-performing primary school students across Cameroon.',
    status: 'OPEN',
    type: 'SCHOLARSHIP',
    level: 'PRIMARY',
    openDate: new Date().toISOString(),
    closeDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    _count: { applications: 12 },
  },
  {
    id: 'sch-002',
    title: 'STEM Female Leadership Fellowship 2026',
    description: 'Higher education grant for young women entering engineering, computer science & technology.',
    status: 'SCHEDULED',
    type: 'SCHOLARSHIP',
    level: 'UNIVERSITY',
    openDate: '2026-09-15T09:00',
    closeDate: '2026-10-30T23:59',
    createdAt: new Date().toISOString(),
    _count: { applications: 0 },
  }
];

export default function OutreachScholarships() {
  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  
  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule Quick Modal State
  const [scheduleModalItem, setScheduleModalItem] = useState<any | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    publishOption: 'OPEN', // 'OPEN' (Publish Now), 'SCHEDULED' (Schedule Time), 'DRAFT' (Draft)
    openDate: '',
    closeDate: '',
    level: 'ALL',
  });

  const [customFields, setCustomFields] = useState<{name: string, label: string, type: string, required: boolean}[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evts, apps] = await Promise.all([
        outreachAPI.getEvents().catch(() => null),
        outreachAPI.getApplications().catch(() => null)
      ]);

      const savedLocal = localStorage.getItem('enako_outreach_scholarships');
      const localEvents = savedLocal ? JSON.parse(savedLocal) : [];

      let scholarshipEvents = (evts || []).filter((e: any) => e.type === 'SCHOLARSHIP');

      if (scholarshipEvents.length === 0 && localEvents.length > 0) {
        scholarshipEvents = localEvents;
      } else if (scholarshipEvents.length === 0) {
        scholarshipEvents = INITIAL_DEMO_SCHOLARSHIPS;
      }

      setEvents(scholarshipEvents);
      setApplications((apps || []).filter((a: any) => a.type === 'SCHOLARSHIP'));
    } catch (err) {
      toast.error('Failed to load scholarships data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveLocalEvents = (updated: any[]) => {
    setEvents(updated);
    localStorage.setItem('enako_outreach_scholarships', JSON.stringify(updated));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', label: '', type: 'file', required: true }]);
  };

  const updateCustomField = (index: number, key: string, value: any) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCreateOrPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Scholarship title is required');
      return;
    }

    if (form.publishOption === 'SCHEDULED' && !form.openDate) {
      toast.error('Please specify a scheduled publication date & time');
      return;
    }

    setIsSubmitting(true);

    const isScheduled = form.publishOption === 'SCHEDULED';
    const status = isScheduled ? 'SCHEDULED' : (form.publishOption === 'DRAFT' ? 'DRAFT' : 'OPEN');

    const newScholarship = {
      id: `sch-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      type: 'SCHOLARSHIP',
      status,
      level: form.level,
      openDate: form.openDate ? new Date(form.openDate).toISOString() : (status === 'OPEN' ? new Date().toISOString() : null),
      closeDate: form.closeDate ? new Date(form.closeDate).toISOString() : null,
      customFields,
      createdAt: new Date().toISOString(),
      _count: { applications: 0 },
    };

    try {
      await outreachAPI.createEvent(newScholarship).catch(() => null);

      const updatedList = [newScholarship, ...events];
      saveLocalEvents(updatedList);

      if (status === 'OPEN') {
        toast.success('Scholarship published live successfully!');
      } else if (status === 'SCHEDULED') {
        const formattedDate = new Date(form.openDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
        toast.success(`Scholarship scheduled to publish on ${formattedDate}`);
      } else {
        toast.success('Scholarship saved as Draft');
      }

      setIsModalOpen(false);
      setForm({ title: '', description: '', publishOption: 'OPEN', openDate: '', closeDate: '', level: 'ALL' });
      setCustomFields([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create scholarship');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish Now Handler
  const handlePublishNow = async (id: string) => {
    try {
      await outreachAPI.updateEventStatus(id, 'OPEN').catch(() => null);
      const updated = events.map(e => e.id === id ? { ...e, status: 'OPEN', openDate: new Date().toISOString() } : e);
      saveLocalEvents(updated);
      toast.success('Scholarship published live now!');
    } catch (err) {
      toast.error('Failed to publish scholarship');
    }
  };

  // Quick Schedule Submission
  const handleSaveScheduledTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDateTime) {
      toast.error('Please pick a date & time to schedule');
      return;
    }

    if (!scheduleModalItem) return;

    try {
      await outreachAPI.updateEventStatus(scheduleModalItem.id, 'SCHEDULED').catch(() => null);
      const updated = events.map(e => 
        e.id === scheduleModalItem.id 
          ? { ...e, status: 'SCHEDULED', openDate: new Date(scheduledDateTime).toISOString() } 
          : e
      );
      saveLocalEvents(updated);

      const formatted = new Date(scheduledDateTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
      toast.success(`Scholarship scheduled to publish on ${formatted}`);
      setScheduleModalItem(null);
      setScheduledDateTime('');
    } catch (err) {
      toast.error('Failed to schedule scholarship');
    }
  };

  // Toggle status (Draft / Closed / Open)
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await outreachAPI.updateEventStatus(id, newStatus).catch(() => null);
      const updated = events.map(e => e.id === id ? { ...e, status: newStatus } : e);
      saveLocalEvents(updated);
      toast.success(`Scholarship status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Delete scholarship
  const handleDeleteScholarship = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveLocalEvents(updated);
    toast.success('Scholarship removed');
  };

  const filteredApps = applications.filter(app => {
    if (selectedLevelFilter && app.level !== selectedLevelFilter) return false;
    return true;
  });

  // Dynamic banner calculation
  const scheduledItem = events.find(e => e.status === 'SCHEDULED' || (e.openDate && new Date(e.openDate) > new Date()));
  const activeLiveItem = events.find(e => e.status === 'OPEN' || e.status === 'ACTIVE');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Outreach Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Scholarship & Grant Management
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            Create, schedule, publish, and audit scholarship programs & applicant submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="p-2.5 border border-outline-variant/40 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => {
              setForm({ title: '', description: '', publishOption: 'OPEN', openDate: '', closeDate: '', level: 'ALL' });
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Publish New Scholarship</span>
          </button>
        </div>
      </div>

      {/* Public Portal Announcement Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="uppercase text-[10px] tracking-wider block text-amber-700 font-extrabold">Public Portal Active Announcement</span>
          {scheduledItem ? (
            <span>
              "Scholarship applications for <strong>{scheduledItem.title}</strong> are scheduled to open on{' '}
              {new Date(scheduledItem.openDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}."
            </span>
          ) : activeLiveItem ? (
            <span>"Scholarship applications for <strong>{activeLiveItem.title}</strong> are currently LIVE and open for submissions."</span>
          ) : (
            <span>"Scholarship applications will open soon. Check back for upcoming grants and fellowships."</span>
          )}
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Scholarship List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-outline-variant/30 bg-slate-50 font-bold text-slate-700 flex justify-between items-center text-xs uppercase tracking-wider">
              <span>Scholarship Drives</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-mono">{events.length}</span>
            </div>

            <div className="p-4 space-y-4">
              {events.map((ev) => {
                const isOpen = ev.status === 'OPEN' || ev.status === 'ACTIVE';
                const isScheduled = ev.status === 'SCHEDULED' || (ev.openDate && new Date(ev.openDate) > new Date());
                const isDraft = ev.status === 'DRAFT';

                return (
                  <div key={ev.id} className="p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-all space-y-3 bg-white">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{ev.title}</h3>
                      <button
                        onClick={() => handleDeleteScholarship(ev.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between pt-1">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>LIVE PUBLISHED</span>
                        </span>
                      ) : isScheduled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>SCHEDULED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                          <span>DRAFT</span>
                        </span>
                      )}

                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {ev._count?.applications || 0} Apps
                      </span>
                    </div>

                    {/* Date Details */}
                    {ev.openDate && (
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 pt-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>Opens: {new Date(ev.openDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {!isOpen && (
                        <button
                          onClick={() => handlePublishNow(ev.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSchedulingEvent(ev);
                          setScheduledDateTime(ev.openDate ? new Date(ev.openDate).toISOString().slice(0, 16) : '');
                        }}
                        className="py-1.5 px-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                        title="Set or update scheduled publish time"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Schedule</span>
                      </button>

                      {isOpen && (
                        <button
                          onClick={() => handleStatusChange(ev.id, 'DRAFT')}
                          className="py-1.5 px-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold"
                          title="Unpublish to draft"
                        >
                          Draft
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500 text-xs font-medium">
                  No scholarships registered yet. Click "Publish New Scholarship" to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Applicants Directory Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-outline-variant/30 bg-slate-50 flex justify-between items-center gap-4">
              <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Scholarship Applicants Registry</span>
              </h2>
              
              <select 
                className="bg-white border border-outline-variant/50 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                value={selectedLevelFilter}
                onChange={e => setSelectedLevelFilter(e.target.value)}
              >
                <option value="">All Academic Levels</option>
                <option value="PRIMARY">Primary Level</option>
                <option value="SECONDARY">Secondary Level</option>
                <option value="UNIVERSITY">University & Higher Ed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="p-4">Applicant Name</th>
                    <th className="p-4">Academic Level</th>
                    <th className="p-4">Application Status</th>
                    <th className="p-4 text-right">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium animate-pulse">Loading applicants...</td>
                    </tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No applicant records found for this filter.</td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{app.applicantName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{app.email}</p>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase rounded-md border border-blue-200">
                            {app.level || 'PRIMARY'}
                          </span>
                        </td>
                        <td className="p-4 font-bold">
                          <span className={`inline-block px-2.5 py-1 text-[10px] uppercase rounded-md border ${
                            app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-500">
                          {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Publish & Schedule New Scholarship */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Publish or Schedule Scholarship</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure publication state, target dates & application requirements.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <form id="scholarship-form" onSubmit={handleCreateOrPublish} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Scholarship Program Title *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={form.title} 
                      onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                      placeholder="e.g. 2026 Primary Excellence Scholarship"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Program Description & Eligibility Criteria
                    </label>
                    <textarea 
                      rows={3}
                      value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm resize-none"
                      placeholder="Specify requirements, eligible regions, grant coverage, etc..."
                    />
                  </div>

                  {/* Publication Action Selector */}
                  <div className="p-4 bg-slate-50 border border-outline-variant/40 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Publication Mode *
                    </label>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, publishOption: 'OPEN' })}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          form.publishOption === 'OPEN'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>Publish Live Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, publishOption: 'SCHEDULED' })}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          form.publishOption === 'SCHEDULED'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Schedule Date/Time</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, publishOption: 'DRAFT' })}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          form.publishOption === 'DRAFT'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Save as Draft</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Date & Time Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        {form.publishOption === 'SCHEDULED' ? 'Scheduled Opening Date & Time *' : 'Opening Date & Time'}
                      </label>
                      <input 
                        type="datetime-local" 
                        required={form.publishOption === 'SCHEDULED'}
                        value={form.openDate} 
                        onChange={e => setForm({...form, openDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Application Closing Date & Time
                      </label>
                      <input 
                        type="datetime-local" 
                        value={form.closeDate} 
                        onChange={e => setForm({...form, closeDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Custom Application Required Fields */}
                  <div className="border-t border-outline-variant/30 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Custom Required Documents & Fields</h3>
                      <button type="button" onClick={addCustomField} className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Field
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-outline-variant/30">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text" placeholder="Field Identifier (e.g. waec_cert)" 
                                value={field.name} onChange={e => updateCustomField(idx, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant/50 outline-none font-mono" required
                              />
                              <input 
                                type="text" placeholder="Label (e.g. Official WAEC Certificate)" 
                                value={field.label} onChange={e => updateCustomField(idx, 'label', e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant/50 outline-none font-medium" required
                              />
                            </div>
                            <div className="flex gap-4 items-center">
                              <select 
                                value={field.type} onChange={e => updateCustomField(idx, 'type', e.target.value)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-outline-variant/50 outline-none font-bold"
                              >
                                <option value="file">File Upload Attachment</option>
                                <option value="text">Short Text Response</option>
                              </select>
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={e => updateCustomField(idx, 'required', e.target.checked)}
                                  className="rounded text-primary focus:ring-primary"
                                /> Required Field
                              </label>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeCustomField(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {customFields.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No custom fields added. Default fields (Applicant Name, Email, Level) will be used.</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-outline-variant/30 bg-slate-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-wider">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="scholarship-form" 
                  disabled={isSubmitting} 
                  className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md active:scale-[0.98]"
                >
                  {isSubmitting ? 'Processing...' : (form.publishOption === 'OPEN' ? 'Publish Live Now' : form.publishOption === 'SCHEDULED' ? 'Schedule Publication' : 'Save as Draft')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Schedule Date/Time Modal */}
      <AnimatePresence>
        {schedulingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 border border-outline-variant/30">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Schedule Publication
                </h3>
                <button onClick={() => setSchedulingEvent(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Set the exact date & time when <strong>{schedulingEvent.title}</strong> will automatically open on the public portal.
              </p>

              <form onSubmit={handleSaveScheduledTime} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Publish Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingEvent(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90"
                  >
                    Save Scheduled Time
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
