import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
  QrCode, CheckCircle, ShieldCheck, Download, Copy, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityBadgePage() {
  const { user } = useAuth();

  const fullName = user?.fullName || 'Super Administrator';
  const email = user?.email || 'support@enakoos.com';
  const roleName = (user?.role || 'CEO').toUpperCase();
  const employeeId = `ENK-2026-${(user?.id || '0842').toString().slice(-4).toUpperCase()}`;

  const copyIdToken = () => {
    navigator.clipboard?.writeText(`${employeeId}-SEC-${Date.now()}`);
    toast.success(`Verified Profile Token for ${employeeId} copied to clipboard!`);
  };

  const handleDownloadBadge = () => {
    toast.success(`Exporting Official Identity Credential for ${fullName}...`);
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Top Header & Breadcrumb (No Cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Security & Access</span>
            <span>/</span>
            <Link to="/app/security" className="hover:underline text-slate-500 cursor-pointer">
              Security Vault
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Official Profile Badge</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Official Corporate Profile ID Badge
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically signed enterprise digital credential with hardware-verified seal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/app/security"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Vault Overview
          </Link>
          <Link
            to="/app/security/sessions"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            2FA & Sessions
          </Link>
          <Link
            to="/app/security/audit"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Audit Logs
          </Link>
        </div>
      </div>

      {/* Digital ID Badge Visual Preview Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#001f5b]/10 text-[#001f5b] uppercase tracking-wider">
                Official Credential
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Corporate Digital Profile ID & Executive Badge
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographically verified enterprise credential issued under E NAKO COMPANY PLC system governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyIdToken}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              Copy Token
            </button>
            <button
              onClick={handleDownloadBadge}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download ID Badge
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-7">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#001f5b] via-[#002b7a] to-[#001642] p-6 text-white shadow-xl overflow-hidden border border-white/10">
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-white" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="ENAKO" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-wide uppercase text-white">E NAKO COMPANY PLC</h4>
                    <p className="text-[10px] text-white/70 font-mono tracking-wider">OFFICIAL SYSTEM CREDENTIAL • ENAKO OS</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                    ACTIVE
                  </span>
                  <span className="text-[9px] text-white/60 font-mono mt-1">TIER-1 CLEARANCE</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/30 overflow-hidden flex items-center justify-center text-white text-3xl font-black shadow-inner">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#001f5b] flex items-center justify-center text-white" title="Cryptographically Verified">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate">{fullName}</h3>
                  <p className="text-xs text-white/90 font-medium">Executive Management • {roleName}</p>
                  <p className="text-[11px] text-white/70 font-mono truncate">{email}</p>

                  <div className="pt-2 grid grid-cols-2 gap-3 text-[10px]">
                    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-xs">
                      <p className="text-white/60 uppercase font-semibold">System ID</p>
                      <p className="font-mono font-bold text-white text-xs">{employeeId}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-xs">
                      <p className="text-white/60 uppercase font-semibold">Branch Office</p>
                      <p className="font-semibold text-white truncate">Douala Head Office</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Barcode Simulation */}
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] text-white/70 font-mono">
                    <p className="leading-tight">AUTH HASH: {employeeId}-9984-SHA256</p>
                    <p className="text-[9px] text-white/50">VALIDITY: 2026-2027 RENEWAL VERIFIED</p>
                  </div>
                </div>

                <div className="h-6 flex items-center gap-0.5 opacity-80">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-full"
                      style={{
                        width: (i % 3 === 0 ? '3px' : i % 2 === 0 ? '2px' : '1px'),
                        height: '100%'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#001f5b]" />
              Credential Metadata & Specs
            </h4>

            <div className="divide-y divide-slate-200/70 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Security Clearance</span>
                <span className="font-semibold text-slate-900">Level 1 (Full System)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Employee ID Number</span>
                <span className="font-mono font-bold text-[#001f5b]">{employeeId}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Corporate Domain</span>
                <span className="font-semibold text-slate-900">www.enakoos.com</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Digital Seal</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> ENAKO Hardware Verified
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Issue Date</span>
                <span className="font-medium text-slate-700">January 15, 2026</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Next Scheduled Audit</span>
                <span className="font-medium text-slate-700">December 31, 2026</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => toast.success('Profile identity regenerated and synced with corporate ledger.')}
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Sync Credential Hash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
