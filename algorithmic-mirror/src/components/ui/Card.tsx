import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Si el card puede colapsar al hacer click */
  span?: 'full' | 'half' | 'third';
}

const spanMap = {
  full: 'md:col-span-2 lg:col-span-3',
  half: 'lg:col-span-1',
  third: '',
};

export function Card({ children, className = '', span }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`bg-darkCard border border-gray-800/60 rounded-2xl p-4 md:p-6 relative overflow-hidden ${span ? spanMap[span] : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Encabezado estándar para tarjetas */
export function CardHeader({ icon, title, color = 'text-spotify' }: { icon: ReactNode; title: string; color?: string }) {
  return (
    <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${color}`}>
      {icon}
      <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
    </div>
  );
}

/** Dato grande con label */
export function BigStat({ value, label, color = 'text-white' }: { value: string | number; label: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/** Mini stat en fila */
export function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

/** Barra de progreso con label */
export function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

/** Tag de inferencia / etiqueta */
export function Tag({ text }: { text: string }) {
  return (
    <span className="px-3 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-full text-sm text-gray-300 hover:border-spotify hover:text-spotify transition-colors cursor-default">
      {text}
    </span>
  );
}

/** Indicador de sección vacía */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-gray-600 text-sm">
      <p>{message}</p>
    </div>
  );
}
