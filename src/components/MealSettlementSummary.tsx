import { buildMealReport } from "../lib/meal-report";

const money = (value: number) => value.toLocaleString("en-US") + " FCFA";
const cell = "px-4 py-3 text-left text-sm";
export default function MealSettlementSummary({
  report,
  isManager,
  userId,
  onProvider,
}: {
  report: ReturnType<typeof buildMealReport>;
  isManager: boolean;
  userId?: string;
  onProvider: (provider: string) => void;
}) {
  const personal = report.employees.find((employee) => employee.key === userId);
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="font-bold">
          {isManager
            ? "Provider bills and employee payroll"
            : "Your meals by provider"}{" "}
          · {report.bounds.label}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          The manager pays the full provider bill. Company contribution: 500
          FCFA per meal. Employee payroll deduction: 500 FCFA per meal.
        </p>
        <p className="mt-2 text-sm font-semibold">
          Your payroll deduction: {money(personal?.payroll || 0)} · Your company
          contribution: {money(personal?.company || 0)}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Provider",
                "Meals",
                isManager ? "Full bill to pay" : "Your food cost",
                "Company covers",
                "Payroll recovery",
                "Details",
              ].map((text) => (
                <th key={text} className={cell}>
                  {text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.providers.map((provider) => (
              <tr key={provider.key} className="border-t">
                <td className={cell}>{provider.name}</td>
                <td className={cell}>{provider.count}</td>
                <td className={cell}>{money(provider.total)}</td>
                <td className={cell}>{money(provider.company)}</td>
                <td className={cell}>{money(provider.payroll)}</td>
                <td className={cell}>
                  <button
                    className="font-semibold text-blue-700"
                    onClick={() => onProvider(provider.key)}
                  >
                    View meals
                  </button>
                </td>
              </tr>
            ))}
            {!report.providers.length && (
              <tr>
                <td className={cell} colSpan={6}>
                  No consumed meals for this month.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t bg-slate-50 font-bold">
            <tr>
              <td className={cell}>Total</td>
              <td className={cell}>{report.totals.count}</td>
              <td className={cell}>{money(report.totals.total)}</td>
              <td className={cell}>{money(report.totals.company)}</td>
              <td className={cell}>{money(report.totals.payroll)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      {isManager && (
        <div>
          <h3 className="mb-2 font-semibold">Payroll deductions by employee</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Employee",
                    "Meals",
                    "Food cost",
                    "Company covers",
                    "Payroll deduction",
                    "Provider breakdown",
                  ].map((text) => (
                    <th key={text} className={cell}>
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.employees.map((employee) => (
                  <tr key={employee.key} className="border-t">
                    <td className={cell}>
                      {employee.name}
                      {employee.key === userId ? " (you)" : ""}
                    </td>
                    <td className={cell}>{employee.count}</td>
                    <td className={cell}>{money(employee.total)}</td>
                    <td className={cell}>{money(employee.company)}</td>
                    <td className={cell}>{money(employee.payroll)}</td>
                    <td className={cell}>
                      <details>
                        <summary className="cursor-pointer text-blue-700">
                          By provider
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {report.payroll
                            .filter((row) => row.employeeId === employee.key)
                            .map((row) => (
                              <li key={row.provider}>
                                {row.provider}: {money(row.payroll)} payroll /{" "}
                                {money(row.company)} company
                              </li>
                            ))}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500">
        These are calculated bills and deductions, not payment confirmations.
        Did-not-eat and disputed entries are excluded from payable totals.
        Historical saved amounts are preserved.
      </p>
    </section>
  );
}
