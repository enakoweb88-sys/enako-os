import React, { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { toast } from 'sonner';

export default function OutreachEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    type: 'SCHOLARSHIP',
    targetSchools: '' // Comma separated
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetSchools = form.targetSchools.split(',').map(s => s.trim()).filter(s => s);
      await outreachAPI.createEvent({
        ...form,
        targetSchools
      });
      toast.success('Scholarship Event created!');
      setIsModalOpen(false);
      setForm({ title: '', titleFr: '', description: '', descriptionFr: '', type: 'SCHOLARSHIP', targetSchools: '' });
      fetchEvents();
    } catch (err) {
      toast.error('Failed to create event');
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
              <h3 className="font-display text-xl font-bold text-primary">Create Scholarship</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title (English)</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Title (French)</label>
                  <input required value={form.titleFr} onChange={e => setForm({...form, titleFr: e.target.value})} type="text" className="w-full border p-2 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Description (English)</label>
                  <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded h-24" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description (French)</label>
                  <textarea required value={form.descriptionFr} onChange={e => setForm({...form, descriptionFr: e.target.value})} className="w-full border p-2 rounded h-24" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Target Schools (Comma separated)</label>
                <input required value={form.targetSchools} onChange={e => setForm({...form, targetSchools: e.target.value})} type="text" className="w-full border p-2 rounded" placeholder="e.g. University of Buea, UB, Douala University" />
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
