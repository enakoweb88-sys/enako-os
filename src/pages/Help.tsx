import { LifeBuoy, Book, MessageCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function Help() {
  const options = [
    { icon: Book, title: 'Knowledge Base', desc: 'Browse our comprehensive guides and tutorials.' },
    { icon: MessageCircle, title: 'Live Chat Support', desc: 'Speak with our customer success team in real-time.' },
    { icon: FileText, title: 'Submit a Ticket', desc: 'Create a support ticket for technical issues.' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Help & Support Center</h1>
          <p className="text-secondary mt-1">How can we assist you today?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-outline-variant/30 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <opt.icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors mx-auto mb-4" />
            <h3 className="font-bold text-primary mb-2">{opt.title}</h3>
            <p className="text-xs text-secondary mb-6">{opt.desc}</p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors">
              Access &rarr;
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
