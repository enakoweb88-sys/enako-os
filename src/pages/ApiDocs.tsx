import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, Check, Terminal, Shield, Zap, AlertTriangle, Radio, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiDocs() {
  const location = useLocation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [webhookSimulating, setWebhookSimulating] = useState(false);

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
    const sectionIds = ['overview', 'authentication', 'rate-limits', 'error-handling', 'webhooks'];
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

  const handleGenerateSandboxToken = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '');
    const payload = btoa(
      JSON.stringify({
        sub: 'usr_sandbox_developer_99',
        org: 'ENAKO_SANDBOX_CORP',
        roles: ['API_DEVELOPER', 'FINANCE_READ', 'KYC_READ'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      })
    ).replace(/=+$/, '');
    const sig = 'sB4xL_k9w0QvP9R3_EnakoLiveSec2026';
    const token = `ey.${header}.${payload}.${sig}`;
    setGeneratedToken(token);
    toast.success('Generated 24-hour Sandbox JWT token');
  };

  const handleSimulateRateLimit = () => {
    toast.info('HTTP 200 OK — Rate Limits: 118 / 120 remaining in 60s window (Reset in 42s)');
  };

  const handleSimulateWebhook = () => {
    setWebhookSimulating(true);
    toast.loading('Dispatching test event (transaction.completed) to webhook endpoint...', { id: 'webhook-toast' });
    setTimeout(() => {
      setWebhookSimulating(false);
      toast.success('Webhook acknowledged with HTTP 200 OK by subscriber server', { id: 'webhook-toast' });
    }, 1200);
  };

  const errorJsonSample = `{
  "type": "https://api.enakoos.com/errors/invalid-currency",
  "title": "Invalid Ledger Currency",
  "status": 400,
  "detail": "Requested currency 'XYZ' is not supported in the Central African CEMAC ledger.",
  "instance": "/api/transactions/txn-2026-0930-881",
  "code": "ERR_CURRENCY_UNSUPPORTED",
  "timestamp": "2026-09-30T14:00:00Z"
}`;

  const webhookVerifySample = `// Node.js Express Webhook Signature Verification
import crypto from 'crypto';

export function verifyEnakoWebhook(req, res, next) {
  const signature = req.headers['x-enako-signature'];
  const secret = process.env.ENAKO_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
}`;

  return (
    <div className="space-y-12 pb-32 font-sans max-w-4xl text-slate-800">
      {/* ── TOP HEADER (NO CARDS, NO BOXES) ── */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>Developer Portal</span>
          <span>/</span>
          <span className="text-[#001f5b] font-bold">API Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ENAKO OS API Documentation
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The official integration manual for interacting with ENAKO Cloud System REST interfaces, security protocols, token lifecycles, and event streams.
        </p>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <button
            onClick={() => copyToClipboard('https://api.enakoos.com/v1', 'prod-url', 'Production URL')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'prod-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Production Base URL
          </button>

          <button
            onClick={() => copyToClipboard('https://sandbox.api.enakoos.com/v1', 'sandbox-url', 'Sandbox URL')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'sandbox-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Sandbox URL
          </button>
        </div>
      </div>

      {/* ── SECTION 1: OVERVIEW & ARCHITECTURE ── */}
      <section id="overview" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Terminal className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            1. Overview & Core Architecture
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          The ENAKO Cloud System provides a deterministic, enterprise-grade RESTful API built over HTTPS/TLS 1.3 and HTTP/2 transport. All requests and responses are strictly formatted as UTF-8 encoded JSON payloads (<code className="text-xs font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">application/json</code>).
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          All endpoints adhere to predictable REST semantics. We utilize standard HTTP methods (<code className="text-xs font-mono font-bold text-sky-700">GET</code>, <code className="text-xs font-mono font-bold text-emerald-700">POST</code>, <code className="text-xs font-mono font-bold text-amber-700">PATCH</code>, <code className="text-xs font-mono font-bold text-rose-700">DELETE</code>) and provide ISO 8601 UTC timestamps across all models.
        </p>

        {/* Action Bar */}
        <div className="pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Base URLs:</div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-100/70 rounded-md">
              <span className="text-slate-700"><strong className="font-semibold text-slate-900">Production:</strong> https://api.enakoos.com/v1</span>
              <button
                onClick={() => copyToClipboard('https://api.enakoos.com/v1', 'ov-prod', 'Production Base URL')}
                className="text-slate-500 hover:text-slate-900 font-sans font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'ov-prod' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-100/70 rounded-md">
              <span className="text-slate-700"><strong className="font-semibold text-slate-900">Sandbox:</strong> https://sandbox.api.enakoos.com/v1</span>
              <button
                onClick={() => copyToClipboard('https://sandbox.api.enakoos.com/v1', 'ov-sb', 'Sandbox Base URL')}
                className="text-slate-500 hover:text-slate-900 font-sans font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'ov-sb' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Standard Request Headers</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `Content-Type: application/json\nAccept: application/json\nIdempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`,
                    'headers-req',
                    'Headers'
                  )
                }
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'headers-req' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Headers</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`Content-Type: application/json
Accept: application/json
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: AUTHENTICATION & TOKENS ── */}
      <section id="authentication" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Shield className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            2. Authentication & Bearer Tokens
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          The ENAKO API authenticates requests using RFC 6750 Bearer Tokens. Every authenticated API request must supply a valid JSON Web Token (JWT) in the standard <code className="text-xs font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Authorization</code> HTTP header.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          Access tokens are signed using high-entropy HMAC-SHA256 secrets. Tokens possess a standard lifespan of <strong>24 hours</strong>. When a token nears expiration, use your refresh token on the auth exchange route to generate a replacement credential without interrupting automated routines.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={() => copyToClipboard('Authorization: Bearer <YOUR_ACCESS_TOKEN>', 'auth-header-copy', 'Authorization Header')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'auth-header-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Auth Header Format
          </button>

          <button
            onClick={handleGenerateSandboxToken}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold hover:bg-[#001740] transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Sandbox Test Key
          </button>
        </div>

        {/* Generated Token Box (if active) */}
        {generatedToken && (
          <div className="pt-2">
            <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-emerald-400 font-mono">
                <span>Active Sandbox JWT Token (Expires in 24h)</span>
                <button
                  onClick={() => copyToClipboard(generatedToken, 'gen-jwt', 'Generated Sandbox Token')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'gen-jwt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Token</span>
                </button>
              </div>
              <pre className="p-3.5 text-[11px] font-mono text-emerald-300 break-all whitespace-pre-wrap leading-relaxed">
                {generatedToken}
              </pre>
            </div>
          </div>
        )}

        {/* Code Snippet Box */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>cURL Authentication Example</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `curl -X GET "https://api.enakoos.com/v1/api/transactions" \\\n  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\\n  -H "Content-Type: application/json"`,
                    'auth-curl',
                    'Auth cURL'
                  )
                }
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'auth-curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy cURL</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`curl -X GET "https://api.enakoos.com/v1/api/transactions" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: RATE LIMITS & QUOTAS ── */}
      <section id="rate-limits" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Zap className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            3. Rate Limits & Quotas
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          To ensure platform stability and protect downstream ledger engines from runaway polling, ENAKO OS enforces tiered rate limits. Limits are metered continuously over a rolling 60-second sliding window based on authenticated organization API keys and source IP addresses.
        </p>

        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 leading-relaxed">
          <li><strong>Standard Workplace Tier:</strong> 120 requests per minute.</li>
          <li><strong>High-Throughput Enterprise Burst:</strong> Up to 300 requests per minute for vetted webhooks and automated ERP ingestion.</li>
          <li><strong>Telemetry / Health Probes:</strong> Unmetered when throttled to a minimum 5-second interval.</li>
        </ul>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSimulateRateLimit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            Simulate Rate Limit Check
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Rate Limit Response Headers (HTTP 200 / HTTP 429)</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `X-RateLimit-Limit: 120\nX-RateLimit-Remaining: 118\nX-RateLimit-Reset: 1759240842\nRetry-After: 42`,
                    'ratelimit-copy',
                    'Rate Limit Headers'
                  )
                }
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'ratelimit-copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Headers</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1759240842
Retry-After: 42`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ERROR CODES & HANDLING ── */}
      <section id="error-handling" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <AlertTriangle className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            4. Error Codes & Standard Faults
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          When an error occurs, ENAKO OS returns machine-readable JSON bodies in compliance with RFC 7807 (Problem Details for HTTP APIs). Rather than guessing failure causes, developers can inspect the machine code field and provide granular remediation inside client code.
        </p>

        {/* Status Codes Table (Clean Typography, No Card) */}
        <div className="pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">HTTP Status Code Reference:</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-emerald-700 w-16 shrink-0">200 / 201</span>
              <span className="text-slate-600">Success. Request evaluated and recorded on the cloud ledger.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-amber-700 w-16 shrink-0">400</span>
              <span className="text-slate-600">Bad Request. Required payload keys are missing or malformed.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-rose-700 w-16 shrink-0">401</span>
              <span className="text-slate-600">Unauthorized. Bearer token missing, invalid signature, or expired.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-rose-700 w-16 shrink-0">403</span>
              <span className="text-slate-600">Forbidden. Authenticated role lacks clearance for target resource.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-slate-700 w-16 shrink-0">404</span>
              <span className="text-slate-600">Not Found. Identifier does not exist in company workspace.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-amber-700 w-16 shrink-0">409</span>
              <span className="text-slate-600">Conflict. Duplicate reference key or idempotency violation.</span>
            </div>
            <div className="flex items-start gap-3 py-1 border-b border-slate-100">
              <span className="font-mono font-bold text-purple-700 w-16 shrink-0">429</span>
              <span className="text-slate-600">Rate Limit Exceeded. Quota exhausted; consult Retry-After header.</span>
            </div>
            <div className="flex items-start gap-3 py-1">
              <span className="font-mono font-bold text-rose-800 w-16 shrink-0">500</span>
              <span className="text-slate-600">Internal Gateway Error. Core database failure; telemetry incident triggered.</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => copyToClipboard(errorJsonSample, 'err-schema-copy', 'Error Schema')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'err-schema-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Standard RFC 7807 Error JSON
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Standard Error Payload (JSON)</span>
              <button
                onClick={() => copyToClipboard(errorJsonSample, 'err-code-box', 'Error JSON')}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'err-code-box' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {errorJsonSample}
            </pre>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: WEBHOOKS & EVENTS ── */}
      <section id="webhooks" className="scroll-mt-8 space-y-4 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Radio className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            5. Webhooks & Event Delivery
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Webhooks allow external applications and third-party accounting software to receive asynchronous push notifications in near real-time whenever core state changes happen within ENAKO OS.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          Every webhook delivery includes an <code className="text-xs font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">X-Enako-Signature</code> header. This is a hexadecimal HMAC-SHA256 signature generated over the raw request payload using your secret webhook signing key.
        </p>

        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 leading-relaxed">
          <li><code className="text-xs font-mono font-bold text-slate-800">transaction.completed</code>: Ledger entry settled with currency exchange finalized.</li>
          <li><code className="text-xs font-mono font-bold text-slate-800">kyc.submitted</code>: Applicant documents uploaded and pending compliance review.</li>
          <li><code className="text-xs font-mono font-bold text-slate-800">kyc.reviewed</code>: Compliance verdict reached (<code className="text-xs font-mono text-emerald-700">APPROVED</code> or <code className="text-xs font-mono text-rose-700">REJECTED</code>).</li>
          <li><code className="text-xs font-mono font-bold text-slate-800">cash_batch.sealed</code>: Physical cash collection envelope audited and deposited into the main vault.</li>
        </ul>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={handleSimulateWebhook}
            disabled={webhookSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold hover:bg-[#001740] transition-colors shadow-2xs cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            {webhookSimulating ? 'Sending Webhook Ping...' : 'Send Test Webhook Ping'}
          </button>

          <button
            onClick={() => copyToClipboard(webhookVerifySample, 'webhook-sample-copy', 'Verification Snippet')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'webhook-sample-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Node.js Verification Code
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Webhook Signature Verification (Node.js Express)</span>
              <button
                onClick={() => copyToClipboard(webhookVerifySample, 'webhook-code-box', 'Verification Code')}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'webhook-code-box' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {webhookVerifySample}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
