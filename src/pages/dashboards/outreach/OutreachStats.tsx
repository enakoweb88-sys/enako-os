import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { outreachAPI } from '../../../lib/api';
import { toast } from 'sonner';

export default function OutreachStats() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStat, setEditingStat] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await outreachAPI.getPublicImpactStats();
            setStats(data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingStat.id) {
                await outreachAPI.updatePublicImpactStat(editingStat.id, {
                    key: editingStat.key,
                    value: editingStat.value,
                    label: editingStat.label,
                    section: editingStat.section,
                    order: parseInt(editingStat.order) || 0
                });
                toast.success('Statistic updated successfully');
            } else {
                await outreachAPI.createPublicImpactStat({
                    key: editingStat.key,
                    value: editingStat.value,
                    label: editingStat.label,
                    section: editingStat.section,
                    order: parseInt(editingStat.order) || 0
                });
                toast.success('Statistic created successfully');
            }
            setEditingStat(null);
            fetchStats();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save statistic');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this statistic?')) return;
        try {
            await outreachAPI.deletePublicImpactStat(id);
            toast.success('Statistic deleted');
            fetchStats();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete statistic');
        }
    };

    return (
        <div className="space-y-6 font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Outreach Impact Statistics</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage dynamic figures shown on the public landing page and impact portal</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditingStat({ key: '', value: '', label: '', section: 'hero', order: 0 })}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Add Statistic
                    </button>
                    <button 
                        onClick={fetchStats}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Featured Overview Card + Sub-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Public Telemetry Overview</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium">Configured Landing Page Statistics</p>
                            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{stats.length} Active Statistics</p>
                            <p className="text-slate-600 text-xs mt-2">
                                Dynamic impact figures rendered across the hero, stories, community clean water, and scholarship program sections.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Hero Section Stats: <strong className="text-slate-900">{stats.filter(s => s.section === 'hero').length}</strong></span>
                        <span>Program Stats: <strong className="text-emerald-700">{stats.filter(s => s.section?.startsWith('program')).length}</strong></span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Display Integrity</span>
                        <div className="space-y-2 mt-3">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span>Published Figures</span>
                                <span className="font-mono text-emerald-700 font-bold">{stats.length}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span>Sections Covered</span>
                                <span className="font-mono text-slate-800">{new Set(stats.map(s => s.section)).size}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                        Live site figures updated automatically
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-12 bg-white border border-slate-200 rounded-lg text-center text-sm text-slate-500 animate-pulse">
                    Loading impact figures...
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-base font-bold text-slate-900">Configured Impact Metrics</h3>
                        <span className="text-xs text-slate-500 font-medium">{stats.length} metrics active</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Key (ID)</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Label</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Value</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Section</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Order</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.map((stat) => (
                                    <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{stat.key}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{stat.label}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{stat.value}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase border border-slate-200">
                                                {stat.section}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{stat.order}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingStat(stat)} 
                                                    className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(stat.id)} 
                                                    className="px-2.5 py-1 text-xs font-semibold rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {stats.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">No statistics found. Add one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {editingStat && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
                        >
                            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="text-base font-bold text-slate-900">{editingStat.id ? 'Edit Statistic' : 'Add Statistic'}</h3>
                                <button onClick={() => setEditingStat(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Key</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. partner_schools"
                                        value={editingStat.key}
                                        onChange={e => setEditingStat({ ...editingStat, key: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 font-mono text-slate-900"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Unique identifier used by the client code.</p>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Label</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Partner Schools"
                                        value={editingStat.label}
                                        onChange={e => setEditingStat({ ...editingStat, label: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Value</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 120+"
                                        value={editingStat.value}
                                        onChange={e => setEditingStat({ ...editingStat, value: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Section</label>
                                        <select
                                            required
                                            value={editingStat.section}
                                            onChange={e => setEditingStat({ ...editingStat, section: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900"
                                        >
                                            <option value="hero">Hero (Home Page)</option>
                                            <option value="impact">Impact (Landing Page)</option>
                                            <option value="stories">Stories Page</option>
                                            <option value="program_scholarships">Program: Scholarships</option>
                                            <option value="program_scholarships-primary">Program: Primary Scholarships</option>
                                            <option value="program_scholarships-secondary">Program: Secondary Scholarships</option>
                                            <option value="program_scholarships-university">Program: University Scholarships</option>
                                            <option value="program_clean-water-initiative">Program: Clean Water</option>
                                            <option value="program_teacher-rewards">Program: Teacher Rewards</option>
                                            <option value="program_community-health-support">Program: Community Health</option>
                                            <option value="program_single-mothers-assistance">Program: Single Mothers</option>
                                            <option value="program_youth-empowerment">Program: Youth Empowerment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Order</label>
                                        <input
                                            type="number"
                                            required
                                            value={editingStat.order}
                                            onChange={e => setEditingStat({ ...editingStat, order: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingStat(null)}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Statistic'}
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
