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
  X,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function Reports() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  
  const [activeTab, setActiveTab] = useState<'intelligence' | 'daily'>(role === 'employee' ? 'daily' : 'intelligence');
  
  const [reports, setReports] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'PDF' });

  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyForm, setDailyForm] = useState({ content: '' });
  
  // Basic session timer states
  const [loginTime, setLoginTime] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('enako_login_time');
    if (stored) {
      setLoginTime(stored);
    } else {
      const now = new Date().toISOString();
      sessionStorage.setItem('enako_login_time', now);
      setLoginTime(now);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'intelligence' && role !== 'employee') {
        const res = await api.reports();
        setReports(res);
      } else {
        const res = await api.dailyReports();
        setDailyReports(res);
      }
    } catch (e) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeTab, role]);

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

  const handleCreateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const logoutTime = new Date().toISOString();
      await api.createDailyReport({
        content: dailyForm.content,
        loginTime: loginTime || undefined,
        logoutTime
      });
      setShowDailyModal(false);
      setDailyForm({ content: '' });
      toast.success('Daily report submitted successfully');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit report');
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

  const downloadDailyPdf = (report: any) => {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(33, 43, 54); // Dark blue/grey
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('ENAKO OS - DAILY REPORT', 20, 25);
    
    // Reset text color for body
    doc.setTextColor(33, 43, 54);
    
    // Employee Info Box
    doc.setDrawColor(220, 224, 228);
    doc.setFillColor(248, 249, 250);
    doc.rect(20, 50, 170, 45, 'FD');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('EMPLOYEE DETAILS', 25, 58);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text(`Name: ${report.user?.fullName || 'Unknown'}`, 25, 70);
    doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 110, 70);
    doc.text(`Session In: ${report.loginTime ? new Date(report.loginTime).toLocaleTimeString() : '--:--'}`, 25, 82);
    doc.text(`Session Out: ${report.logoutTime ? new Date(report.logoutTime).toLocaleTimeString() : '--:--'}`, 110, 82);
    
    // Activity Log Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Activity Details', 20, 115);
    
    // Line separator
    doc.setDrawColor(220, 224, 228);
    doc.line(20, 118, 190, 118);
    
    // Content
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 64, 67);
    const splitText = doc.splitTextToSize(report.content || 'No content provided for this session.', 170);
    doc.text(splitText, 20, 128);
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated via Enako OS - ' + new Date().toLocaleString(), 20, pageHeight - 15);
    
    // Save
    doc.save(`Enako_Daily_Report_${new Date(report.date).toISOString().split('T')[0]}.pdf`);
  };

  const filteredReports = activeTab === 'intelligence' 
    ? reports.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : dailyReports.filter(r => r.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || r.content?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
            {activeTab === 'intelligence' ? 'Intelligence & Reports' : 'Daily Reports & Logs'}
          </h1>
          <p className="text-secondary text-base mt-1">
            {activeTab === 'intelligence' 
              ? 'Generate, schedule, and export comprehensive business intelligence datasets.'
              : 'Track daily work logs, active sessions, and shift activities.'}
          </p>
        </div>
        <div className="flex gap-4">
          {activeTab === 'intelligence' ? (
            <>
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
            </>
          ) : (
            <button 
              onClick={() => setShowDailyModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              End Shift & Report
            </button>
          )}
        </div>
      </div>

      {role !== 'employee' && (
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('intelligence')} 
            className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'intelligence' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary")}
          >
            Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('daily')} 
            className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'daily' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary")}
          >
            Daily Reports
          </button>
        </div>
      )}

      {activeTab === 'intelligence' && (
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
                               {report.type} • {report.size} • Generated {new Date(report.createdAt).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => downloadReport(report)} className="py-3 px-5 bg-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                             <Download className="w-4 h-4" />
                             <span className="text-[11px] font-bold uppercase tracking-widest">Download</span>
                          </button>
                       </div>
                    </div>
                 ))
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="bg-white border border-outline-variant/30 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
             <h3 className="text-sm font-bold text-primary flex items-center gap-2">
               <Clock className="w-5 h-5 text-primary-container" /> Daily Work Logs
             </h3>
             <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                 <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs outline-none w-56 focus:ring-2 focus:ring-primary-container" 
                  placeholder="Search logs..." 
                 />
             </div>
          </div>

          <div className="p-4 space-y-2 flex-1">
             {loading ? (
               <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading daily reports...</div>
             ) : filteredReports.length === 0 ? (
               <div className="py-12 text-center space-y-3">
                  <FileText className="w-10 h-10 text-outline-variant mx-auto" />
                  <p className="text-sm font-medium text-secondary">No daily reports found.</p>
               </div>
             ) : (
               filteredReports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-container-low/50 rounded-2xl transition-all group border border-transparent hover:border-outline-variant/20 gap-4">
                     <div className="flex items-center gap-6">
                        <div className="size-14 bg-surface-container rounded-2xl flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-all shadow-sm">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-base font-bold text-primary leading-tight">Work Log: {report.user?.fullName || 'Unknown'}</p>
                           <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1.5">
                             {new Date(report.date).toLocaleDateString()} • In: {report.loginTime ? new Date(report.loginTime).toLocaleTimeString() : '--'} • Out: {report.logoutTime ? new Date(report.logoutTime).toLocaleTimeString() : '--'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => downloadDailyPdf(report)} className="py-3 px-5 bg-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                           <Download className="w-4 h-4" />
                           <span className="text-[11px] font-bold uppercase tracking-widest">PDF</span>
                        </button>
                     </div>
                  </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* Modals */}
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
                  <input required value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-[0.2em]">Output Format</label>
                  <select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container appearance-none">
                     <option value="CSV">CSV (Interconnected Tags)</option>
                     <option value="XLSX">XLSX (Raw Datatable)</option>
                  </select>
                </div>
                <button disabled={isGenerating} type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                  {isGenerating ? 'Processing...' : 'Generate Asset'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDailyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">Submit Daily Report</h3>
                <button onClick={() => setShowDailyModal(false)} className="text-secondary hover:text-primary transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateDaily} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-[0.2em]">Activity Details *</label>
                  <textarea required rows={5} value={dailyForm.content} onChange={e => setDailyForm({...dailyForm, content: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container" placeholder="What did you work on today?" />
                </div>
                
                <div className="bg-surface-container p-4 rounded-xl flex items-center gap-4 text-xs font-mono text-secondary">
                  <div>
                    <span className="block font-bold">Session Started:</span>
                    {loginTime ? new Date(loginTime).toLocaleTimeString() : 'Unknown'}
                  </div>
                </div>

                <button disabled={isGenerating} type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                  {isGenerating ? 'Submitting...' : 'End Shift & Submit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
