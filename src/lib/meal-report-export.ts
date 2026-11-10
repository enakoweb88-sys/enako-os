import * as XLSX from "xlsx";
import { autoTable } from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { buildMealReport, mealReportTables } from "./meal-report";

export function createMealWorkbook(report: ReturnType<typeof buildMealReport>) {
  const workbook = XLSX.utils.book_new();
  for (const table of mealReportTables(report)) {
    // Strings remain string cells; numeric financial cells remain numbers.
    const sheet = XLSX.utils.aoa_to_sheet([
      ["ENAKO OS - Staff meals", report.bounds.label],
      [
        "Manager pays the full provider bill; employee shares are recovered through payroll.",
      ],
      table.headers,
      ...table.rows,
    ]);
    sheet["!cols"] = table.headers.map(() => ({ wch: 24 }));
    XLSX.utils.book_append_sheet(workbook, sheet, table.name);
  }
  return workbook;
}

export function createMealPdf(report: ReturnType<typeof buildMealReport>) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  for (const [index, table] of mealReportTables(report).entries()) {
    if (index) doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0, 31, 91);
    doc.text("ENAKO OS - Staff meals and payroll", 14, 14);
    doc.setFontSize(8);
    doc.text(
      `Period: ${report.bounds.label} | Currency: FCFA | Timezone: Africa/Douala`,
      14,
      21,
    );
    doc.text(
      "Manager pays the full bill. Employee shares are recovered through payroll.",
      14,
      26,
    );
    const y = 34;
    doc.setFontSize(11);
    doc.text(table.name, 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [table.headers],
      body: table.rows,
      styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [0, 31, 91] },
      margin: { bottom: 18 },
    });
  }
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.text(
      `ENAKO OS | ${report.bounds.label} | Page ${page} of ${doc.getNumberOfPages()}`,
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
  }
  return doc;
}

export function downloadMealReport(
  report: ReturnType<typeof buildMealReport>,
  format: "PDF" | "EXCEL",
) {
  const file = `Enako_Meals_${report.bounds.label.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  if (format === "EXCEL")
    XLSX.writeFile(createMealWorkbook(report), file + ".xlsx");
  else createMealPdf(report).save(file + ".pdf");
}
