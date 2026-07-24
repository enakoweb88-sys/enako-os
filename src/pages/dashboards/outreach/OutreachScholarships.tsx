import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api/outreach';
import { toast } from 'sonner';
import { 
  BookOpen, Plus, Target, CheckCircle2, Trash2, 
  FileText, Sparkles, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OutreachScholarships() {
  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for new Scholarship Event
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'ACTIVE',
    openDate: '',
    closeDate: '',
  });

  const [customFields, setCustomFields] = useState<{name: string, label: string, type: string, required: boolean}[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evts, apps] = await Promise.all([
        outreachAPI.getEvents(),
        outreachAPI.getApplications()
      ]);
      setEvents(evts.filter(e => e.type === 'SCHOLARSHIP'));
      setApplications(apps.filter(a => a.type === 'SCHOLARSHIP'));
    } catch (err) {
      toast.error('Failed to load scholarships data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await outreachAPI.createEvent({
        ...form,
        type: 'SCHOLARSHIP',
        customFields: customFields
      });
      toast.success('Scholarship created successfully');
      setIsModalOpen(false);
      fetchData();
      setForm({ title: '', description: '', status: 'ACTIVE', openDate: '', closeDate: '' });
      setCustomFields([]);
    } catch (err) {
      toast.error('Failed to create scholarship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (selectedLevelFilter && app.level !== selectedLevelFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Scholarship Management
          </h1>
          <p className="text-slate-500 font-medium">Create scholarships and manage applicants.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> New Scholarship
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low font-bold text-slate-700 flex justify-between items-center">
              Active Scholarships
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{events.length}</span>
            </div>
            <div className="p-4 space-y-4">
              {events.map(ev => (
                <div key={ev.id} className="p-4 rounded-xl border border-outline-variant/30 hover:border-primary/30 transition-colors">
                  <h3 className="font-bold text-slate-900">{ev.title}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {ev.status}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {ev._count?.applications || 0} Apps
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500 text-sm">No scholarships created yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center gap-4">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Applications
              </h2>
              <div className="flex gap-2">
                <select 
                  className="bg-white border border-outline-variant/50 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  value={selectedLevelFilter}
                  onChange={e => setSelectedLevelFilter(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="UNIVERSITY">University</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="p-4 font-bold">Applicant Name</th>
                    <th className="p-4 font-bold">Level</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td>
                    </tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No applications found.</td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{app.applicantName}</p>
                          <p className="text-xs text-slate-500">{app.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                            {app.level}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded-md ${
                            app.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                            'bg-yellow-50 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-black text-slate-900">Create New Scholarship</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="scholarship-form" onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                    <input 
                      type="text" required
                      value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      placeholder="e.g. 2026 Primary Excellence Scholarship"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      rows={3}
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                      placeholder="Brief details about the scholarship..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Open Date</label>
                      <input 
                        type="datetime-local" 
                        value={form.openDate} onChange={e => setForm({...form, openDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Close Date</label>
                      <input 
                        type="datetime-local" 
                        value={form.closeDate} onChange={e => setForm({...form, closeDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/30 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700">Custom Required Fields</h3>
                      <button type="button" onClick={addCustomField} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Field
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-outline-variant/30">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text" placeholder="Field Name (e.g. waec_cert)" 
                                value={field.name} onChange={e => updateCustomField(idx, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/50 outline-none font-mono" required
                              />
                              <input 
                                type="text" placeholder="Label (e.g. WAEC Certificate)" 
                                value={field.label} onChange={e => updateCustomField(idx, 'label', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/50 outline-none font-medium" required
                              />
                            </div>
                            <div className="flex gap-4 items-center">
                              <select 
                                value={field.type} onChange={e => updateCustomField(idx, 'type', e.target.value)}
                                className="px-3 py-2 text-sm rounded-lg border border-outline-variant/50 outline-none"
                              >
                                <option value="file">File Upload</option>
                                <option value="text">Text Input</option>
                              </select>
                              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={e => updateCustomField(idx, 'required', e.target.checked)}
                                  className="rounded text-primary focus:ring-primary"
                                /> Required
                              </label>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeCustomField(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {customFields.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No custom fields added. Default fields (Name, Email, Level) will be used.</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-outline-variant/30 bg-slate-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="scholarship-form" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Creating...' : 'Create Scholarship'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
