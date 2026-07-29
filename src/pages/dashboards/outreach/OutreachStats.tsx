import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Target, SaveAll } from 'lucide-react';
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Website Statistics
                    </h1>
                    <p className="text-gray-500 mt-1">Manage dynamic figures shown on the public landing page.</p>
                </div>
                <button
                    onClick={() => setEditingStat({ key: '', value: '', label: '', section: 'hero', order: 0 })}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Statistic
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Key (ID)</th>
                                <th className="p-4 font-bold">Label</th>
                                <th className="p-4 font-bold">Value</th>
                                <th className="p-4 font-bold">Section</th>
                                <th className="p-4 font-bold">Order</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((stat) => (
                                <tr key={stat.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500">{stat.key}</td>
                                    <td className="p-4 font-medium text-gray-900">{stat.label}</td>
                                    <td className="p-4 font-bold text-primary">{stat.value}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                            {stat.section}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{stat.order}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => setEditingStat(stat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(stat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">No statistics found. Add one to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {editingStat && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">{editingStat.id ? 'Edit Statistic' : 'Add Statistic'}</h3>
                                <button onClick={() => setEditingStat(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. partner_schools"
                                        value={editingStat.key}
                                        onChange={e => setEditingStat({ ...editingStat, key: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Unique identifier used by the client code.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Label</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Partner Schools"
                                        value={editingStat.label}
                                        onChange={e => setEditingStat({ ...editingStat, label: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 120+"
                                        value={editingStat.value}
                                        onChange={e => setEditingStat({ ...editingStat, value: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section</label>
                                        <select
                                            required
                                            value={editingStat.section}
                                            onChange={e => setEditingStat({ ...editingStat, section: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order</label>
                                        <input
                                            type="number"
                                            required
                                            value={editingStat.order}
                                            onChange={e => setEditingStat({ ...editingStat, order: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingStat(null)}
                                        className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <SaveAll className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Statistic'}
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
