import { ShieldCheck } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

export function Navbar() {
  const isLoaded = useDataStore((s) => s.isLoaded);
  const reset = useDataStore((s) => s.reset);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-spotify-dark/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-spotify font-bold text-lg tracking-tight">
            Algorithmic Mirror
          </span>
          <ShieldCheck className="w-4 h-4 text-spotify opacity-70" />
        </div>

        {isLoaded && (
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500"
          >
            Cargar otros datos
          </button>
        )}
      </div>
    </nav>
  );
}
