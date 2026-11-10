import { mealDate, mealDay } from "./meal-utils";

export interface MealReportRecord {
  id?: string;
  employeeId?: string;
  date?: string;
  effectiveDate?: string;
  status: string;
  vendor?: string | null;
  mealName?: string | null;
  mealTime?: string | null;
  createdAt?: string;
  totalAmount?: string | number | null;
  companyAmount?: string | number | null;
  employeeAmount?: string | number | null;
  employee?: { fullName?: string };
}
export interface MealTotals {
  count: number;
  total: number;
  company: number;
  payroll: number;
}
export interface ProviderTotal extends MealTotals {
  key: string;
  name: string;
}
export interface EmployeeTotal extends MealTotals {
  key: string;
  name: string;
}
export interface PayrollTotal extends MealTotals {
  employeeId: string;
  employee: string;
  provider: string;
}
export type MealPeriod = { month: string } | { start: string; end: string };

export function providerName(value: string | null | undefined) {
  return (
    value?.normalize("NFC").trim().replace(/\s+/g, " ") ||
    "Provider not recorded"
  );
}
export function providerKey(value: string | null | undefined) {
  return providerName(value).toLocaleLowerCase("en");
}
const blank = (): MealTotals => ({
  count: 0,
  total: 0,
  company: 0,
  payroll: 0,
});
const amount = (
  value: string | number | null | undefined,
  fallback: number,
) => {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number) || number < 0)
    throw new Error(
      "A meal record has an invalid amount. Please contact the manager.",
    );
  return number;
};
function validDay(day: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}
export function mealPeriodBounds(period: MealPeriod) {
  if ("month" in period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period.month))
      throw new Error("Select a valid month.");
    const start = period.month + "-01";
    const end = new Date(
      Date.UTC(
        Number(period.month.slice(0, 4)),
        Number(period.month.slice(5, 7)),
        0,
      ),
    )
      .toISOString()
      .slice(0, 10);
    return { start, end, label: period.month };
  }
  if (
    !validDay(period.start) ||
    !validDay(period.end) ||
    period.end < period.start
  )
    throw new Error("Select a valid start and end date.");
  return { ...period, label: `${period.start} to ${period.end}` };
}

export function buildMealReport(
  items: MealReportRecord[],
  period: MealPeriod = { month: mealDay().slice(0, 7) },
) {
  const bounds = mealPeriodBounds(period);
  const records = items.filter((item) => {
    const date = mealDate(item);
    return date >= bounds.start && date <= bounds.end;
  });
  const providers = new Map<string, ProviderTotal>(),
    employees = new Map<string, EmployeeTotal>(),
    payroll = new Map<string, PayrollTotal>();
  const totals = blank();
  for (const record of records) {
    if (record.status !== "ATE") continue;
    const key = providerKey(record.vendor),
      name = providerName(record.vendor);
    const employeeId = record.employeeId || record.id || "unknown-employee";
    const employee = record.employee?.fullName || "Staff member";
    const p = providers.get(key) || { ...blank(), key, name };
    const e = employees.get(employeeId) || {
      ...blank(),
      key: employeeId,
      name: employee,
    };
    const pair = JSON.stringify([employeeId, key]);
    const share = payroll.get(pair) || {
      ...blank(),
      employeeId,
      employee,
      provider: p.name,
    };
    for (const total of [totals, p, e, share]) {
      total.count++;
      total.total += amount(record.totalAmount, 1000);
      total.company += amount(record.companyAmount, 500);
      total.payroll += amount(record.employeeAmount, 500);
    }
    providers.set(key, p);
    employees.set(employeeId, e);
    payroll.set(pair, share);
  }
  return {
    bounds,
    records,
    totals,
    providers: [...providers.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    employees: [...employees.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    payroll: [...payroll.values()].sort(
      (a, b) =>
        a.employee.localeCompare(b.employee) ||
        a.provider.localeCompare(b.provider),
    ),
  };
}

export function mealServiceTime(value?: string | null) {
  if (!value) return "Not recorded";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return value;
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Douala",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date)
    : "Not recorded";
}
export function mealRecordedAt(value?: string) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? `${mealDay(date)} ${mealServiceTime(value)}`
    : "Not recorded";
}

export function mealReportTables(report: ReturnType<typeof buildMealReport>) {
  const amounts = (row: MealTotals) => [
    row.count,
    row.total,
    row.company,
    row.payroll,
  ];
  return [
    {
      name: "Provider Bills",
      headers: [
        "Provider",
        "Meals",
        "Full bill (FCFA)",
        "Company covers (FCFA)",
        "Payroll recovery (FCFA)",
      ],
      rows: [
        ...report.providers.map((p) => [p.name, ...amounts(p)]),
        ["TOTAL", ...amounts(report.totals)],
      ],
    },
    {
      name: "Employee Payroll",
      headers: [
        "Employee ID",
        "Employee",
        "Meals",
        "Food cost (FCFA)",
        "Company covers (FCFA)",
        "Payroll deduction (FCFA)",
      ],
      rows: [
        ...report.employees.map((e) => [e.key, e.name, ...amounts(e)]),
        ["", "TOTAL", ...amounts(report.totals)],
      ],
    },
    {
      name: "Payroll By Provider",
      headers: [
        "Employee ID",
        "Employee",
        "Provider",
        "Meals",
        "Food cost (FCFA)",
        "Company covers (FCFA)",
        "Payroll deduction (FCFA)",
      ],
      rows: report.payroll.map((p) => [
        p.employeeId,
        p.employee,
        p.provider,
        ...amounts(p),
      ]),
    },
    {
      name: "Meal Records",
      headers: [
        "Meal date",
        "Service time (Cameroon)",
        "Recorded at (Cameroon)",
        "Provider",
        "Employee",
        "Food",
        "Status",
        "Food cost (FCFA)",
        "Company covers (FCFA)",
        "Payroll deduction (FCFA)",
      ],
      rows: report.records.map((r) => [
        mealDate(r),
        mealServiceTime(r.mealTime),
        mealRecordedAt(r.createdAt),
        providerName(r.vendor),
        r.employee?.fullName || "Staff member",
        r.mealName || "Standard lunch",
        r.status,
        r.status === "ATE" ? amount(r.totalAmount, 1000) : 0,
        r.status === "ATE" ? amount(r.companyAmount, 500) : 0,
        r.status === "ATE" ? amount(r.employeeAmount, 500) : 0,
      ]),
    },
  ];
}
