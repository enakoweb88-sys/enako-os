import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPreferencesPage() {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('XAF');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account workspace preferences saved successfully!');
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Top Header & Breadcrumb (No heavy cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Settings</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Workspace Preferences & Configurations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system language, primary ledger currency, and operational communication policies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Localization & Currency Customization</h3>
          <p className="text-xs text-slate-500 mt-0.5">Configure your executive interface language, default currency, and alert channels.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Default Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] font-medium"
            >
              <option value="en">English (Default)</option>
              <option value="fr">Français (French)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Primary Accounting Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] font-medium"
            >
              <option value="XAF">Central African CFA Franc (XAF)</option>
              <option value="USD">United States Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Communication Policies</h4>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-[#001f5b] focus:ring-[#001f5b]"
              />
              <span>Send high-priority daily ledger summaries and compliance alerts to corporate email</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded border-slate-300 text-[#001f5b] focus:ring-[#001f5b]"
              />
              <span>Send urgent SMS notifications for cash drop pickups and teller audits</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded border-slate-300 text-[#001f5b] focus:ring-[#001f5b]"
              />
              <span>Enable audio notifications for incoming client chat inquiries</span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
