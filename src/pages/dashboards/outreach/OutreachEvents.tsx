import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { toast } from 'sonner';

export default function OutreachEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    type: 'SCHOLARSHIP',
    customType: '',
    targetSchools: '', // Comma separated
    videoUrl: '',
    storyTitle: '',
    storyTitleFr: '',
    storyDescription: '',
    storyDescriptionFr: '',
    storyMediaType: 'IMAGE',
  });

  const [storyMediaBase64, setStoryMediaBase64] = useState<string | null>(null);
  const [gallery, setGallery] = useState<any[]>([]); // [{ fileBase64: string, name: string, caption: '', captionFr: '' }]

  const fetchEvents = async () => {
    try {
      const data = await outreachAPI.getEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            fileBase64: reader.result as string,
            name: file.name
          };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addGalleryItem = () => {
    setGallery(prev => [...prev, { fileBase64: '', name: '', caption: '', captionFr: '' }]);
  };

  const removeGalleryItem = (idx: number) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGalleryTextChange = (idx: number, field: string, value: string) => {
    setGallery(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetSchools = form.targetSchools.split(',').map(s => s.trim()).filter(s => s);
      const selectedType = form.type === 'CUSTOM' ? form.customType.toUpperCase().replace(/\s+/g, '_') : form.type;
      
      const payload = {
        title: form.title,
        titleFr: form.titleFr,
        description: form.description,
        descriptionFr: form.descriptionFr,
        type: selectedType,
        targetSchools,
        videoUrl: form.videoUrl || null,
        storyTitle: form.storyTitle || null,
        storyTitleFr: form.storyTitleFr || null,
        storyDescription: form.storyDescription || null,
        storyDescriptionFr: form.storyDescriptionFr || null,
        storyMediaType: form.storyMediaType || null,
        storyMediaBase64,
        gallery: gallery.filter(g => g.fileBase64).map(g => ({
          fileBase64: g.fileBase64,
          caption: g.caption,
          captionFr: g.captionFr
        }))
      };

      await outreachAPI.createEvent(payload);
      toast.success('Outreach Event created successfully!');
      
      // Reset State
      setIsModalOpen(false);
      setForm({
        title: '',
        titleFr: '',
        description: '',
        descriptionFr: '',
        type: 'SCHOLARSHIP',
        customType: '',
        targetSchools: '',
        videoUrl: '',
        storyTitle: '',
        storyTitleFr: '',
        storyDescription: '',
        storyDescriptionFr: '',
        storyMediaType: 'IMAGE',
      });
      setStoryMediaBase64(null);
      setGallery([]);
      
      fetchEvents();
    } catch (err) {
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await outreachAPI.updateEventStatus(id, newStatus);
      toast.success('Status updated');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 pb-20">
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary">Manage Outreach Events</h3>
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Create Event</button>
        </div>

        {loading ? (
          <p className="text-secondary">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/50 text-secondary text-sm">
                  <th className="pb-3 font-semibold">Title (EN)</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Schools</th>
                  <th className="pb-3 font-semibold">Applicants</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-center text-secondary">No events found.</td></tr>
                )}
                {events.map(ev => (
                  <tr key={ev.id} className="border-b border-outline-variant/20 last:border-0">
                    <td className="py-4 font-bold text-primary">{ev.title}</td>
                    <td className="py-4 text-sm text-secondary">{ev.type}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ev.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-secondary">
                      {ev.targetSchools && ev.targetSchools.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ev.targetSchools.map((s: string, i: number) => (
                            <span key={i} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-4 text-sm font-bold">{ev._count?.applications || 0}</td>
                    <td className="py-4">
                      <button onClick={() => toggleStatus(ev.id, ev.status)} className="text-sm font-bold text-blue-600 hover:underline">
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-display text-xl font-bold text-primary">Create Outreach Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title (English)</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Title (French)</label>
                  <input required value={form.titleFr} onChange={e => setForm({...form, titleFr: e.target.value})} type="text" className="w-full border p-2 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Description (English)</label>
                  <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded h-24" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description (French)</label>
                  <textarea required value={form.descriptionFr} onChange={e => setForm({...form, descriptionFr: e.target.value})} className="w-full border p-2 rounded h-24" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Event Category / Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border p-2 rounded bg-white">
                    <option value="SCHOLARSHIP">Scholarship Support</option>
                    <option value="CLEAN_WATER">Clean Water Initiative</option>
                    <option value="HEALTHCARE">Community Health Support</option>
                    <option value="WOMEN_MOTHERS">Single Mothers Assistance</option>
                    <option value="COMMUNITY_RELIEF">Community Relief</option>
                    <option value="FUNDRAISER">General Fundraiser</option>
                    <option value="CUSTOM">Custom / New Category</option>
                  </select>
                </div>
                {form.type === 'CUSTOM' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Custom Category Name</label>
                    <input required value={form.customType} onChange={e => setForm({...form, customType: e.target.value})} type="text" className="w-full border p-2 rounded" placeholder="e.g. SOLAR_POWER" />
                  </div>
                )}
              </div>

              {form.type === 'SCHOLARSHIP' ? (
                <div>
                  <label className="block text-sm font-semibold mb-1">Target Schools (Comma separated)</label>
                  <input required value={form.targetSchools} onChange={e => setForm({...form, targetSchools: e.target.value})} type="text" className="w-full border p-2 rounded" placeholder="e.g. University of Buea, UB, Douala University" />
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-outline-variant/30">
                  <h4 className="font-bold text-sm text-primary">Media & Gallery Section</h4>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Featured Video Link (Optional)</label>
                    <input value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} type="text" className="w-full border p-2 rounded" placeholder="https://youtube.com/watch?v=..." />
                  </div>

                  {/* Story Section */}
                  <div className="border border-outline-variant/30 p-3 rounded-lg space-y-3 bg-slate-50">
                    <h5 className="font-semibold text-xs text-primary">Impact Story Card</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story Title (EN)</label>
                        <input value={form.storyTitle} onChange={e => setForm({...form, storyTitle: e.target.value})} type="text" className="w-full border p-2 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story Title (FR)</label>
                        <input value={form.storyTitleFr} onChange={e => setForm({...form, storyTitleFr: e.target.value})} type="text" className="w-full border p-2 rounded text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story Body (EN)</label>
                        <textarea value={form.storyDescription} onChange={e => setForm({...form, storyDescription: e.target.value})} className="w-full border p-2 rounded text-xs h-16" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story Body (FR)</label>
                        <textarea value={form.storyDescriptionFr} onChange={e => setForm({...form, storyDescriptionFr: e.target.value})} className="w-full border p-2 rounded text-xs h-16" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story File Upload</label>
                        <input type="file" accept="image/*,video/*" onChange={e => handleFileChange(e, (base64) => setStoryMediaBase64(base64))} className="w-full text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Story File Type</label>
                        <select value={form.storyMediaType} onChange={e => setForm({...form, storyMediaType: e.target.value})} className="w-full border p-1 rounded text-xs bg-white">
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Items */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="font-semibold text-xs text-primary">Event Image Gallery</h5>
                      <button type="button" onClick={addGalleryItem} className="text-xs font-bold text-blue-600 hover:underline">+ Add Gallery Image</button>
                    </div>

                    <div className="space-y-3">
                      {gallery.map((item, idx) => (
                        <div key={idx} className="border p-3 rounded space-y-2 bg-slate-50 relative">
                          <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-2 right-2 text-red-500 text-sm font-bold">&times;</button>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold mb-1">Select File</label>
                              <input required type="file" accept="image/*" onChange={e => handleGalleryFileChange(idx, e)} className="w-full text-xs" />
                              {item.name && <span className="text-[10px] text-green-600 font-bold block mt-1">{item.name}</span>}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[10px] font-semibold mb-0.5">Caption (EN)</label>
                                <input required value={item.caption} onChange={e => handleGalleryTextChange(idx, 'caption', e.target.value)} type="text" className="w-full border p-1 rounded text-xs" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold mb-0.5">Caption (FR)</label>
                                <input required value={item.captionFr} onChange={e => handleGalleryTextChange(idx, 'captionFr', e.target.value)} type="text" className="w-full border p-1 rounded text-xs" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-outline-variant/30">
                <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-6 py-2 rounded-lg font-bold disabled:bg-gray-400">
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
