import { motion } from 'framer-motion';
import { Globe, PenTool, FileText, Users } from 'lucide-react';

export default function OutreachOverview() {
  const stats = [
    { label: 'Active Events', value: '4', icon: Globe },
    { label: 'Pending Applications', value: '18', icon: FileText },
    { label: 'Blog Posts', value: '24', icon: PenTool },
    { label: 'Newsletter Subscribers', value: '1,204', icon: Users },
  ];

  return (
    <div className="space-y-8 pb-20 p-6">
      <h2 className="text-2xl font-bold font-display text-primary">Outreach Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-surface-container rounded-lg shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
