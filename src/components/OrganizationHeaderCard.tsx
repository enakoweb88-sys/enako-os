import React from 'react';
import { Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationHeaderCardProps {
  subtitle?: string;
  planName?: string;
  adminEmail?: string;
  renewalDate?: string;
  subscriptionDuration?: string;
}

export function OrganizationHeaderCard({
  subtitle = 'www.enakoos.com',
  planName = 'Workplace Standard',
  adminEmail = 'support@enakoos.com',
  renewalDate = '28/10/2026',
  subscriptionDuration = 'Monthly',
}: OrganizationHeaderCardProps) {
  return (
    <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-sans">
      {/* Left: Organization Brand & Web Address */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-14 h-14 rounded-lg border border-slate-200/90 p-1 flex items-center justify-center bg-white shadow-2xs shrink-0">
          <img src="/logo.png" alt="ENAKO Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
            E NAKO COMPANY PLC
          </h2>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Middle: 2 Metadata Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 max-w-xl">
        <div>
          <p className="text-xs text-slate-500 font-normal">Super Administrator Email Address</p>
          <p className="text-xs font-bold text-slate-800">{adminEmail}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-normal">Plan</p>
          <p className="text-xs font-bold text-[#001f5b]">{planName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-normal">Subscription Duration</p>
          <p className="text-xs font-bold text-slate-800">{subscriptionDuration}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-normal">Renewal Date</p>
          <p className="text-xs font-bold text-slate-800">{renewalDate}</p>
        </div>
      </div>

      {/* Right: Quick Action Pencil */}
      <button
        onClick={() => toast.success('Organization configuration is active')}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
        title="Edit Details"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
}

