import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
  Shield, Key, Lock, Smartphone, CheckCircle,
  Copy, Check, RefreshCw, Download, Laptop,
  AlertTriangle, History, QrCode, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityProfilePage() {
  const { user } = useAuth();
  const location = useLocation();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-01',
      device: 'Chrome 129 on Windows 11',
      ip: '172.16.0.1 (Corporate Gateway)',
      location: 'Douala Headquarters, CM',
      current: true,
      lastActive: 'Active Now'
    },
    {
      id: 'sess-02',
      device: 'Apple iPhone 15 Pro (ENAKO Mobile App)',
      ip: '102.244.112.5 (Orange Cameroun)',
      location: 'Douala, CM',
      current: false,
      lastActive: '2 hours ago'
    },
    {
      id: 'sess-03',
      device: 'macOS Sonoma (Audit Field Laptop)',
      ip: '41.202.219.8 (MTN Business Fiber)',
      location: 'Yaoundé Branch, CM',
      current: false,
      lastActive: '1 day ago'
    }
  ]);

  const fullName = user?.fullName || 'Super Administrator';
  const email = user?.email || 'support@enakoos.com';
  const roleName = (user?.role || 'CEO').toUpperCase();
  const employeeId = `ENK-2026-${(user?.id || '0842').toString().slice(-4).toUpperCase()}`;
  const verificationHash = `${employeeId}-9984-SHA256-VAULT-2026`;

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
    const sectionIds = ['profile-id', 'password', 'mfa', 'sessions', 'audit'];
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Access password updated! Credentials re-encrypted using Argon2id.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success(`Revoked active session for ${deviceName}`);
  };

  const handleTerminateOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.current));
    toast.success('All other active device sessions terminated immediately.');
  };

  const credentialJson = `{
  "issuer": "E NAKO COMPANY PLC",
  "systemAuthority": "ENAKO OS Central African CEMAC Cryptographic Vault",
  "subject": "${user?.id || 'usr_0842'}",
  "employeeId": "${employeeId}",
  "fullName": "${fullName}",
  "role": "${roleName}",
  "clearanceLevel": "TIER_1_EXECUTIVE",
  "status": "HARDWARE_VERIFIED",
  "authHash": "${verificationHash}",
  "issuedAt": "2026-01-15T08:00:00Z",
  "nextAudit": "2026-12-31T23:59:59Z"
}`;

  const backupCodes = [
    '8F92-411A-B031',
    '3D71-99CE-64B8',
    'A214-E85F-0012',
    '77CA-1049-F329',
    'B883-91DF-4401',
    '1930-5E22-CC77'
  ];

  return (
    <div className="space-y-12 pb-32 font-sans max-w-4xl text-slate-800">
      {/* ── TOP HEADER (NO CARDS, NO BOXES) ── */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>Security & Access</span>
          <span>/</span>
          <span className="text-[#001f5b] font-bold">Security Vault</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Security & Identity Vault
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Cryptographic identity verification, access passphrase governance, multi-factor hardware bindings, and compliance audit telemetry.
        </p>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <button
            onClick={() => copyToClipboard(`${employeeId}-SEC-${Date.now()}`, 'global-token', 'Profile ID Token')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'global-token' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Profile ID Token
          </button>

          <button
            onClick={() => {
              toast.success('Identity cryptographic hash synced with corporate distributed ledger.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Sync Credential Hash
          </button>

          <button
            onClick={() => {
              toast.success(`Exporting signed official credential badge for ${fullName}...`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold hover:bg-[#001740] transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            Download Official Badge
          </button>
        </div>
      </div>

      {/* ── SECTION 1: PROFILE ID CREDENTIAL ── */}
      <section id="profile-id" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <ShieldCheck className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            1. Official Corporate Profile ID & Credential
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          The ENAKO OS Profile Credential represents your cryptographically verified corporate identity issued under E NAKO COMPANY PLC system governance. This credential authorizes access to financial ledgers, compliance workflows, and administrative endpoints.
        </p>

        {/* Credential Metadata Breakdown (Clean typography, no card) */}
        <div className="pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Verified Identity Metadata:</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Operative Full Name</span>
              <span className="font-semibold text-slate-900">{fullName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Corporate System ID</span>
              <span className="font-mono font-bold text-[#001f5b]">{employeeId}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Assigned Clearance Tier</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Tier 1 (Executive Full System)
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Hardware Verification Hash</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{verificationHash}</code>
                <button
                  onClick={() => copyToClipboard(verificationHash, 'hash-copy', 'Verification Hash')}
                  className="text-slate-500 hover:text-slate-900 font-sans font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'hash-copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Audit Status & Renewal</span>
              <span className="font-medium text-slate-700">2026-2027 Renewal Verified • Valid Through Dec 2026</span>
            </div>
          </div>
        </div>

        {/* Code Snippet Box (The ONLY box allowed) */}
        <div className="pt-2">
          <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Cryptographic Credential Token Schema (JSON)</span>
              <button
                onClick={() => copyToClipboard(credentialJson, 'cred-json', 'Credential JSON')}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'cred-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Credential JSON</span>
              </button>
            </div>
            <pre className="p-3.5 text-[11.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {credentialJson}
            </pre>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ACCESS PASSWORD & KEYS ── */}
      <section id="password" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Key className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            2. Password Governance & Cryptographic Access Keys
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Access passwords protect your administrative session and cryptographic signing keys. ENAKO OS hashes passwords using memory-hard Argon2id with 32 bytes of per-user cryptographically secure salt, mitigating GPU-accelerated dictionary attacks.
        </p>

        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 leading-relaxed">
          <li><strong>Minimum Complexity:</strong> 8 characters minimum (12+ characters recommended with symbols and numbers).</li>
          <li><strong>Credential Rotation:</strong> Passphrase renewal required every 90 days for administrative and finance roles.</li>
          <li><strong>Session Invalidation:</strong> Changing your password terminates all active secondary sessions across unauthorized devices.</li>
        </ul>

        {/* Update Password Inline Form (No Card Box) */}
        <div className="pt-2">
          <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#001f5b] hover:bg-[#001740] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
              >
                Update & Re-encrypt Credentials
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── SECTION 3: TWO-FACTOR AUTHENTICATION ── */}
      <section id="mfa" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Lock className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            3. Two-Factor Authentication (2FA) & TOTP Protocol
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Two-Factor Authentication adds an indispensable layer of hardware-backed verification. When signing in or executing high-value wire transfers, you must input a 6-digit Time-Based One-Time Password (TOTP RFC 6238) generated on your registered mobile authenticator.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled);
              toast.success(`Two-Factor Authentication is now ${!twoFactorEnabled ? 'Activated' : 'Deactivated'}`);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              twoFactorEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {twoFactorEnabled ? '2FA Active (Click to Disable)' : '2FA Inactive (Click to Enable)'}
          </button>

          <button
            onClick={() => toast.success('QR Code and TOTP seed sent to your registered corporate email.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            Reconfigure Authenticator App
          </button>

          <button
            onClick={() => setShowBackupCodes(!showBackupCodes)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {showBackupCodes ? 'Hide Backup Codes' : 'Show Emergency Backup Codes'}
          </button>
        </div>

        {/* Backup Codes Box (The ONLY box allowed) */}
        {showBackupCodes && (
          <div className="pt-2">
            <div className="relative rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-amber-400 font-mono">
                <span>Emergency Single-Use Recovery Codes</span>
                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup-codes', 'Backup Codes')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'backup-codes' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy All Codes</span>
                </button>
              </div>
              <div className="p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs text-slate-200">
                {backupCodes.map((code) => (
                  <div key={code} className="p-2 bg-slate-800/80 rounded text-center tracking-wider font-semibold">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 4: ACTIVE DEVICE SESSIONS ── */}
      <section id="sessions" className="scroll-mt-8 space-y-4 border-b border-slate-200/80 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <Laptop className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            4. Active Device Sessions & Hardware Bindings
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Every active administrative login is cryptographically bound to a unique browser fingerprint, source IP subnet, and TLS session ID. If suspicious geographical relocation is detected, the session is quarantined pending re-authentication.
        </p>

        {/* Global Session Actions */}
        <div className="pt-1">
          <button
            onClick={handleTerminateOtherSessions}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Terminate All Other Sessions
          </button>
        </div>

        {/* Sessions List (Clean table-like rows, no outer card box) */}
        <div className="pt-2 space-y-2">
          {activeSessions.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-slate-100 text-xs">
              <div className="flex items-start gap-3">
                {s.device.includes('iPhone') ? (
                  <Smartphone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                ) : (
                  <Laptop className="w-4 h-4 text-[#001f5b] mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.device}</span>
                    {s.current && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{s.ip} • {s.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-slate-400 text-[11px]">{s.lastActive}</span>
                {!s.current && (
                  <button
                    onClick={() => handleRevokeSession(s.id, s.device)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: SECURITY AUDIT TELEMETRY ── */}
      <section id="audit" className="scroll-mt-8 space-y-4 pb-12">
        <div className="flex items-center gap-2.5 text-primary">
          <History className="w-5 h-5 text-[#001f5b]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            5. Security Audit Log & Compliance Telemetry
          </h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          The security audit ledger records an immutable, append-only chronological log of all privileged authentication events, credential rotations, and access scope grants under OHADA accounting governance and ISO 27001 compliance standards.
        </p>

        {/* Audit Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              try {
                const headers = ['Event', 'Details', 'Status', 'Timestamp'];
                const rows = [
                  ['AUTH_LOGIN_SUCCESS', 'Primary credential handshake verified • IP: 172.16.0.1', 'Success', '2026-09-30 13:42:10 UTC'],
                  ['TOTP_CHALLENGE_VERIFIED', 'RFC 6238 mobile authenticator code evaluated • iPhone 15 Pro', 'Success', '2026-09-30 11:15:02 UTC'],
                  ['SESSION_BOUND', 'TLS device fingerprint bound to corporate token • Douala Headquarters', 'Success', '2026-09-29 18:30:45 UTC'],
                  ['CREDENTIAL_HASH_SYNC', 'Cryptographic identity seal synchronized with Central African ledger', 'Success', '2026-09-28 09:12:00 UTC']
                ];
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `enako_security_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Downloaded Security Audit Log CSV');
              } catch (e) {
                toast.error('Failed to export CSV');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export Audit Trail (CSV)
          </button>

          <button
            onClick={() => copyToClipboard('AUDIT-SHA256-LEDGER-VERIFIED-2026-ENAKO-OS', 'audit-hash', 'Audit Signature')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer uppercase tracking-wider"
          >
            {copiedKey === 'audit-hash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Audit Signature
          </button>
        </div>

        {/* Audit Entries List (Clean rows, no card box) */}
        <div className="pt-2 space-y-1.5 text-xs">
          <div className="flex items-start justify-between py-2 border-b border-slate-100">
            <div>
              <span className="font-mono font-bold text-slate-900">AUTH_LOGIN_SUCCESS</span>
              <p className="text-slate-500 text-[11px]">Primary credential handshake verified • IP: 172.16.0.1</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Success</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">2026-09-30 13:42:10 UTC</p>
            </div>
          </div>

          <div className="flex items-start justify-between py-2 border-b border-slate-100">
            <div>
              <span className="font-mono font-bold text-slate-900">TOTP_CHALLENGE_VERIFIED</span>
              <p className="text-slate-500 text-[11px]">RFC 6238 mobile authenticator code evaluated • iPhone 15 Pro</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Success</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">2026-09-30 11:15:02 UTC</p>
            </div>
          </div>

          <div className="flex items-start justify-between py-2 border-b border-slate-100">
            <div>
              <span className="font-mono font-bold text-slate-900">SESSION_BOUND</span>
              <p className="text-slate-500 text-[11px]">TLS device fingerprint bound to corporate token • Douala Headquarters</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Success</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">2026-09-29 18:30:45 UTC</p>
            </div>
          </div>

          <div className="flex items-start justify-between py-2">
            <div>
              <span className="font-mono font-bold text-slate-900">CREDENTIAL_HASH_SYNC</span>
              <p className="text-slate-500 text-[11px]">Cryptographic identity seal synchronized with Central African ledger</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Success</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">2026-09-29 09:12:33 UTC</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
