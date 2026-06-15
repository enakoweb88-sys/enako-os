import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Phone, Mail, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.leads();
      setLeads(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Sales Pipeline & Leads</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage your BD conversions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("New lead modal opened")} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors">
            Add Lead
          </button>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Client Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Company</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-secondary/50" />
                        <div>
                          <p className="text-sm font-bold text-primary">{lead.name}</p>
                          <p className="text-[10px] text-secondary mt-0.5">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-primary">{lead.company}</td>
                    <td className="px-4 py-4 text-sm font-mono text-green-600 font-bold">XAF {Number(lead.value).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider bg-surface-container-high text-secondary">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toast.success(`Calling ${lead.phone}...`)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Call">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button onClick={() => toast.success(`Drafting email to ${lead.email}...`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Email">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
