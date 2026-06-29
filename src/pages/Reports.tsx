import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  Search,
  Filter,
  ChevronRight,
  Database,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function Reports() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'PDF' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.reports();
      setReports(res);
    } catch (e) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await api.generateReport({
        title: newReport.title,
        type: newReport.type
      });
      setShowGenModal(false);
      setNewReport({ title: '', type: 'PDF' });
      toast.success('Report generated successfully');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    if (!report.data) {
      toast.error('No raw data available for this report.');
      return;
    }
    const blob = new Blob([report.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.${report.type.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-sans">
        <FileText className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Intelligence Library Locked</h2>
        <p className="text-secondary max-w-sm">Detailed financial reports and business intelligence datasets are available for management and strategic nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Intelligence & Reports</h1>
          <p className="text-secondary text-base mt-1">Generate, schedule, and export comprehensive business intelligence datasets.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-high text-primary px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-surface-container transition-all">
            <Calendar className="w-4 h-4" />
            Schedule Report
          </button>
          <button 
            onClick={() => setShowGenModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Generate New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-outline-variant/30 p-8 rounded-[2rem] shadow-sm">
             <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Analytic Engines</h3>
             <div className="space-y-4">
                {[
                  { name: 'Financial Auditor', icon: BarChart3, color: 'text-primary' },
                  { name: 'Operational Pulse', icon: LineChart, color: 'text-green-600' },
                  { name: 'Resource Allocation', icon: PieChartIcon, color: 'text-primary-container' },
                  { name: 'Raw Data Export', icon: Database, color: 'text-secondary' },
                ].map((engine) => (
                   <button key={engine.name} onClick={() => { setShowGenModal(true); setNewReport({ ...newReport, title: engine.name + ' Report' }); }} className="w-full flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl hover:bg-surface-container-low transition-all group text-left">
                      <div className="flex items-center gap-4">
                        <engine.icon className={cn("w-5 h-5", engine.color)} />
                        <span className="text-sm font-bold text-primary">{engine.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
                   </button>
                ))}
             </div>
          </div>
          
          <div className="bg-primary-container text-white p-8 rounded-[2rem] shadow-lg">
             <h3 className="text-lg font-bold mb-4">Export Queue</h3>
             <div className="space-y-4">
                {isGenerating ? (
                  <div className="flex items-center gap-4 animate-pulse">
                     <div className="size-2 bg-white rounded-full animate-bounce"></div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">Generating {newReport.title}...</span>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-primary-fixed/60 uppercase tracking-widest text-center py-4">Queue Empty</p>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
             <h3 className="text-sm font-bold text-primary flex items-center gap-2">
               <Database className="w-5 h-5 text-primary-container" /> Generated Asset Library
             </h3>
             <div className="flex gap-4">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                   <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs outline-none w-56 focus:ring-2 focus:ring-primary-container" 
                    placeholder="Search reports..." 
                   />
                </div>
                <button className="p-3 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container-low transition-colors">
                   <Filter className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="p-4 space-y-2 flex-1">
             {loading ? (
               <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading reports...</div>
             ) : filteredReports.length === 0 ? (
               <div className="py-12 text-center space-y-3">
                  <FileText className="w-10 h-10 text-outline-variant mx-auto" />
                  <p className="text-sm font-medium text-secondary">No matching reports found.</p>
               </div>
             ) : (
               filteredReports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-container-low/50 rounded-2xl transition-all group border border-transparent hover:border-outline-variant/20 gap-4">
                     <div className="flex items-center gap-6">
                        <div className="size-14 bg-surface-container rounded-2xl flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-all shadow-sm">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-base font-bold text-primary leading-tight">{report.title}</p>
                           <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1.5">
                             {report.type} • {report.size} • Generated {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button className="p-3 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all hover:bg-surface-container">
                           <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => downloadReport(report)} className="py-3 px-5 bg-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                           <Download className="w-4 h-4" />
                           <span className="text-[11px] font-bold uppercase tracking-widest">Download</span>
                        </button>
                     </div>
                  </div>
               ))
             )}
          </div>
          
          <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest text-center">
             <button className="text-[10px] font-bold text-secondary hover:text-primary uppercase tracking-[0.3em] transition-colors">Load Archive Files</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">Intelligence Extraction</h3>
                <button onClick={() => setShowGenModal(false)} className="text-secondary hover:text-primary transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleGenerate} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-[0.2em]">Report Title *</label>
                  <input required value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container" placeholder="e.g. Annual Logistics Overview" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-[0.2em]">Output Format</label>
                  <select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container appearance-none">
                     <option>CSV (Interconnected Tags)</option>
                     <option>XLSX (Raw Datatable)</option>
                     <option>PDF (Vector High-Res)</option>
                  </select>
                </div>
                <button disabled={isGenerating} type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                  {isGenerating ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Data...
                    </>
                  ) : 'Generate Asset'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
