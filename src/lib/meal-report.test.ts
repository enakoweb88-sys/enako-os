import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import {
  buildMealReport,
  mealPeriodBounds,
  mealServiceTime,
  mealRecordedAt,
  mealReportTables,
  MealReportRecord,
} from "./meal-report";
import { createMealWorkbook, createMealPdf } from "./meal-report-export";

const entry = (
  id: string,
  vendor: string,
  employeeId = "employee",
  date = "2026-11-10",
): MealReportRecord => ({
  id,
  employeeId,
  date,
  vendor,
  status: "ATE",
  mealName: "Eru",
  mealTime: "2026-11-10T12:00:00.000Z",
  createdAt: "2026-11-10T13:15:00.000Z",
  totalAmount: "1000",
  companyAmount: "500",
  employeeAmount: "500",
  employee: {
    fullName: employeeId === "manager" ? "Manager Fixture" : "Employee Fixture",
  },
});

test("five providers reconcile full bills, subsidy and payroll by employee", () => {
  const items = ["A", "B", "C", "D", "E"].flatMap((name, i) => [
    entry("employee-" + i, name),
    entry("manager-" + i, name, "manager"),
  ]);
  const report = buildMealReport(items, { month: "2026-11" });
  assert.equal(report.providers.length, 5);
  assert.deepEqual(report.totals, {
    count: 10,
    total: 10000,
    company: 5000,
    payroll: 5000,
  });
  assert.ok(
    report.providers.every(
      (p) => p.total === 2000 && p.company === 1000 && p.payroll === 1000,
    ),
  );
  assert.equal(
    report.employees.find((e) => e.key === "manager")?.payroll,
    2500,
  );
  assert.equal(report.payroll.length, 10);
  assert.equal(
    report.payroll.reduce((sum, p) => sum + p.payroll, 0),
    report.totals.payroll,
  );
});
test("case and whitespace variants group without rewriting records", () => {
  const record = entry("a", "  Mami   Chop ");
  const report = buildMealReport([record, entry("b", "mami chop")], {
    month: "2026-11",
  });
  assert.equal(report.providers.length, 1);
  assert.equal(report.providers[0].count, 2);
  assert.equal(record.vendor, "  Mami   Chop ");
});
test("monthly bills exclude other months, did-not-eat and disputed entries", () => {
  const report = buildMealReport(
    [
      entry("ok", "A"),
      entry("old", "B", "employee", "2026-10-31"),
      { ...entry("no", "C"), status: "DID_NOT_EAT" },
      { ...entry("disputed", "D"), status: "DISPUTED" },
    ],
    { month: "2026-11" },
  );
  assert.equal(report.records.length, 3);
  assert.equal(report.providers.length, 1);
  assert.equal(report.totals.total, 1000);
});
test("range endpoints are inclusive and historical amounts are preserved", () => {
  const items = [
    entry("a", "A", "employee", "2026-11-01"),
    {
      ...entry("b", "B", "employee", "2026-11-02"),
      totalAmount: "1200",
      companyAmount: "500",
      employeeAmount: "700",
    },
    entry("c", "C", "employee", "2026-11-03"),
  ];
  const report = buildMealReport(items, {
    start: "2026-11-01",
    end: "2026-11-02",
  });
  assert.deepEqual(report.totals, {
    count: 2,
    total: 2200,
    company: 1000,
    payroll: 1200,
  });
  assert.equal(mealPeriodBounds({ month: "2028-02" }).end, "2028-02-29");
  assert.throws(() =>
    mealPeriodBounds({ start: "2026-02-30", end: "2026-03-01" }),
  );
  assert.throws(() => mealPeriodBounds({ month: "2026-13" }));
});
test("missing times stay explicit and service timestamps use Cameroon time", () => {
  assert.equal(mealServiceTime("2026-11-10T12:00:00Z"), "13:00:00");
  assert.equal(mealServiceTime("13:00"), "13:00");
  assert.equal(mealServiceTime(), "Not recorded");
  assert.equal(mealRecordedAt("2026-11-10T23:30:00Z"), "2026-11-11 00:30:00");
});
test("employee report calculates only the supplied authorized personal records", () => {
  const report = buildMealReport([entry("own", "A")], { month: "2026-11" });
  assert.equal(report.employees.length, 1);
  assert.equal(report.totals.payroll, 500);
  assert.throws(() =>
    buildMealReport([{ ...entry("bad", "A"), employeeAmount: "invalid" }], {
      month: "2026-11",
    }),
  );
});
test("Excel includes four reconciled sheets, numeric totals and safe provider text", () => {
  const report = buildMealReport(
    [entry("a", '=HYPERLINK("https://fixture.invalid")')],
    { month: "2026-11" },
  );
  const workbook = createMealWorkbook(report);
  const data = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const read = XLSX.read(data, { type: "buffer" });
  assert.deepEqual(read.SheetNames, [
    "Provider Bills",
    "Employee Payroll",
    "Payroll By Provider",
    "Meal Records",
  ]);
  assert.equal(read.Sheets["Provider Bills"].A4.t, "s");
  assert.equal(read.Sheets["Provider Bills"].A4.f, undefined);
  assert.equal(read.Sheets["Provider Bills"].C4.v, 1000);
  assert.equal(read.Sheets["Employee Payroll"].F4.v, 500);
  assert.ok(
    mealReportTables(report)[3].headers.includes("Recorded at (Cameroon)"),
  );
});
test("PDF produces actual multi-section downloadable bytes", () => {
  const pdf = createMealPdf(
    buildMealReport([entry("a", "A")], { month: "2026-11" }),
  );
  const bytes = Buffer.from(pdf.output("arraybuffer"));
  assert.ok(bytes.toString("ascii", 0, 5).startsWith("%PDF-"));
  assert.ok(bytes.length > 5000);
  assert.ok(pdf.getNumberOfPages() >= 4);
});
