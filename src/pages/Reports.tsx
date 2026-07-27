import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Save,
  Users,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';

export default function Reports() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const isManager = role === 'manager' || role === 'outreach_manager';
  const isCeo = role === 'ceo';
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tabs for Manager: 'today' | 'all'
  const [managerTab, setManagerTab] = useState<'today' | 'all'>('today');

  const [isGenerating, setIsGenerating] = useState(false);
  
  // Create Report View State
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [dailyForm, setDailyForm] = useState({
    title: '',
    type: 'DAILY',
    category: 'General',
    impact: 'Low',
    details: '',
    recommendation: ''
  });
  
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
      const res = await api.dailyReports();
      setReports(res);
    } catch (e) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const logoutTime = new Date().toISOString();
      
      const formattedContent = `Title: ${dailyForm.title}
Category: ${dailyForm.category}
Impact Level: ${dailyForm.impact}

Details:
${dailyForm.details}

Recommendation:
${dailyForm.recommendation}`;

      await api.createDailyReport({
        content: formattedContent,
        type: isManager ? dailyForm.type : 'DAILY',
        loginTime: loginTime || undefined,
        logoutTime
      });
      
      setIsCreatingReport(false);
      setDailyForm({
        title: '',
        type: 'DAILY',
        category: 'General',
        impact: 'Low',
        details: '',
        recommendation: ''
      });
      toast.success('Report submitted successfully');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDailyPdf = (report: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const isGeneral = report.type === 'GENERAL';
    const brandGreen = [0, 31, 91]; // #001f5b
    const brandGreenLight = [230, 237, 245]; // #e6edf5
    const darkText = [33, 37, 41];
    const mutedText = [108, 117, 125];
    const borderColor = [206, 212, 218];

    // ─── WATERMARK (diagonal, repeated, very faint) ───
    doc.saveGraphicsState();
    // @ts-ignore
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.setFontSize(52);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    // Draw diagonal watermark text across the page
    for (let y = 40; y < pageHeight; y += 80) {
      doc.text('E-NANO FOUNDATION', pageWidth / 2, y, { angle: 35, align: 'center' });
    }
    doc.restoreGraphicsState();

    // ─── TOP GREEN ACCENT BAR ───
    doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // ─── HEADER SECTION ───
    // Logo
    try {
      doc.addImage(ENAKO_LOGO_BASE64, 'PNG', 15, 10, 28, 28);
    } catch (e) { /* logo failed, continue without it */ }

    // Company Name & Report Type
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.text('E-NANO FOUNDATION', 50, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('Empowering Communities Through Innovation', 50, 27);

    // Report Type Badge
    const badgeText = isGeneral ? 'GENERAL REPORT' : 'DAILY REPORT';
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    const badgeWidth = doc.getTextWidth(badgeText) + 12;
    doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.roundedRect(pageWidth - 15 - badgeWidth, 12, badgeWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, pageWidth - 15 - badgeWidth + 6, 19);

    // Report Reference
    doc.setFontSize(8);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(`Ref: ${report.id?.substring(0, 12) || 'N/A'}`, pageWidth - 15 - badgeWidth, 30);

    // Divider line under header
    doc.setDrawColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    // ─── SUBMITTER DETAILS BOX ───
    doc.setFillColor(brandGreenLight[0], brandGreenLight[1], brandGreenLight[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, 48, pageWidth - 30, 38, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.text('SUBMITTER DETAILS', 20, 56);

    // Details grid
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    // Row 1
    doc.setFont(undefined, 'bold');
    doc.text('Full Name:', 20, 65);
    doc.setFont(undefined, 'normal');
    doc.text(report.user?.fullName || 'Unknown', 52, 65);

    doc.setFont(undefined, 'bold');
    doc.text('Date:', 115, 65);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(report.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 132, 65);

    // Row 2
    doc.setFont(undefined, 'bold');
    doc.text('Session In:', 20, 75);
    doc.setFont(undefined, 'normal');
    doc.text(report.loginTime ? new Date(report.loginTime).toLocaleTimeString() : 'N/A', 52, 75);

    doc.setFont(undefined, 'bold');
    doc.text('Session Out:', 115, 75);
    doc.setFont(undefined, 'normal');
    doc.text(report.logoutTime ? new Date(report.logoutTime).toLocaleTimeString() : 'N/A', 147, 75);

    // Row 3
    if (report.user?.email) {
      doc.setFont(undefined, 'bold');
      doc.text('Email:', 20, 83);
      doc.setFont(undefined, 'normal');
      doc.text(report.user.email, 52, 83);
    }

    // ─── REPORT CONTENT SECTION ───
    let currentY = 96;

    // Section header with green left border
    doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.rect(15, currentY, 3, 8, 'F');
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Report Content', 22, currentY + 6);
    currentY += 14;

    // Thin separator
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(15, currentY, pageWidth - 15, currentY);
    currentY += 6;

    // Parse and render content sections
    const content = report.content || 'No content provided for this session.';
    const sections = content.split('\n');
    
    doc.setFontSize(10);
    for (const line of sections) {
      if (currentY > pageHeight - 40) {
        // Add new page
        doc.addPage();
        currentY = 20;
        
        // Re-add watermark on new page
        doc.saveGraphicsState();
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.setFontSize(52);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        for (let y = 40; y < pageHeight; y += 80) {
          doc.text('E-NANO FOUNDATION', pageWidth / 2, y, { angle: 35, align: 'center' });
        }
        doc.restoreGraphicsState();
        doc.setFontSize(10);
      }

      // Detect section headers like "Title:", "Category:", "Details:", "Recommendation:"
      if (line.match(/^(Title|Category|Impact Level|Details|Recommendation):/i)) {
        const colonIndex = line.indexOf(':');
        const label = line.substring(0, colonIndex + 1);
        const value = line.substring(colonIndex + 1).trim();
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        doc.text(label, 20, currentY);
        
        if (value) {
          doc.setFont(undefined, 'normal');
          doc.setTextColor(darkText[0], darkText[1], darkText[2]);
          doc.text(value, 20 + doc.getTextWidth(label) + 3, currentY);
        }
        currentY += 7;
      } else if (line.trim() === '') {
        currentY += 4;
      } else {
        doc.setFont(undefined, 'normal');
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        const wrapped = doc.splitTextToSize(line, pageWidth - 40);
        doc.text(wrapped, 20, currentY);
        currentY += wrapped.length * 5.5;
      }
    }

    // ─── FOOTER ───
    // Bottom green bar
    doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('E-Nano Foundation | Empowering Communities Through Innovation', 15, pageHeight - 12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, pageHeight - 6);

    // Page number
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('E-Nano Foundation | Empowering Communities Through Innovation', 15, pageHeight - 12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, pageHeight - 6);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 9);
    }

    // ─── CONFIDENTIALITY NOTICE ───
    doc.setPage(1);
    doc.setFontSize(7);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('CONFIDENTIAL - This report is the property of E-Nano Foundation. Unauthorized distribution is prohibited.', pageWidth / 2, pageHeight - 24, { align: 'center' });

    // Save
    const fileName = isGeneral ? 'ENano_General_Report' : 'ENano_Daily_Report';
    doc.save(`${fileName}_${new Date(report.date).toISOString().split('T')[0]}.pdf`);
  };

  // Filter Logic
  const getFilteredReports = () => {
    let filtered = reports.filter(r => 
      r.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isManager) {
      if (managerTab === 'today') {
        const today = new Date().toLocaleDateString();
        filtered = filtered.filter(r => 
          new Date(r.date).toLocaleDateString() === today && 
          r.userId !== user?.id &&
          r.type === 'DAILY'
        );
      }
    }

    return filtered;
  };

  const displayedReports = getFilteredReports();

  return (
    <div className="space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!isCreatingReport ? (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
                {isCeo ? 'General Reports' : 'Reports & Logs'}
              </h1>
              <p className="text-secondary text-base mt-1">
                {isCeo 
                  ? 'Review general reports submitted by management.' 
                  : 'Track work logs, active sessions, and shift activities.'}
              </p>
            </div>
            {!isCeo && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCreatingReport(true)}
                  className="bg-primary text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Report
                </button>
              </div>
            )}
          </div>

          {isManager && (
            <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit">
              <button 
                onClick={() => setManagerTab('today')} 
                className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", managerTab === 'today' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary")}
              >
                Today's Team Reports
              </button>
              <button 
                onClick={() => setManagerTab('all')} 
                className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", managerTab === 'all' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary")}
              >
                All Stored Reports
              </button>
            </div>
          )}

          <div className="bg-white border border-outline-variant/30 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                {isManager && managerTab === 'today' ? <Users className="w-5 h-5 text-primary-container" /> : <Archive className="w-5 h-5 text-primary-container" />} 
                {isCeo ? 'General Reports' : (isManager && managerTab === 'today' ? 'Available Reports for the Day' : 'Stored Reports')}
              </h3>
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

            <div className="p-4 space-y-2 flex-1">
              {loading ? (
                <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading reports...</div>
              ) : displayedReports.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                    <FileText className="w-10 h-10 text-outline-variant mx-auto" />
                    <p className="text-sm font-medium text-secondary">No reports found.</p>
                </div>
              ) : (
                displayedReports.map((report) => (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-container-low/50 rounded-2xl transition-all group border border-transparent hover:border-outline-variant/20 gap-4">
                      <div className="flex items-center gap-6">
                          <div className={cn("size-14 rounded-2xl flex items-center justify-center transition-all shadow-sm", report.type === 'GENERAL' ? "bg-primary text-white" : "bg-surface-container text-primary-container group-hover:bg-primary-container group-hover:text-white")}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-primary leading-tight">{report.user?.fullName || 'Unknown'}</p>
                              {report.type === 'GENERAL' && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">General</span>}
                            </div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1.5">
                              {new Date(report.date).toLocaleDateString()} {report.loginTime && `• In: ${new Date(report.loginTime).toLocaleTimeString()}`} {report.logoutTime && `• Out: ${new Date(report.logoutTime).toLocaleTimeString()}`}
                            </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <button onClick={() => downloadDailyPdf(report)} className="py-3 px-5 bg-primary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Print / PDF</span>
                          </button>
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreatingReport(false)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-outline-variant/30 text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-primary">Create New Report</h2>
              <p className="text-sm text-secondary">Fill out the details for your shift or activity report.</p>
            </div>
          </div>

          <form onSubmit={handleCreateDaily} className="bg-white rounded-[2rem] border border-outline-variant/30 shadow-sm p-8 max-w-4xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {isManager && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Report Type *</label>
                  <select 
                    value={dailyForm.type}
                    onChange={e => setDailyForm({...dailyForm, type: e.target.value})}
                    className="w-full bg-primary/5 border border-primary/20 text-primary rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  >
                    <option value="DAILY">Daily Shift Report (Internal)</option>
                    <option value="GENERAL">General Report (Submit to CEO)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input 
                    type="text" 
                    disabled 
                    value={new Date().toLocaleDateString()} 
                    className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-secondary cursor-not-allowed" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Report Title *</label>
                <input 
                  required
                  value={dailyForm.title}
                  onChange={e => setDailyForm({...dailyForm, title: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all" 
                  placeholder="E.g., End of Shift Report" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Category *</label>
                <select 
                  value={dailyForm.category}
                  onChange={e => setDailyForm({...dailyForm, category: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all"
                >
                  <option value="General">General</option>
                  <option value="Outreach Event">Outreach Event</option>
                  <option value="Field Work">Field Work</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Client Meeting">Client Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Impact Level *</label>
                <select 
                  value={dailyForm.impact}
                  onChange={e => setDailyForm({...dailyForm, impact: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Details *</label>
              <textarea 
                required 
                rows={6} 
                value={dailyForm.details} 
                onChange={e => setDailyForm({...dailyForm, details: e.target.value})} 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all resize-none" 
                placeholder="What did you work on today?" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Recommendations / Next Steps</label>
              <textarea 
                rows={4} 
                value={dailyForm.recommendation} 
                onChange={e => setDailyForm({...dailyForm, recommendation: e.target.value})} 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all resize-none" 
                placeholder="Any recommendations for future shifts or ongoing issues?" 
              />
            </div>



            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button 
                disabled={isGenerating} 
                type="submit" 
                className="px-8 py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isGenerating ? 'Submitting...' : 'Save and Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
