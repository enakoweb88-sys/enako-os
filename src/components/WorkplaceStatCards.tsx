import React from 'react';
import { Globe, Users, Layers, CreditCard } from 'lucide-react';

interface WorkplaceStatCardsProps {
  domainsCount?: number | string;
  usersCount?: number | string;
  groupsCount?: number | string;
  licensesCount?: number | string;
  card1Label?: string;
  card2Label?: string;
  card3Label?: string;
  card4Label?: string;
  card1Icon?: React.ReactNode;
  card2Icon?: React.ReactNode;
  card3Icon?: React.ReactNode;
  card4Icon?: React.ReactNode;
}

export function WorkplaceStatCards({
  domainsCount = 1,
  usersCount = 1,
  groupsCount = 1,
  licensesCount = 2,
  card1Label = 'DOMAINS',
  card2Label = 'ORGANIZATION USERS',
  card3Label = 'GROUPS',
  card4Label = 'TOTAL LICENSES',
  card1Icon,
  card2Icon,
  card3Icon,
  card4Icon,
}: WorkplaceStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* Card 1: Red Bottom Accent */}
      <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
          {card1Icon || <Globe className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">{card1Label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{domainsCount}</p>
        </div>
      </div>

      {/* Card 2: Green Bottom Accent */}
      <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
          {card2Icon || <Users className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">{card2Label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{usersCount}</p>
        </div>
      </div>

      {/* Card 3: Oxford Navy #001f5b Bottom Accent */}
      <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#001f5b]/10 flex items-center justify-center text-[#001f5b] shrink-0">
          {card3Icon || <Layers className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">{card3Label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{groupsCount}</p>
        </div>
      </div>

      {/* Card 4: Amber Bottom Accent */}
      <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
          {card4Icon || <CreditCard className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">{card4Label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{licensesCount}</p>
        </div>
      </div>
    </div>
  );
}
