import { useState } from 'react';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { BookOpen, Search, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');

  const articles = [
    { category: 'Financial Operations', title: 'Daily Cash Batch Audit & Vault Balancing Procedure', time: '5 min read', desc: 'Standard operating guidelines for physical cash balancing, envelope sealing, and dual-custody verification.' },
    { category: 'Compliance & KYC', title: 'Cameroon ANIF & CEMAC Tier-1 Verification Guidelines', time: '8 min read', desc: 'Regulatory requirements for validating National CNI cards, passports, and utility bills for merchant accounts.' },
    { category: 'Engineering & Gateways', title: 'MTN Mobile Money & Orange Money Webhook Recovery', time: '6 min read', desc: 'Step-by-step instructions for manual callback replay and API transaction status resolution.' },
    { category: 'Human Resources', title: 'Staff Welfare Lunch Subsidy Policy & Claims Submission', time: '4 min read', desc: 'Rules governing the 50% company meal subsidy, daily order cut-off times, and expense reimbursement.' },
    { category: 'Executive Governance', title: 'Emergency Escalation & Incident Response Hierarchy', time: '7 min read', desc: 'Chain of command and notification protocols for CEO, Executive Managers, and Engineering on-call.' },
    { category: 'Client Support', title: 'Support Ticket SLA Matrix & Client Communication Standards', time: '5 min read', desc: 'Mandatory resolution timeframes and standardized corporate messaging for support@enakoos.com.' },
  ];

  const filtered = articles.filter(a =>
    (a.title || a.desc || a.category).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Resources & System • Knowledge Base & Standard Operating Procedures (SOP)" />

      <WorkplaceStatCards
        domainsCount={articles.length}
        usersCount="6 Core Modules"
        groupsCount="CEMAC / COBAC"
        licensesCount="Q3 2026 Audit"
        card1Label="PUBLISHED SOP ARTICLES"
        card2Label="DEPARTMENT COVERAGE"
        card3Label="COMPLIANCE STANDARD"
        card4Label="LATEST REVISION"
        card1Icon={<BookOpen className="w-5 h-5" />}
        card2Icon={<FileText className="w-5 h-5" />}
        card3Icon={<ShieldCheck className="w-5 h-5" />}
        card4Icon={<BookOpen className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search standard operating procedures, guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
          />
        </div>

        <p className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{filtered.length}</strong> operational SOP guides
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#001f5b]/10 text-[#001f5b] inline-block mb-2">
                {item.category}
              </span>
              <h4 className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span>{item.time}</span>
              <span className="flex items-center gap-1 text-[#001f5b] font-semibold hover:underline cursor-pointer">
                Read SOP <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
