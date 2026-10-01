import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api, apiRequest } from '../lib/api';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';
import { OrganizationHeaderCard } from '../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../components/WorkplaceStatCards';
import { savePdf, runAutoTable } from '../lib/pdf-export';

function fmt(val: string | number | null | undefined) {
  return `${Number(val ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function Reports() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const isExecutiveManager = role === 'manager';
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
    type: 'WEEKLY',
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

    if (!dailyForm.title || dailyForm.title.trim() === '') {
      toast.error('Please enter a Report Title before submitting.');
      return;
    }

    if (!dailyForm.details || dailyForm.details.trim() === '') {
      toast.error('Please fill in the Report Details before submitting.');
      return;
    }

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
        type: isExecutiveManager ? dailyForm.type : 'WEEKLY',
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
          type: 'WEEKLY',
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
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const isGeneral = report.type === 'GENERAL';
      const brandGreen = [0, 31, 91] as [number, number, number]; // #001f5b
      const brandGreenLight = [230, 237, 245] as [number, number, number]; // #e6edf5
      const darkText = [33, 37, 41] as [number, number, number];
      const mutedText = [108, 117, 125] as [number, number, number];
      const borderColor = [206, 212, 218] as [number, number, number];

      const rawDate = report.date || report.createdAt || new Date();
      const parsedDate = new Date(rawDate);
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const safeDateStr = validDate.toISOString().split('T')[0];
      const formattedDate = validDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const formattedTime = validDate.toLocaleTimeString();

      // ─── WATERMARK (diagonal, repeated, very faint) ───
      try {
        doc.saveGraphicsState();
        // @ts-ignore
        if (typeof doc.GState === 'function') {
          doc.setGState(new doc.GState({ opacity: 0.04 }));
        }
        doc.setFontSize(52);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        for (let y = 40; y < pageHeight; y += 80) {
          doc.text('ENAKO FINTECH', pageWidth / 2, y, { angle: 35, align: 'center' });
        }
        doc.restoreGraphicsState();
      } catch {
        // Watermark is non-critical
      }

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
    const badgeText = isGeneral ? 'GENERAL REPORT' : 'WEEKLY REPORT';
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
    doc.text(formattedDate, 132, 65);

    // Row 2
    doc.setFont(undefined, 'bold');
    doc.text('Submitted At:', 20, 75);
    doc.setFont(undefined, 'normal');
    doc.text(formattedTime, 52, 75);

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

      const commonTableStyles = {
        theme: 'grid' as const,
        styles: { fontSize: 8, cellPadding: 3, lineColor: [200, 200, 200] as [number, number, number], lineWidth: 0.1 },
        headStyles: { fillColor: brandGreen, textColor: 255, fontStyle: 'bold' as const },
        alternateRowStyles: { fillColor: [248, 250, 252] as [number, number, number] }
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
          
          const tableData = data.map((e: any) => [new Date(e.createdAt || Date.now()).toLocaleDateString(), e.category || 'Other', e.description || '-', fmt(e.amount), e.status || 'APPROVED']);
          runAutoTable(doc, { startY: cy, head: [['Date', 'Category', 'Description', 'Amount', 'Status']], body: tableData, ...commonTableStyles });
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
          
          const tableData = data.map((t: any) => [
            new Date(t.createdAt).toLocaleDateString(),
            t.type,
            t.entity || '-',
            `${Number(t.amount || 0).toLocaleString()} ${t.currency || 'XAF'}`,
            t.amountInXaf ? fmt(t.amountInXaf) : '-',
            t.status,
            (t.description || '').substring(0, 30)
          ]);
          runAutoTable(doc, { startY: cy, head: [['Date', 'Type', 'Entity', 'Amount', 'XAF Amount', 'Status', 'Rate & Margin Details']], body: tableData, ...commonTableStyles });
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

          const tableData = data.map((s: any) => [s.name, s.cycle, fmt(s.costInXaf || s.cost), new Date(s.startDate || Date.now()).toLocaleDateString(), new Date(s.nextBilling || Date.now()).toLocaleDateString(), s.status || 'Active']);
          runAutoTable(doc, { startY: cy, head: [['Service', 'Cycle', 'Cost', 'Start Date', 'Next Bill', 'Status']], body: tableData, ...commonTableStyles });
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
          
          runAutoTable(doc, { startY: cy, head: [['Employee Name', 'Meals Eaten', 'Total Cost', 'Company Pays', 'Employee Pays']], body: empData, ...commonTableStyles });
          
          cy = ((doc as any).lastAutoTable?.finalY ?? cy) + 10;
          if (cy > pageHeight - 40) { doc.addPage(); cy = 20; }
          
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text('Detailed Meal Records', 15, cy);
          cy += 4;
          
          const tableData = data.map((m: any) => [new Date(m.date || Date.now()).toLocaleDateString(), m.employee?.fullName || 'Unknown', m.mealName || '-', m.status, m.status === 'ATE' ? fmt(m.totalAmount) : '-', m.status === 'ATE' ? fmt(m.companyAmount) : '-', m.status === 'ATE' ? fmt(m.employeeAmount) : '-']);
          runAutoTable(doc, { startY: cy, head: [['Date', 'Employee', 'Meal', 'Status', 'Total', 'Company', 'Employee']], body: tableData, ...commonTableStyles });
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
          
          const tableData = data.map((k: any) => [new Date(k.createdAt || Date.now()).toLocaleDateString(), k.user?.fullName || k.userId, k.documentType || 'ID', k.status]);
          runAutoTable(doc, { startY: cy, head: [['Date', 'User', 'Document Type', 'Status']], body: tableData, ...commonTableStyles });
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
          
          const tableData = data.map((l: any) => [l.employee?.fullName || 'Unknown', l.leaveType || 'Annual', new Date(l.startDate || Date.now()).toLocaleDateString(), new Date(l.endDate || Date.now()).toLocaleDateString(), l.status]);
          runAutoTable(doc, { startY: cy, head: [['Employee', 'Type', 'Start Date', 'End Date', 'Status']], body: tableData, ...commonTableStyles });
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
          
          const tableData = data.map((e: any) => [new Date(e.timestamp || e.createdAt || Date.now()).toLocaleDateString(), e.eventType || 'Pageview', e.path || '/', e.metadata?.referrer || 'Direct']);
          runAutoTable(doc, { startY: cy, head: [['Date', 'Event Type', 'Page/Path', 'Referrer']], body: tableData, ...commonTableStyles });
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
    const fileName = isGeneral ? 'ENAKO_General_Report' : 'ENAKO_Weekly_Report';
    const saved = savePdf(doc, `${fileName}_${safeDateStr}.pdf`);
    if (saved) {
      toast.success('Report PDF downloaded successfully');
    }
  } catch (err: any) {
    console.error('Failed to generate daily report PDF:', err);
    toast.error(err.message || 'Failed to generate report PDF');
  }
};

  // Filter Logic
  const getFilteredReports = () => {
    let filtered = reports.filter(r => 
      (r.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isManager) {
      if (managerTab === 'today') {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(r => 
          new Date(r.date) >= oneWeekAgo && 
          (r.type === 'WEEKLY' || r.type === 'DAILY')
        );
      }
    }

    return filtered;
  };

  const displayedReports = getFilteredReports();

  return (
    <div className="space-y-6 font-sans">
      {!isCreatingReport ? (
        <>
          <OrganizationHeaderCard subtitle={isCeo ? "Executive Overview • General Executive Reports" : "Executive Overview • Reports & Activity Logs"} />

          <WorkplaceStatCards
            domainsCount={reports.length}
            usersCount={reports.filter(r => r.status === 'SUBMITTED').length}
            groupsCount={reports.filter(r => r.status === 'DRAFT').length}
            licensesCount={reports.filter(r => r.type === 'WEEKLY').length}
            card1Label="TOTAL REPORTS"
            card2Label="SUBMITTED / APPROVED"
            card3Label="PENDING DRAFTS"
            card4Label="WEEKLY DIGESTS"
          />

          {/* Page Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isCeo ? 'General Executive Reports' : 'Reports & Activity Logs'}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {isCeo 
                  ? 'Review general reports submitted by management and departments.' 
                  : 'Track work logs, operational summaries, and shift activities.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isCeo && (
                <button 
                  onClick={() => setIsCreatingReport(true)}
                  className="bg-[#001f5b] hover:bg-[#001f5b]/90 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
                >
                  Create Report
                </button>
              )}
              <button 
                onClick={load} 
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Manager Tabs */}
          {isManager && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
              <button 
                onClick={() => setManagerTab('today')} 
                className={cn("px-4 py-1.5 rounded-md text-xs font-semibold transition-colors", managerTab === 'today' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                This Week's Team Reports
              </button>
              <button 
                onClick={() => setManagerTab('all')} 
                className={cn("px-4 py-1.5 rounded-md text-xs font-semibold transition-colors", managerTab === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                All Stored Reports
              </button>
            </div>
          )}

          {/* Reports Table / List */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isCeo ? 'General Reports' : (isManager && managerTab === 'today' ? 'Available Reports for the Week' : 'Stored Reports')}
                </h3>
                <p className="text-xs text-slate-500">Showing {displayedReports.length} records</p>
              </div>
              <div className="w-full sm:w-auto">
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-slate-500 text-slate-900" 
                  placeholder="Search reports by author or content..." 
                />
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500 animate-pulse">Loading reports...</div>
              ) : displayedReports.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-700">No reports found.</p>
                  <p className="text-xs text-slate-400">There are no reports matching your active filters.</p>
                </div>
              ) : (
                displayedReports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
                        {(report.user?.fullName ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{report.user?.fullName || 'Unknown'}</p>
                          {report.type === 'GENERAL' && <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">General</span>}
                          {report.status === 'DRAFT' && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Draft</span>}
                          {report.status === 'SUBMITTED' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Submitted</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(report.date).toLocaleDateString()} • {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {report.status === 'DRAFT' && report.userId === user?.id && (
                        <button 
                          onClick={() => handleEditDraft(report)} 
                          className="py-1.5 px-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-xs font-semibold border border-amber-200"
                        >
                          Edit Draft
                        </button>
                      )}
                      <button 
                        onClick={() => downloadDailyPdf(report)} 
                        className="py-1.5 px-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold shadow-sm"
                      >
                        Print PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Create / Edit Report Form */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsCreatingReport(false);
                setEditingId(null);
                setDailyForm({
                  title: '', type: 'DAILY', category: 'General', impact: 'Low', details: '', recommendation: '',
                  attachments: { transactions: false, expenses: false, foodAndMeal: false, subscriptions: false, kyc: false, leaves: false, websites: false },
                  attachmentDescriptions: { transactions: '', expenses: '', foodAndMeal: '', subscriptions: '', kyc: '', leaves: '', websites: '' }
                });
              }}
              className="px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Draft Report' : 'Create New Report'}</h2>
              <p className="text-xs text-slate-500">Fill out the details for your shift or operational report.</p>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-4xl space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isExecutiveManager && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Report Type *</label>
                  <select 
                    value={dailyForm.type}
                    onChange={e => setDailyForm({...dailyForm, type: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-semibold outline-none focus:border-slate-500 text-slate-900"
                  >
                    <option value="WEEKLY">Weekly Report (Internal)</option>
                    <option value="GENERAL">General Report (Submit to CEO)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Date *</label>
                <input 
                  type="text" 
                  disabled 
                  value={new Date().toLocaleDateString()} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Report Title *</label>
                <input 
                  required
                  value={dailyForm.title}
                  onChange={e => setDailyForm({...dailyForm, title: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium outline-none focus:border-slate-500 text-slate-900" 
                  placeholder="E.g., Weekly Summary Report" 
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Category *</label>
                <select 
                  value={dailyForm.category}
                  onChange={e => setDailyForm({...dailyForm, category: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium outline-none focus:border-slate-500 text-slate-900"
                >
                  <option value="General">General</option>
                  <option value="Outreach Event">Outreach Event</option>
                  <option value="Field Work">Field Work</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Client Meeting">Client Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Impact Level *</label>
                <select 
                  value={dailyForm.impact}
                  onChange={e => setDailyForm({...dailyForm, impact: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium outline-none focus:border-slate-500 text-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Details *</label>
              <textarea 
                required 
                rows={5} 
                value={dailyForm.details} 
                onChange={e => setDailyForm({...dailyForm, details: e.target.value})} 
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium outline-none focus:border-slate-500 resize-none text-slate-900" 
                placeholder="What did your team work on this week?" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Recommendations / Next Steps</label>
              <textarea 
                rows={3} 
                value={dailyForm.recommendation} 
                onChange={e => setDailyForm({...dailyForm, recommendation: e.target.value})} 
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium outline-none focus:border-slate-500 resize-none text-slate-900" 
                placeholder="Any recommendations for next week or ongoing issues?" 
              />
            </div>

            {isExecutiveManager && (
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-3 uppercase tracking-wider">Attach Data Modules (Auto-generates charts & tables)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.keys(dailyForm.attachments).map(key => (
                      <label key={key} className={cn("flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs font-semibold", dailyForm.attachments[key as keyof typeof dailyForm.attachments] ? "bg-slate-50 border-slate-900 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                        <input 
                          type="checkbox" 
                          checked={dailyForm.attachments[key as keyof typeof dailyForm.attachments]}
                          onChange={(e) => setDailyForm({...dailyForm, attachments: {...dailyForm.attachments, [key]: e.target.checked}})}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0" 
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Custom Descriptions for selected attachments */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {Object.keys(dailyForm.attachments).filter(k => dailyForm.attachments[k as keyof typeof dailyForm.attachments]).map(key => (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          key={`desc-${key}`} 
                          className="bg-slate-50 rounded-lg p-3.5 border border-slate-200"
                        >
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()} Summary / Description (Optional)</label>
                          <p className="text-[10px] text-slate-500 mb-2">If left blank, the system will automatically generate a detailed insight based on the actual data.</p>
                          <textarea
                            rows={2}
                            value={(dailyForm.attachmentDescriptions as any)?.[key] || ''}
                            onChange={(e) => setDailyForm({...dailyForm, attachmentDescriptions: {...dailyForm.attachmentDescriptions, [key]: e.target.value}})}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium outline-none focus:border-slate-500 resize-none text-slate-900"
                            placeholder={`Enter custom description for ${key}...`}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            <div className={cn("flex items-center pt-4 border-t border-slate-200 gap-3", isExecutiveManager ? "justify-between" : "justify-end")}>
              {isExecutiveManager && (
                <button 
                  disabled={isGenerating} 
                  onClick={(e) => handleSaveReport(e, 'DRAFT')}
                  type="button" 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              
              <button 
                disabled={isGenerating} 
                onClick={(e) => handleSaveReport(e, 'SUBMITTED')}
                type="button" 
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? 'Submitting...' : 'Review & Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
