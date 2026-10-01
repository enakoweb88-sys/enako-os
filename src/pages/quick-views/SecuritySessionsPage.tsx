import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop, Smartphone, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySessionsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

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
            <span className="text-[#001f5b] font-bold">2FA & Active Sessions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Authentication & Device Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-factor verification enforcement, hardware tokens, and live device connection audit.
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
            to="/app/security/badge"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Profile Badge
          </Link>
          <Link
            to="/app/security/audit"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Audit Logs
          </Link>
        </div>
      </div>

      {/* 2FA Enforce Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Two-Factor Authentication (2FA) Protocol
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Requires a one-time verification code from your authenticator app on all new logins and sensitive transactions.
            </p>
          </div>

          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled);
              toast.success(`Two-Factor Authentication has been ${!twoFactorEnabled ? 'activated' : 'deactivated'}.`);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              twoFactorEnabled
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {twoFactorEnabled ? '2FA Active' : '2FA Inactive'}
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900">Enforcement Tier: Hardware & TOTP Token</p>
              <p className="text-slate-500 text-[11px]">Last verified: 12 minutes ago from current browser</p>
            </div>
          </div>
          <button
            onClick={() => toast.success('QR Code sent to corporate email.')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
          >
            Reconfigure Authenticator
          </button>
        </div>
      </div>

      {/* Active Device Sessions List */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Connected Device Sessions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review browsers, mobile phones, and terminal clients currently authenticated with your identity.
            </p>
          </div>

          <button
            onClick={() => toast.success('Revoked all remote sessions. All other devices signed out.')}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            Terminate All Other Sessions
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#001f5b]/10 text-[#001f5b]">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Google Chrome on Windows 11</p>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    Current Device
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">IP: 172.16.0.1 • Douala Headquarters, Cameroon</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Session Token: SHA256-CLX-8821092 • Active Now</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Online</span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">ENAKO OS Mobile App • Apple iPhone 15 Pro</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">IP: 197.234.221.84 • Douala, CM (Mobile 4G)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Last active: 2 hours ago</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Revoked session for Apple iPhone 15 Pro.')}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:text-rose-700 hover:border-rose-200 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Revoke Session
            </button>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Mozilla Firefox on macOS Sonoma</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">IP: 154.72.164.12 • Yaounde Regional Hub, CM</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Last active: Yesterday at 18:42</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Revoked session for macOS Sonoma.')}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:text-rose-700 hover:border-rose-200 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Revoke Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
