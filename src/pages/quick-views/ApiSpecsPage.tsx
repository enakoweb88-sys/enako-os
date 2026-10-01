import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, Check, Terminal, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiSpecsPage() {
  const location = useLocation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'curl' | 'response'>>({});

  // Smooth scroll to section when hash changes or on initial load
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [location.hash]);

  // Observe active section while scrolling to keep URL hash in sync with reading position
  useEffect(() => {
    const sectionIds = ['transactions', 'kyc', 'employees', 'cash', 'system'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const newHash = `#${entry.target.id}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(null, '', newHash);
              window.dispatchEvent(new Event('hashchange'));
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const endpointGroups = [
    {
      id: 'transactions',
      title: 'Transactions API',
      description: 'Operations for creating, querying, and auditing financial ledger transactions and currency exchanges.',
      endpoints: [
        {
          key: 'txn-get',
          method: 'GET',
          path: '/api/transactions',
          desc: 'Retrieve paginated daily transactions ledger with dual currency exchange rates and settlement status.',
          auth: 'Bearer JWT (Finance / Executive)',
          curl: `curl -X GET "https://api.enakoos.com/v1/api/transactions?limit=20&page=1" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json"`,
          responseSample: `{
  "items": [
    {
      "id": "clx88210001",
      "reference": "TXN-2026-XAF-8821",
      "type": "CASH_COLLECTION",
      "amount": 250000,
      "currency": "XAF",
      "exchangeRate": 610.5,
      "status": "COMPLETED",
      "createdAt": "2026-09-30T09:20:18Z"
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20
}`
        },
        {
          key: 'txn-post',
          method: 'POST',
          path: '/api/transactions',
          desc: 'Initiate a new transaction entry with automated currency conversion and margin calculation.',
          auth: 'Bearer JWT (Finance)',
          curl: `curl -X POST "https://api.enakoos.com/v1/api/transactions" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 500000, "currency": "XAF", "type": "DEPOSIT", "customer": "John Doe"}'`,
          responseSample: `{
  "success": true,
  "transactionId": "clx99102",
  "reference": "TXN-2026-XAF-9910",
  "status": "PENDING_APPROVAL",
  "createdAt": "2026-09-30T13:45:00Z"
}`
        }
      ]
    },
    {
      id: 'kyc',
      title: 'KYC & Verification API',
      description: 'Customer identity verification, document submissions, and compliance review audit workflows.',
      endpoints: [
        {
          key: 'kyc-get',
          method: 'GET',
          path: '/api/kyc/submissions',
          desc: 'Query customer identity filings filtered by status (PENDING, APPROVED, REJECTED) and search term.',
          auth: 'Bearer JWT (Compliance / CEO)',
          curl: `curl -X GET "https://api.enakoos.com/v1/api/kyc/submissions?status=PENDING" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`,
          responseSample: `[
  {
    "id": "kyc-091",
    "applicantName": "Mamadou Traore",
    "applicantType": "INDIVIDUAL",
    "email": "mamadou@enakoos.com",
    "status": "PENDING",
    "documentsCount": 2,
    "createdAt": "2026-09-30T11:10:00Z"
  }
]`
        },
        {
          key: 'kyc-review',
          method: 'PATCH',
          path: '/api/kyc/submissions/:id/review',
          desc: 'Submit official compliance verdict (APPROVED, REJECTED, UNDER_REVIEW) with rejection remarks.',
          auth: 'Bearer JWT (Compliance Officer)',
          curl: `curl -X PATCH "https://api.enakoos.com/v1/api/kyc/submissions/kyc-091/review" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "APPROVED", "rejectionReason": ""}'`,
          responseSample: `{
  "id": "kyc-091",
  "status": "APPROVED",
  "reviewedAt": "2026-09-30T13:20:00Z",
  "reviewedBy": "Compliance Officer"
}`
        }
      ]
    },
    {
      id: 'employees',
      title: 'Employees & Roster API',
      description: 'Directory services for departmental rosters, operative credentials, and role authorizations.',
      endpoints: [
        {
          key: 'emp-get',
          method: 'GET',
          path: '/api/employees',
          desc: 'Fetch active company operatives, departmental rosters, clearance levels, and assigned titles.',
          auth: 'Bearer JWT (Manager / CEO)',
          curl: `curl -X GET "https://api.enakoos.com/v1/api/employees?limit=50" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`,
          responseSample: `{
  "items": [
    {
      "id": "emp-001",
      "fullName": "Alice Biya",
      "title": "Senior Treasury Officer",
      "department": "Finance & Accounts",
      "status": "ACTIVE",
      "hireDate": "2024-03-01T00:00:00Z"
    }
  ],
  "total": 14
}`
        }
      ]
    },
    {
      id: 'cash',
      title: 'Cash Collections API',
      description: 'Physical vault drops, courier pickup assignments, and teller cash reconciliation endpoints.',
      endpoints: [
        {
          key: 'cash-get',
          method: 'GET',
          path: '/api/cash-collections/batches',
          desc: 'List audited physical cash collection envelopes, teller reconciliation seals, and vault drops.',
          auth: 'Bearer JWT (Finance / Audit)',
          curl: `curl -X GET "https://api.enakoos.com/v1/api/cash-collections/batches" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`,
          responseSample: `[
  {
    "batchId": "BATCH-2026-0930-01",
    "collector": "Field Teller 04",
    "totalCollected": 1420000,
    "sealedAt": "2026-09-30T11:00:00Z",
    "audited": true
  }
]`
        }
      ]
    },
    {
      id: 'system',
      title: 'System & Health API',
      description: 'Gateway health check, database ping, and platform telemetry status.',
      endpoints: [
        {
          key: 'health-get',
          method: 'GET',
          path: '/health',
          desc: 'Returns system uptime, database latency, and storage bucket connectivity metrics.',
          auth: 'Public / Unauthenticated',
          curl: `curl -X GET "https://api.enakoos.com/v1/health"`,
          responseSample: `{
  "status": "healthy",
  "database": "connected",
  "storage": "connected",
  "uptimeSeconds": 864200,
  "timestamp": "2026-09-30T14:00:00Z"
}`
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-32 font-sans max-w-4xl text-slate-800">
      {/* ── TOP HEADER (NO CARDS, NO BOXES) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Developer Portal</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">API Specifications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            API Specifications & Endpoints
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Core REST interfaces, endpoint schemas, authentication scopes, and executable code snippets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => copyToClipboard('https://api.enakoos.com/v1', 'base-url', 'Base URL')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'base-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Base URL
          </button>
        </div>
      </div>

      {/* ── ENDPOINT LISTINGS (NO CARDS / NO BOXES EXCEPT CODE SNIPPET CONTAINERS) ── */}
      <div className="space-y-14">
        {endpointGroups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-8 space-y-6 pt-2 border-b border-slate-200/80 pb-12">
            {/* Section Heading */}
            <div className="pb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {group.title}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {group.description}
              </p>
            </div>

            {/* Endpoints */}
            <div className="space-y-10 pl-1">
              {group.endpoints.map((ep) => {
                const currentTab = activeCodeTab[ep.key] || 'curl';
                const currentCode = currentTab === 'curl' ? ep.curl : ep.responseSample;
                const copyLabel = currentTab === 'curl' ? 'cURL Command' : 'JSON Response';

                return (
                  <div key={ep.key} className="space-y-3">
                    {/* Endpoint Title Row (Inline, No Card Box) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            ep.method === 'GET'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : ep.method === 'POST'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono font-bold text-slate-900">
                          {ep.path}
                        </code>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 text-[11px] font-medium hidden md:inline">
                          {ep.auth}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {ep.desc}
                    </p>

                    {/* The ONLY container allowed: Syntax-Highlighted Code Box */}
                    <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
                      {/* Code Box Header with Tabs & Copy Button */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveCodeTab((prev) => ({ ...prev, [ep.key]: 'curl' }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                              currentTab === 'curl'
                                ? 'bg-slate-800 text-sky-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            cURL Request
                          </button>
                          <button
                            onClick={() => setActiveCodeTab((prev) => ({ ...prev, [ep.key]: 'response' }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                              currentTab === 'response'
                                ? 'bg-slate-800 text-emerald-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Response JSON
                          </button>
                        </div>

                        <button
                          onClick={() => copyToClipboard(currentCode, `${ep.key}-${currentTab}`, `${ep.path} ${copyLabel}`)}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors cursor-pointer text-xs"
                        >
                          {copiedKey === `${ep.key}-${currentTab}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied {copyLabel}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy {copyLabel}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Body */}
                      <pre className="p-4 text-[12px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        {currentCode}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
