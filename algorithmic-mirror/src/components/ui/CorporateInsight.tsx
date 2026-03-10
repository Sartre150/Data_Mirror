import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert } from 'lucide-react';

export function CorporateInsight({ title, description }: { title: string, description: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-gray-800/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-red-400 transition-colors w-full"
      >
        <Eye size={14} className={isOpen ? "text-red-400" : ""} />
        {isOpen ? "Ocultar perspectiva corporativa" : "¿Por qué Spotify rastrea esto?"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
              <div className="flex items-start gap-2 text-red-400 mb-1">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
              </div>
              <p className="text-xs text-red-200/70 leading-relaxed pl-6">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}