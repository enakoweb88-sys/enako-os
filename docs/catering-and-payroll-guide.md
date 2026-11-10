# Catering providers and payroll reports

## Using the update

1. Open Staff Meals and choose Log Meal Entry.
2. Choose an existing provider, or choose Other provider and enter a name. A new name is saved with the meal and becomes selectable on later visits. Providers are derived from saved meal records, not a separate supplier directory.
3. Choose the food, or choose Other and enter the food name. There is no price input: consumed meals cost 1,000 FCFA, with 500 FCFA covered by the company and 500 FCFA deducted through payroll. The manager follows the same rule.
4. On Staff Meals, select a month. Provider totals show the full bill the manager pays, the company contribution, and the amount recovered through payroll. View meals filters the ledger to that provider, including meal dates, service times and entry timestamps.
5. Managers and the CEO also see each employee's total payroll deduction, expandable by provider, with their own personal share shown separately. Ordinary employees receive only their own meal records from the backend.
6. Export Ledger offers a month or custom date range and PDF or Excel. Both formats contain provider bills, employee payroll totals, payroll by provider and the detailed meal records.

Example: a provider supplies five meals. The manager pays 5,000 FCFA, the company covers 2,500 FCFA and payroll recovers 2,500 FCFA. If an employee ate three and the manager ate two, their deductions are 1,500 and 1,000 FCFA respectively.

These are amounts to pay and deduct, not confirmations that payment or payroll deduction has already occurred. Did-not-eat and disputed entries are excluded from payable totals. Existing saved meal prices remain unchanged. Service and entry times display in Africa/Douala; missing historical times are labelled Not recorded.

## How the code works

- `src/pages/LogMealPage.tsx`: handles provider selection and custom names, keeps the user's existing food options including Eru, validates non-empty names and submits the actual provider name. New names are reused through GET `/meals/providers`.
- Backend `src/modules/meals/meals.service.ts`: trims names, merges repeated spaces, returns deduplicated provider names without employee financial data, and enforces 1,000/500/500 regardless of browser-supplied amounts. Existing authentication, self-only employee access and duplicate daily-entry protections remain in place.
- `src/lib/meal-report.ts`: the shared calculation code. It filters calendar dates, includes only consumed meals in bills, groups provider names without case/whitespace duplicates, and calculates totals per provider, employee and employee/provider pair. The dashboard and downloads use this same code.
- `src/components/MealSettlementSummary.tsx`: renders the provider bills and manager payroll breakdown. `src/pages/StaffMeals.tsx` connects these summaries to month/provider filters and the dated ledger.
- `src/components/MealExportModal.tsx`: selects the export period and format. `src/lib/meal-report-export.ts` builds real PDF documents and Excel workbooks with four sheets. Financial cells in Excel are numeric; provider and food names remain text.

No database migration or new package installation is needed. This belongs exclusively to ENAKO OS; Cash Dashboard data, users and business logic are unaffected.

## Checks

Frontend calculation and document checks: `npx tsx --test src/lib/meal-report.test.ts`.
Backend unit tests: `npm run test:unit`.
Backend disposable database/HTTP checks: `npm run test:integration`.
Type checks, builds and existing security/access tests also apply.
