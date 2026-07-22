import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { toast } from 'sonner';
import { 
  Calendar, Plus, Target, CheckCircle2, Trash2, Heart, 
  GraduationCap, Droplets, Stethoscope, AlertTriangle, RefreshCw, 
  FileText, Video, Image as ImageIcon, Sparkles, Filter
} from 'lucide-react';

export default function OutreachEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    type: 'FUNDRAISER',
    customType: '',
    targetSchools: '', // Comma separated target schools or communities
    targetAmount: '5000000',
    currentAmount: '0',
    location: '',
    eventDate: '',
    videoUrl: '',
    storyTitle: '',
    storyTitleFr: '',
    storyDescription: '',
    storyDescriptionFr: '',
    storyMediaType: 'IMAGE',
  });

  const [storyMediaBase64, setStoryMediaBase64] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await outreachAPI.getEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load outreach events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.80));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStoryMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Story media must be under 5MB. Please compress the file first.');
      return;
    }
    if (file.type.startsWith('image/')) {
      // Compress images before encoding
      compressImageToBase64(file).then(compressed => setStoryMediaBase64(compressed));
    } else {
      // Non-image (video) — just read as data URL (already validated to 5MB)
      const reader = new FileReader();
      reader.onloadend = () => setStoryMediaBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetSchools = form.targetSchools.split(',').map(s => s.trim()).filter(s => s);
      const selectedType = form.type === 'CUSTOM' ? form.customType.toUpperCase().replace(/\s+/g, '_') : form.type;
      
      const payload = {
        title: form.title,
        titleFr: form.titleFr || form.title,
        description: form.description,
        descriptionFr: form.descriptionFr || form.description,
        type: selectedType,
        targetSchools,
        targetAmount: form.targetAmount ? parseFloat(form.targetAmount) : 0,
        currentAmount: form.currentAmount ? parseFloat(form.currentAmount) : 0,
        location: form.location || 'Cameroon',
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : new Date().toISOString(),
        videoUrl: form.videoUrl || null,
        storyTitle: form.storyTitle || null,
        storyTitleFr: form.storyTitleFr || null,
        storyDescription: form.storyDescription || null,
        storyDescriptionFr: form.storyDescriptionFr || null,
        storyMediaType: form.storyMediaType || 'IMAGE',
        storyMediaBase64,
      };

      await outreachAPI.createEvent(payload);
      toast.success('Outreach Event / Fundraiser published successfully!');
      
      setIsModalOpen(false);
      // Reset form
      setForm({
        title: '',
        titleFr: '',
        description: '',
        descriptionFr: '',
        type: 'FUNDRAISER',
        customType: '',
        targetSchools: '',
        targetAmount: '5000000',
        currentAmount: '0',
        location: '',
        eventDate: '',
        videoUrl: '',
        storyTitle: '',
        storyTitleFr: '',
        storyDescription: '',
        storyDescriptionFr: '',
        storyMediaType: 'IMAGE',
      });
      setStoryMediaBase64(null);

      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    try {
      await outreachAPI.updateEventStatus(id, newStatus);
      toast.success(`Event status updated to ${newStatus}`);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredEvents = selectedTypeFilter 
    ? events.filter(e => e.type === selectedTypeFilter) 
    : events;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'SCHOLARSHIP': return 'bg-blue-100 text-blue-800';
      case 'FUNDRAISER': return 'bg-purple-100 text-purple-800';
      case 'CLEAN_WATER': return 'bg-cyan-100 text-cyan-800';
      case 'HEALTH_CAMPAIGN': return 'bg-emerald-100 text-emerald-800';
      case 'EMERGENCY_AID': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SCHOLARSHIP': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'FUNDRAISER': return <Heart className="w-4 h-4 text-purple-600" />;
      case 'CLEAN_WATER': return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'HEALTH_CAMPAIGN': return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'EMERGENCY_AID': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Outreach Manager Portal</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-primary">Outreach Events & Fundraisers</h2>
          <p className="text-secondary text-sm mt-1">
            Create, track, and manage scholarship drives, fundraising galas, and field campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEvents}
            className="bg-surface-container border border-outline-variant/40 text-primary font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-dark transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Publish Event / Fundraiser
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Filter Event Type:</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:outline-none"
          >
            <option value="">All Event Categories</option>
            <option value="FUNDRAISER">Fundraisers</option>
            <option value="SCHOLARSHIP">Scholarship Drives</option>
            <option value="CLEAN_WATER">Clean Water Initiatives</option>
            <option value="HEALTH_CAMPAIGN">Community Health Campaigns</option>
            <option value="EMERGENCY_AID">Emergency Aid Drives</option>
          </select>
        </div>

        <span className="text-xs font-bold text-secondary">
          Total Events: <strong className="text-primary">{filteredEvents.length}</strong>
        </span>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-secondary text-sm font-medium animate-pulse">
            Loading events & fundraisers from database...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white border border-outline-variant/30 rounded-2xl p-12 text-center text-secondary space-y-3">
            <Calendar className="w-12 h-12 text-outline-variant mx-auto opacity-40" />
            <h4 className="font-bold text-primary text-base">No Events / Fundraisers Found</h4>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Click <strong>"Publish Event / Fundraiser"</strong> above to launch a new scholarship drive, water campaign, or charity fundraiser.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const target = parseFloat(ev.targetAmount || '0');
            const current = parseFloat(ev.currentAmount || '0');
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <div key={ev.id} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5 ${getTypeBadgeColor(ev.type)}`}>
                      {getTypeIcon(ev.type)}
                      <span>{ev.type.replace('_', ' ')}</span>
                    </span>

                    <button
                      onClick={() => handleStatusToggle(ev.id, ev.status)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded cursor-pointer transition-colors ${ev.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title="Click to toggle status"
                    >
                      {ev.status}
                    </button>
                  </div>

                  <h3 className="font-bold text-primary text-base mb-2">{ev.title}</h3>
                  <p className="text-xs text-secondary line-clamp-3 leading-relaxed mb-4">{ev.description}</p>
                </div>

                <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                  {target > 0 && (
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs font-bold text-primary">
                        <span>Fundraising Goal: {current.toLocaleString()} XAF</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                    <span>📅 {new Date(ev.createdAt).toLocaleDateString()}</span>
                    <span>{ev.targetSchools?.length || 0} Target Locations</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Event / Fundraiser */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-primary text-lg">Publish Outreach Event / Fundraiser</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold text-primary">
              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Event / Fundraiser Title (English) *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Annual Cameroon Clean Water Gala & Borehole Drive"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Title (French)</label>
                <input
                  type="text"
                  placeholder="Titre de l'événement en français..."
                  value={form.titleFr}
                  onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                  className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Event Category *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="FUNDRAISER">Fundraiser Gala</option>
                    <option value="SCHOLARSHIP">Scholarship Drive</option>
                    <option value="CLEAN_WATER">Clean Water Initiative</option>
                    <option value="HEALTH_CAMPAIGN">Community Health Campaign</option>
                    <option value="EMERGENCY_AID">Emergency Aid Drive</option>
                    <option value="CUSTOM">Custom Category</option>
                  </select>
                </div>

                {form.type === 'CUSTOM' && (
                  <div>
                    <label className="block mb-1 text-secondary uppercase tracking-wider">Custom Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. YOUTH_TECH"
                      value={form.customType}
                      onChange={(e) => setForm({ ...form, customType: e.target.value })}
                      className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Douala, Kumba, Yaoundé"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Target Fundraising Goal (XAF)</label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-secondary uppercase tracking-wider">Target Schools / Beneficiaries</label>
                  <input
                    type="text"
                    placeholder="Comma-separated list..."
                    value={form.targetSchools}
                    onChange={(e) => setForm({ ...form, targetSchools: e.target.value })}
                    className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Event Description (English) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe event schedule, fundraising objectives, and impact..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-surface border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-secondary uppercase tracking-wider">Media Upload (Select Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoryMediaChange}
                  className="w-full p-2 bg-surface border border-outline-variant/40 rounded-xl outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-dark transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing Event...' : 'Publish Event / Fundraiser'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
