import React, { useState, useEffect } from 'react';
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
import { cn } from '../lib/utils';

export default function Reports() {
  const [role, setRole] = useState<string>('ceo');
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'PDF' });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const stored = localStorage.getItem('enako_reports');
    if (stored) {
      setReports(JSON.parse(stored));
    }
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const report = {
        title: newReport.title,
        type: newReport.type.split(' ')[0],
        id: Date.now(),
        size: '2.4 MB',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      const updated = [report, ...reports];
      setReports(updated);
      localStorage.setItem('enako_reports', JSON.stringify(updated));
      setIsGenerating(false);
      setShowGenModal(false);
      setNewReport({ title: '', type: 'PDF' });
    }, 2000);
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <FileText className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Intelligence Library Locked</h2>
        <p className="text-secondary max-w-sm">Detailed financial reports and business intelligence datasets are available for management and strategic nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Intelligence & Reports</h1>
          <p className="text-secondary text-base">Generate, schedule, and export comprehensive business intelligence datasets.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-high text-primary px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-surface-container transition-all">
            <Calendar className="w-4 h-4" />
            Schedule Report
          </button>
          <button 
            onClick={() => setShowGenModal(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Generate New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
             <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Analytic Engines</h3>
             <div className="space-y-4">
                {[
                  { name: 'Financial Auditor', icon: BarChart3, color: 'text-primary' },
                  { name: 'Operational Pulse', icon: LineChart, color: 'text-green-600' },
                  { name: 'Resource Allocation', icon: PieChartIcon, color: 'text-primary-container' },
                  { name: 'Raw Data Export', icon: Database, color: 'text-secondary' },
                ].map((engine) => (
                   <button key={engine.name} onClick={() => { setShowGenModal(true); setNewReport({ ...newReport, title: engine.name + ' Report' }); }} className="w-full flex items-center justify-between p-4 border border-outline-variant/10 rounded-2xl hover:bg-surface-container-low transition-all group text-left">
                      <div className="flex items-center gap-4">
                        <engine.icon className={cn("w-5 h-5", engine.color)} />
                        <span className="text-sm font-bold text-primary">{engine.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
                   </button>
                ))}
             </div>
          </div>
          
          <div className="bg-primary-container text-white p-8 rounded-3xl shadow-lg">
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

        <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
             <h3 className="text-sm font-bold text-primary">Generated Asset Library</h3>
             <div className="flex gap-4">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                   <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none w-48" 
                    placeholder="Filter..." 
                   />
                </div>
                <button className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container">
                   <Filter className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="p-4 space-y-2">
             {filteredReports.map((report, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-surface-container-low rounded-2xl transition-all group border border-transparent hover:border-outline-variant/10">
                   <div className="flex items-center gap-6">
                      <div className="size-14 bg-surface-container rounded-2xl flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-all">
                         <FileText className="w-7 h-7" />
                      </div>
                      <div>
                         <p className="text-base font-bold text-primary">{report.title}</p>
                         <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">{report.type} • {report.size} • Generated {report.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="p-2.5 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all">
                         <Share2 className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 bg-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 px-5">
                         <Download className="w-4 h-4" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Download</span>
                      </button>
                   </div>
                </div>
             ))}
             {filteredReports.length === 0 && (
               <div className="py-12 text-center">
                  <p className="text-sm text-secondary">No matching reports found.</p>
               </div>
             )}
          </div>
          
          <div className="p-8 border-t border-outline-variant/10 mt-auto text-center">
             <button className="text-[11px] font-bold text-secondary hover:text-primary uppercase tracking-[0.3em] transition-colors">Load Archive Files</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGenModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Intelligence Extraction</h3>
                <button onClick={() => setShowGenModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleGenerate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Report Title</label>
                  <input required value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Annual Logistics Overview" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Output Format</label>
                  <select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                     <option>PDF (Vector High-Res)</option>
                     <option>XLSX (Raw Datatable)</option>
                     <option>CSV (Interconnected Tags)</option>
                  </select>
                </div>
                <button disabled={isGenerating} type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
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
