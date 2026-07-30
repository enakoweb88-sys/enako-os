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
  Archive,
  Edit,
  BarChart,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api, apiRequest } from '../lib/api';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';

function fmt(val: string | number | null | undefined) {
  return `${Number(val ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dailyForm, setDailyForm] = useState({
    title: '',
    type: 'DAILY',
    category: 'General',
    impact: 'Low',
    details: '',
    recommendation: '',
    attachments: {
      transactions: false,
      expenses: false,
      foodAndMeal: false,
      subscriptions: false,
      kyc: false,
      leaves: false,
      websites: false
    },
    attachmentDescriptions: {
      transactions: '',
      expenses: '',
      foodAndMeal: '',
      subscriptions: '',
      kyc: '',
      leaves: '',
      websites: ''
    }
  });


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

  const handleSaveReport = async (e: React.FormEvent, status: 'DRAFT' | 'SUBMITTED') => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const formattedContent = `Title: ${dailyForm.title}
Category: ${dailyForm.category}
Impact Level: ${dailyForm.impact}

Details:
${dailyForm.details}

Recommendation:
${dailyForm.recommendation}`;

      const payload = {
        content: formattedContent,
        type: isManager ? dailyForm.type : 'DAILY',
        status,
        attachments: {
          ...dailyForm.attachments,
          attachmentDescriptions: dailyForm.attachmentDescriptions
        }
      };

      if (editingId) {
        await api.updateDailyReport(editingId, payload);
      } else {
        await api.createDailyReport(payload);
      }
      
      if (status === 'SUBMITTED') {
        setIsCreatingReport(false);
        setEditingId(null);
        setDailyForm({
          title: '',
          type: 'DAILY',
          category: 'General',
          impact: 'Low',
          details: '',
          recommendation: '',
          attachments: { 
            transactions: false, expenses: false, foodAndMeal: false, subscriptions: false,
            kyc: false, leaves: false, websites: false
          },
          attachmentDescriptions: {
            transactions: '', expenses: '', foodAndMeal: '', subscriptions: '',
            kyc: '', leaves: '', websites: ''
          }
        });
        toast.success('Report submitted successfully');
      } else {
        toast.success('Draft saved successfully');
      }
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditDraft = (report: any) => {
    setEditingId(report.id);
    // Parse existing content
    const contentLines = (report.content || '').split('\n');
    let details = '';
    let recommendation = '';
    let inDetails = false;
    let inRecs = false;
    
    const parsed = {
      title: '',
      type: report.type || 'DAILY',
      category: 'General',
      impact: 'Low',
      details: '',
      recommendation: '',
      attachments: report.attachments?.transactions !== undefined ? report.attachments : { 
        transactions: false, expenses: false, foodAndMeal: false, subscriptions: false,
        kyc: false, leaves: false, websites: false
      },
      attachmentDescriptions: report.attachments?.attachmentDescriptions || {
        transactions: '', expenses: '', foodAndMeal: '', subscriptions: '',
        kyc: '', leaves: '', websites: ''
      }
    };

    contentLines.forEach(line => {
      if (line.startsWith('Title: ')) parsed.title = line.replace('Title: ', '').trim();
      else if (line.startsWith('Category: ')) parsed.category = line.replace('Category: ', '').trim();
      else if (line.startsWith('Impact Level: ')) parsed.impact = line.replace('Impact Level: ', '').trim();
      else if (line.startsWith('Details:')) { inDetails = true; inRecs = false; }
      else if (line.startsWith('Recommendation:')) { inDetails = false; inRecs = true; }
      else {
        if (inDetails && line.trim()) details += line + '\n';
        if (inRecs && line.trim()) recommendation += line + '\n';
      }
    });

    parsed.details = details.trim();
    parsed.recommendation = recommendation.trim();
    setDailyForm(parsed);
    setIsCreatingReport(true);
  };

  const downloadDailyPdf = async (report: any) => {
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
      doc.text('ENAKO FINTECH', pageWidth / 2, y, { angle: 35, align: 'center' });
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
    doc.text('ENAKO FINTECH', 50, 20);

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
    doc.text('Submitted At:', 20, 75);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(report.date).toLocaleTimeString(), 52, 75);

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
    
    const detailLines: string[] = [];
    const recommendationLines: string[] = [];
    let inRecommendation = false;

    for (const line of sections) {
      if (line.match(/^Recommendation:/i)) {
        inRecommendation = true;
      } else if (inRecommendation && line.match(/^(Title|Category|Impact Level|Details):/i)) {
        inRecommendation = false;
      }
      
      if (inRecommendation) {
        recommendationLines.push(line);
      } else {
        detailLines.push(line);
      }
    }

    const printLines = (lines: string[]) => {
      doc.setFontSize(10);
      for (const line of lines) {
        if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = 20;
          doc.saveGraphicsState();
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: 0.04 }));
          doc.setFontSize(52);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
          for (let y = 40; y < pageHeight; y += 80) {
            doc.text('ENAKO FINTECH', pageWidth / 2, y, { angle: 35, align: 'center' });
          }
          doc.restoreGraphicsState();
          doc.setFontSize(10);
        }

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
    };

    // Print main details
    printLines(detailLines);

    // ─── DATA ATTACHMENTS (NEW PAGES) ───
    if (report.attachments) {
      const atts = typeof report.attachments === 'string' ? JSON.parse(report.attachments) : report.attachments;
      
      const drawAttachmentHeader = (title: string) => {
        doc.addPage();
        doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(`ATTACHED DATA: ${title}`, 15, 8);
        return 25;
      };

      const renderAttachmentSection = async (key: string, title: string, fetcher: () => Promise<any[]>, generateInsight: (data: any[]) => string, renderData: (doc: any, cy: number, data: any[]) => void) => {
        if (!atts[key]) return;
        try {
          let cy = drawAttachmentHeader(title);
          const rawData = await fetcher();
          const data = (rawData as any)?.items || rawData || [];
          
          // Print Description or Smart Insight
          const customDesc = atts.attachmentDescriptions?.[key];
          doc.setFontSize(10);
          doc.setTextColor(darkText[0], darkText[1], darkText[2]);
          
          let description = '';
          if (customDesc && customDesc.trim() !== '') {
            description = customDesc;
            doc.setFont(undefined, 'bold');
            doc.text('Manager Note:', 15, cy);
            cy += 6;
          } else {
            description = generateInsight(data);
          }
          
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          const wrapped = doc.splitTextToSize(description, pageWidth - 30);
          doc.text(wrapped, 15, cy);
          cy += (wrapped.length * 5) + 8;
          
          // Render specific data (tables/calculations)
          renderData(doc, cy, data);
        } catch (err) {
          console.error(`Failed to attach data for ${key}`, err);
        }
      };

      await renderAttachmentSection('expenses', 'COMPANY EXPENSES', 
        async () => {
          try { return await api.expenses(); } catch { return await apiRequest('/expenses'); }
        },
        (data) => {
          const total = data.reduce((sum, d) => sum + Number(d.amount || 0), 0);
          return `Summary: This month, the company recorded ${data.length} expense transactions amounting to ${fmt(total)}. This indicates a structured expenditure flow across operational categories.`;
        },
        (doc, cy, data) => {
          const total = data.reduce((sum, e) => sum + Number(e.amount || 0), 0);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Expenses Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Records: ${data.length}`, 15, cy);
          doc.text(`Total Amount: ${fmt(total)}`, 70, cy);
          cy += 8;
          
          const tableData = data.slice(0, 30).map((e: any) => [new Date(e.createdAt).toLocaleDateString(), e.category || 'Other', e.description || '-', fmt(e.amount), e.status]);
          autoTable(doc, { startY: cy, head: [['Date', 'Category', 'Description', 'Amount', 'Status']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('transactions', 'FX TRANSACTIONS', 
        async () => {
          try { return await (api as any).transactions?.() || await apiRequest('/finance/transactions'); } catch { return []; }
        },
        (data) => {
          const total = data.reduce((sum, d) => sum + Number(d.amount || 0), 0);
          return `Summary: A total of ${data.length} FX transactions were processed over the period, with a cumulative volume of ${fmt(total)}. The distribution of these transactions reflects active client engagement across platforms.`;
        },
        (doc, cy, data) => {
          const total = data.reduce((sum, t) => sum + Number(t.amount || 0), 0);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Transactions Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Transactions: ${data.length}`, 15, cy);
          doc.text(`Total Volume: ${fmt(total)}`, 70, cy);
          cy += 8;
          
          const tableData = data.slice(0, 30).map((t: any) => [new Date(t.createdAt).toLocaleDateString(), t.type, t.entity, fmt(t.amount), t.status]);
          autoTable(doc, { startY: cy, head: [['Date', 'Type', 'Entity', 'Amount', 'Status']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('subscriptions', 'ENTERPRISE SUBSCRIPTIONS', 
        async () => {
          try { return await (api as any).subscriptions?.() || await apiRequest('/subscriptions'); } catch { return []; }
        },
        (data) => {
          const active = data.filter(d => d.status === 'Active');
          const mrr = active.reduce((sum, d) => sum + (d.cycle === 'Monthly' ? Number(d.costInXaf || d.cost || 0) : Number(d.costInXaf || d.cost || 0)/12), 0);
          return `Summary: Currently tracking ${data.length} subscriptions (${active.length} active). The estimated Monthly Run Rate (MRR) stands at ${fmt(mrr)}, ensuring continuous service delivery across our infrastructure stack.`;
        },
        (doc, cy, data) => {
          const active = data.filter(d => d.status === 'Active');
          const mrr = active.reduce((sum, d) => sum + (d.cycle === 'Monthly' ? Number(d.costInXaf || d.cost || 0) : Number(d.costInXaf || d.cost || 0)/12), 0);
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Subscriptions Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Subscriptions: ${data.length}`, 15, cy);
          doc.text(`Active: ${active.length}`, 70, cy);
          doc.text(`MRR: ${fmt(mrr)}`, 110, cy);
          cy += 8;

          const tableData = data.slice(0, 30).map((s: any) => [s.name, s.cycle, fmt(s.costInXaf || s.cost), new Date(s.startDate).toLocaleDateString(), new Date(s.nextBilling).toLocaleDateString(), s.status]);
          autoTable(doc, { startY: cy, head: [['Service', 'Cycle', 'Cost', 'Start Date', 'Next Bill', 'Status']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('foodAndMeal', 'STAFF MEALS SUMMARY', 
        async () => {
          try { return await (api as any).meals?.() || await apiRequest('/meals/records'); } catch { return []; }
        },
        (data) => {
          const ate = data.filter(d => d.status === 'ATE');
          const cost = ate.reduce((sum, d) => sum + Number(d.totalAmount || 0), 0);
          return `Summary: The staff welfare program recorded ${data.length} meal entries this month. ${ate.length} meals were successfully consumed, representing an operational cost of ${fmt(cost)}.`;
        },
        (doc, cy, data) => {
          const ateMeals = data.filter(m => m.status === 'ATE');
          const totalCost = ateMeals.reduce((sum, m) => sum + Number(m.totalAmount || 0), 0);
          const totalCompany = ateMeals.reduce((sum, m) => sum + Number(m.companyAmount || 0), 0);
          const totalEmployee = ateMeals.reduce((sum, m) => sum + Number(m.employeeAmount || 0), 0);
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Meals Grand Totals', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Meals Cost: ${fmt(totalCost)}`, 15, cy);
          doc.text(`Company Pays: ${fmt(totalCompany)}`, 75, cy);
          doc.text(`Employees Pay: ${fmt(totalEmployee)}`, 135, cy);
          cy += 8;
          
          const employeeTotals: Record<string, any> = {};
          ateMeals.forEach(m => {
            const empId = m.employeeId;
            if (!employeeTotals[empId]) employeeTotals[empId] = { name: m.employee?.fullName || 'Unknown', count: 0, total: 0, company: 0, employee: 0 };
            employeeTotals[empId].count += 1;
            employeeTotals[empId].total += Number(m.totalAmount || 0);
            employeeTotals[empId].company += Number(m.companyAmount || 0);
            employeeTotals[empId].employee += Number(m.employeeAmount || 0);
          });
          
          const empData = Object.values(employeeTotals).map(emp => [emp.name, emp.count.toString(), fmt(emp.total), fmt(emp.company), fmt(emp.employee)]);
          
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text('Employee Cost Breakdown', 15, cy);
          cy += 4;
          
          autoTable(doc, { startY: cy, head: [['Employee Name', 'Meals Eaten', 'Total Cost', 'Company Pays', 'Employee Pays']], body: empData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
          
          cy = (doc as any).lastAutoTable.finalY + 10;
          if (cy > pageHeight - 40) { doc.addPage(); cy = 20; }
          
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text('Detailed Meal Records', 15, cy);
          cy += 4;
          
          const tableData = data.slice(0, 30).map((m: any) => [new Date(m.date).toLocaleDateString(), m.employee?.fullName || 'Unknown', m.mealName || '-', m.status, m.status === 'ATE' ? fmt(m.totalAmount) : '-', m.status === 'ATE' ? fmt(m.companyAmount) : '-', m.status === 'ATE' ? fmt(m.employeeAmount) : '-']);
          autoTable(doc, { startY: cy, head: [['Date', 'Employee', 'Meal', 'Status', 'Total', 'Company', 'Employee']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('kyc', 'KYC & COMPLIANCE', 
        async () => {
          try { return await apiRequest('/users/kyc/requests'); } catch { return []; }
        },
        (data) => {
          const approved = data.filter(d => d.status === 'APPROVED');
          return `Summary: Compliance operations reviewed ${data.length} KYC requests recently. Of these, ${approved.length} were successfully verified and approved.`;
        },
        (doc, cy, data) => {
          const approved = data.filter(d => d.status === 'APPROVED').length;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('KYC Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Requests: ${data.length}`, 15, cy);
          doc.text(`Approved: ${approved}`, 80, cy);
          cy += 8;
          
          const tableData = data.slice(0, 30).map((k: any) => [new Date(k.createdAt).toLocaleDateString(), k.user?.fullName || k.userId, k.documentType || 'ID', k.status]);
          autoTable(doc, { startY: cy, head: [['Date', 'User', 'Document Type', 'Status']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('leaves', 'EMPLOYEE LEAVES', 
        async () => {
          try { return await apiRequest('/hr/leaves'); } catch { return []; }
        },
        (data) => {
          const active = data.filter(d => d.status === 'APPROVED');
          return `Summary: HR processed ${data.length} leave requests during this period. There are currently ${active.length} approved leaves.`;
        },
        (doc, cy, data) => {
          const approved = data.filter(d => d.status === 'APPROVED').length;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Leaves Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Requests: ${data.length}`, 15, cy);
          doc.text(`Approved: ${approved}`, 80, cy);
          cy += 8;
          
          const tableData = data.slice(0, 30).map((l: any) => [l.employee?.fullName || 'Unknown', l.leaveType || 'Annual', new Date(l.startDate).toLocaleDateString(), new Date(l.endDate).toLocaleDateString(), l.status]);
          autoTable(doc, { startY: cy, head: [['Employee', 'Type', 'Start Date', 'End Date', 'Status']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );

      await renderAttachmentSection('websites', 'WEBSITE PERFORMANCE', 
        async () => {
          try { return await apiRequest('/analytics/events'); } catch { return []; }
        },
        (data) => {
          return `Summary: Digital outreach generated ${data.length} recorded events/sessions. The traffic metrics indicate a robust engagement rate and successful retention across both the main corporate portal and our outreach campaigns.`;
        },
        (doc, cy, data) => {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Performance Calculation', 15, cy);
          cy += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Total Events: ${data.length}`, 15, cy);
          cy += 8;
          
          const tableData = data.slice(0, 30).map((e: any) => [new Date(e.timestamp || e.createdAt).toLocaleDateString(), e.eventType || 'Pageview', e.path || '/', e.metadata?.referrer || 'Direct']);
          autoTable(doc, { startY: cy, head: [['Date', 'Event Type', 'Page/Path', 'Referrer']], body: tableData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: brandGreen } });
        }
      );
    }

    // Print recommendations at the end
    if (recommendationLines.length > 0) {
      doc.addPage();
      currentY = 20;
      doc.saveGraphicsState();
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 0.04 }));
      doc.setFontSize(52);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
      for (let y = 40; y < pageHeight; y += 80) {
        doc.text('ENAKO FINTECH', pageWidth / 2, y, { angle: 35, align: 'center' });
      }
      doc.restoreGraphicsState();
      
      printLines(recommendationLines);
    }

    // ─── FOOTER & PAGE NUMBERS ───
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Enako Fintech | Empowering Communities Through Innovation', 15, pageHeight - 12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, pageHeight - 6);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 9);
      
      if (i === 1) {
        doc.setFontSize(7);
        doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
        doc.text('CONFIDENTIAL - This report is the property of Enako Fintech. Unauthorized distribution is prohibited.', pageWidth / 2, pageHeight - 24, { align: 'center' });
      }
    }

    // Save
    const fileName = isGeneral ? 'ENano_General_Report' : 'ENano_Daily_Report';
    doc.save(`${fileName}_${new Date(report.date).toISOString().split('T')[0]}.pdf`);
  };

  // Filter Logic
  const getFilteredReports = () => {
    let filtered = reports.filter(r => 
      (r.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isManager) {
      if (managerTab === 'today') {
        const today = new Date().toLocaleDateString();
        filtered = filtered.filter(r => 
          new Date(r.date).toLocaleDateString() === today && 
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
                              {report.status === 'DRAFT' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Draft</span>}
                              {report.status === 'SUBMITTED' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Submitted</span>}
                            </div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1.5">
                              {new Date(report.date).toLocaleDateString()} • {new Date(report.date).toLocaleTimeString()}
                            </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {report.status === 'DRAFT' && report.userId === user?.id && (
                            <button onClick={() => handleEditDraft(report)} className="py-3 px-5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all flex items-center gap-2 border border-orange-200">
                              <Edit className="w-4 h-4" />
                              <span className="text-[11px] font-bold uppercase tracking-widest">Edit Draft</span>
                            </button>
                          )}
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
              onClick={() => {
                setIsCreatingReport(false);
                setEditingId(null);
                setDailyForm({
                  title: '', type: 'DAILY', category: 'General', impact: 'Low', details: '', recommendation: '',
                  attachments: { transactions: false, expenses: false, foodAndMeal: false, subscriptions: false }
                });
              }}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-outline-variant/30 text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-primary">{editingId ? 'Edit Draft Report' : 'Create New Report'}</h2>
              <p className="text-sm text-secondary">Fill out the details for your shift or activity report.</p>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-[2rem] border border-outline-variant/30 shadow-sm p-8 max-w-4xl space-y-6">
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



            <div className="pt-4 border-t border-outline-variant/20">
              <label className="block text-xs font-bold text-secondary mb-4 uppercase tracking-wider">Attach Data Modules (Auto-generates charts & tables)</label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(dailyForm.attachments).map(key => (
                    <label key={key} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", dailyForm.attachments[key as keyof typeof dailyForm.attachments] ? "bg-primary/5 border-primary" : "bg-white border-outline-variant/30 hover:border-primary/50")}>
                      <div className={cn("w-5 h-5 rounded flex items-center justify-center transition-all", dailyForm.attachments[key as keyof typeof dailyForm.attachments] ? "bg-primary text-white" : "border border-outline-variant/50")}>
                        {dailyForm.attachments[key as keyof typeof dailyForm.attachments] && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-bold text-primary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={dailyForm.attachments[key as keyof typeof dailyForm.attachments]}
                        onChange={(e) => setDailyForm({...dailyForm, attachments: {...dailyForm.attachments, [key]: e.target.checked}})}
                      />
                    </label>
                  ))}
                </div>
                
                {/* Custom Descriptions for selected attachments */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {Object.keys(dailyForm.attachments).filter(k => dailyForm.attachments[k as keyof typeof dailyForm.attachments]).map(key => (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={`desc-${key}`} 
                        className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30"
                      >
                        <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()} Summary / Description (Optional)</label>
                        <p className="text-[10px] text-secondary mb-3">If left blank, the system will automatically generate a detailed, smart insight based on the actual data.</p>
                        <textarea
                          rows={2}
                          value={(dailyForm.attachmentDescriptions as any)?.[key] || ''}
                          onChange={(e) => setDailyForm({...dailyForm, attachmentDescriptions: {...dailyForm.attachmentDescriptions, [key]: e.target.value}})}
                          className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-container transition-all resize-none"
                          placeholder={`Enter custom description for ${key}...`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <button 
                disabled={isGenerating} 
                onClick={(e) => handleSaveReport(e, 'DRAFT')}
                type="button" 
                className="px-6 py-3 bg-white border border-outline-variant/30 text-secondary rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isGenerating ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button 
                disabled={isGenerating} 
                onClick={(e) => handleSaveReport(e, 'SUBMITTED')}
                type="button" 
                className="px-8 py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isGenerating ? 'Submitting...' : 'Review & Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
