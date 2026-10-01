import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ENAKO_LOGO_BASE64 } from './logo-base64';

export function savePdf(doc: any, fileName: string): boolean {
  try {
    // 1. Try standard jsPDF save
    doc.save(fileName);
    return true;
  } catch (err1) {
    console.warn('Standard doc.save failed, trying Blob download fallback:', err1);
    try {
      // 2. Blob fallback via DOM anchor
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
      return true;
    } catch (err2) {
      console.error('All PDF download methods failed:', err2);
      return false;
    }
  }
}

export function runAutoTable(doc: any, options: any): number {
  try {
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable(options);
    } else if (typeof autoTable === 'function') {
      (autoTable as any)(doc, options);
    } else if (typeof (autoTable as any)?.default === 'function') {
      (autoTable as any).default(doc, options);
    }
    return (doc as any).lastAutoTable?.finalY ?? options.startY ?? 60;
  } catch (err) {
    console.error('Error invoking autoTable:', err);
    return options.startY ?? 60;
  }
}

export function createBrandedPdf(
  title: string,
  subtitle?: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): { doc: jsPDF; pageWidth: number; pageHeight: number; startY: number } {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const brandNavy = [0, 31, 91] as [number, number, number];
  const mutedText = [100, 116, 139] as [number, number, number];

  // Top Accent Bar
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Logo
  try {
    if (ENAKO_LOGO_BASE64) {
      doc.addImage(ENAKO_LOGO_BASE64, 'PNG', 14, 10, 18, 18);
    }
  } catch {
    // Ignore logo image errors
  }

  // Header Title & Brand
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('ENAKO CLOUD OS • ENTERPRISE SYSTEM', 36, 17);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text(title, 36, 24);

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString();
  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr} • ${timeStr}`, pageWidth - 14, 17, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 31, pageWidth - 14, 31);

  let startY = 38;
  if (subtitle) {
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, 14, startY);
    startY += 8;
  }

  return { doc, pageWidth, pageHeight, startY };
}

export function exportTablePdf(params: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  columnStyles?: Record<string | number, any>;
}): boolean {
  // If more than 5 columns, default to landscape so Event Description and all fields have ample space
  const effectiveOrientation: 'portrait' | 'landscape' =
    params.orientation || (params.headers.length >= 6 ? 'landscape' : 'portrait');

  const { doc, pageWidth, pageHeight, startY } = createBrandedPdf(
    params.title,
    params.subtitle,
    effectiveOrientation
  );
  const brandNavy = [0, 31, 91] as [number, number, number];

  // Auto-build balanced column styles if not explicitly provided
  const computedColumnStyles: Record<string | number, any> = { ...params.columnStyles };

  params.headers.forEach((header, idx) => {
    const hLower = header.toLowerCase();
    if (!computedColumnStyles[idx]) {
      if (hLower.includes('description') || hLower.includes('particular') || hLower.includes('event') || hLower.includes('detail')) {
        // Give event / description column generous width and wrap cleanly without choking
        computedColumnStyles[idx] = {
          cellWidth: effectiveOrientation === 'landscape' ? 70 : 50,
          overflow: 'linebreak'
        };
      } else if (hLower.includes('id') || hLower.includes('ref')) {
        computedColumnStyles[idx] = { cellWidth: 26, fontStyle: 'bold' };
      } else if (hLower.includes('status')) {
        computedColumnStyles[idx] = { cellWidth: 22, halign: 'center' };
      } else if (hLower.includes('date') || hLower.includes('time') || hLower.includes('occurred') || hLower.includes('recorded')) {
        computedColumnStyles[idx] = { cellWidth: 28, overflow: 'linebreak' };
      } else if (hLower.includes('amount') || hLower.includes('total') || hLower.includes('pays')) {
        computedColumnStyles[idx] = { halign: 'right' };
      }
    }
  });

  runAutoTable(doc, {
    startY,
    head: [params.headers],
    body:
      params.rows.length > 0
        ? params.rows
        : [['No records available for the selected period', ...params.headers.slice(1).map(() => '')]],
    theme: 'grid',
    styles: {
      fontSize: effectiveOrientation === 'landscape' ? 7.5 : 7,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: computedColumnStyles,
    headStyles: { fillColor: brandNavy, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ENAKO Cloud OS • Confidential Official Record • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return savePdf(doc, params.fileName);
}
