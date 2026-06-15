import { FileJson, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ApiDocs() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">API Documentation</h1>
          <p className="text-secondary mt-1">Integrate ENAKO OS with your enterprise applications.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-outline-variant/30 rounded-2xl p-12 text-center shadow-sm">
        <FileJson className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
        <h2 className="text-xl font-bold text-primary mb-2">Documentation is being updated</h2>
        <p className="text-secondary max-w-md mx-auto mb-8">
          We are currently revamping our API Developer Portal to include new endpoints for v2.0. Please check back later or contact your account manager for raw Swagger definitions.
        </p>
        <button className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 mx-auto">
          Contact Support <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
