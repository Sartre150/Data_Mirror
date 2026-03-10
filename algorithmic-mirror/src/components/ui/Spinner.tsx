import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Spinner({ text = 'Procesando...' }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <Loader2 className="w-8 h-8 text-spotify animate-spin" />
      <p className="text-sm text-gray-400">{text}</p>
    </motion.div>
  );
}
