import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { toast } from 'sonner';

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

  const totalFundraisingGoal = events.reduce((sum, e) => sum + (parseFloat(e.targetAmount) || 0), 0);
  const totalFundraisingRaised = events.reduce((sum, e) => sum + (parseFloat(e.currentAmount) || 0), 0);
  const activeEventsCount = events.filter(e => e.status === 'ACTIVE').length;

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

  return (
    <div className="space-y-6 pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Outreach Manager Portal
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-900">Outreach Events & Fundraisers</h2>
          <p className="text-slate-600 text-sm mt-1">
            Create, track, and manage scholarship drives, fundraising galas, and field campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEvents}
            className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-800 transition-all shadow-sm shrink-0"
          >
            Publish Event / Fundraiser
          </button>
        </div>
      </div>

      {/* Featured Main Card Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="sm:col-span-2 lg:col-span-2 bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Featured Initiative</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {activeEventsCount} Active Drives
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Campaign Goal & Mobilization</h3>
            <p className="text-sm text-slate-600 mb-4">Total capital allocated to humanitarian drives, medical tours, and education assistance.</p>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalFundraisingRaised.toLocaleString()} XAF
            </div>
            <div className="text-xs text-slate-500 mt-1">
              of {totalFundraisingGoal.toLocaleString()} XAF Target Allocation
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all" 
              style={{ width: `${totalFundraisingGoal > 0 ? Math.min(100, Math.round((totalFundraisingRaised / totalFundraisingGoal) * 100)) : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Active Events</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeEventsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Currently taking contributions</p>
          </div>
          <div className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md mt-3 inline-block self-start">
            Live Deployment
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Initiatives</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{events.length}</div>
            <p className="text-xs text-slate-500 mt-1">Scholarships, Galas & Relief</p>
          </div>
          <div className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md mt-3 inline-block self-start">
            All Records
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Filter Event Type:</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">All Event Categories</option>
            <option value="FUNDRAISER">Fundraisers</option>
            <option value="SCHOLARSHIP">Scholarship Drives</option>
            <option value="CLEAN_WATER">Clean Water Initiatives</option>
            <option value="HEALTH_CAMPAIGN">Community Health Campaigns</option>
            <option value="EMERGENCY_AID">Emergency Aid Drives</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Total Events: <strong className="text-slate-900">{filteredEvents.length}</strong>
        </span>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm font-medium animate-pulse">
            Loading events & fundraisers from database...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 space-y-3">
            <h4 className="font-bold text-slate-900 text-base">No Events / Fundraisers Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click <strong>"Publish Event / Fundraiser"</strong> above to launch a new scholarship drive, water campaign, or charity fundraiser.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const target = parseFloat(ev.targetAmount || '0');
            const current = parseFloat(ev.currentAmount || '0');
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <div key={ev.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${getTypeBadgeColor(ev.type)}`}>
                      {ev.type.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => handleStatusToggle(ev.id, ev.status)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded cursor-pointer transition-colors ${ev.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title="Click to toggle status"
                    >
                      {ev.status}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">{ev.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{ev.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {target > 0 && (
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>Fundraising Goal: {current.toLocaleString()} XAF</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                    <span>Date: {new Date(ev.createdAt).toLocaleDateString()}</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Publish Outreach Event / Fundraiser</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold text-slate-800">
              <div>
                <label className="block mb-1 text-slate-600 uppercase tracking-wider">Event / Fundraiser Title (English) *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Annual Cameroon Clean Water Gala & Borehole Drive"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-600 uppercase tracking-wider">Title (French)</label>
                <input
                  type="text"
                  placeholder="Titre de l'événement en français..."
                  value={form.titleFr}
                  onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600 uppercase tracking-wider">Event Category *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
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
                    <label className="block mb-1 text-slate-600 uppercase tracking-wider">Custom Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. YOUTH_TECH"
                      value={form.customType}
                      onChange={(e) => setForm({ ...form, customType: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-slate-600 uppercase tracking-wider">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Douala, Kumba, Yaoundé"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600 uppercase tracking-wider">Target Fundraising Goal (XAF)</label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 uppercase tracking-wider">Target Schools / Beneficiaries</label>
                  <input
                    type="text"
                    placeholder="Comma-separated list..."
                    value={form.targetSchools}
                    onChange={(e) => setForm({ ...form, targetSchools: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600 uppercase tracking-wider">Event Description (English) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe event schedule, fundraising objectives, and impact..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-600 uppercase tracking-wider">Media Upload (Select Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoryMediaChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 transition-all uppercase tracking-widest disabled:opacity-50"
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
