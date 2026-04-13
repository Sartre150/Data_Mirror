import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { useEffect, useState, useRef, useCallback, Fragment } from 'react';
import { Download } from 'lucide-react';

/** Hook to detect mobile viewport */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// ==========================================
// Gráfica de barras horizontales (Top artistas / canciones)
// ==========================================
interface HBarProps {
  data: { name: string; value: number }[];
  color?: string;
  unit?: string;
}

export function HorizontalBarChart({ data, color = '#1DB954', unit = 'h' }: HBarProps) {
  const mobile = useIsMobile();
  const barH = mobile ? 30 : 36;
  const yWidth = mobile ? 80 : 120;
  const fontSize = mobile ? 10 : 12;
  return (
    <ResponsiveContainer width="100%" height={data.length * barH + 20}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={yWidth} tick={{ fill: '#9ca3af', fontSize }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #333', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#d1d5db' }}
          formatter={(v) => [`${v}${unit}`, '']}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? color : `${color}${Math.max(30, 90 - i * 8).toString(16)}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// Gráfica de actividad por hora (Heatmap-style bar)
// ==========================================
interface HourProps {
  data: { hour: number; minutes: number }[];
}

export function HourlyChart({ data }: HourProps) {
  const max = Math.max(...data.map((d) => d.minutes), 1);
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ left: 0, right: 0 }}>
        <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={(h: number) => h % 3 === 0 ? `${h}h` : ''} />
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #333', borderRadius: 8 }}
          itemStyle={{ color: '#d1d5db' }}
          formatter={(v) => [`${Math.round(Number(v) / 60)}h`, 'Escucha total']}
          labelFormatter={(h) => `${h}:00`}
        />
        <Bar dataKey="minutes" radius={[3, 3, 0, 0]} maxBarSize={14}>
          {data.map((d, i) => {
            const intensity = d.minutes / max;
            const r = Math.round(29 + intensity * (29 - 29));
            const g = Math.round(185 + intensity * (185 - 100));
            const b = Math.round(84 + intensity * (84 - 40));
            return <Cell key={i} fill={`rgb(${r},${g},${b})`} opacity={0.3 + intensity * 0.7} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// Radar de día de la semana
// ==========================================
interface DayProps {
  data: { day: string; hours: number }[];
}

export function WeekRadar({ data }: DayProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} cx="50%" cy="50%">
        <PolarGrid stroke="#333" />
        <PolarAngleAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #333', borderRadius: 8 }}
          itemStyle={{ color: '#1DB954', fontWeight: 'bold' }}
          formatter={(v) => [`${v} horas`, 'Tiempo total']}
        />
        <Radar dataKey="hours" fill="#1DB954" fillOpacity={0.25} stroke="#1DB954" strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// Área de escucha por mes
// ==========================================
interface MonthProps {
  data: { month: string; hours: number }[];
}

export function MonthlyArea({ data }: MonthProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
        <defs>
          <linearGradient id="spotifyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #333', borderRadius: 8 }}
          itemStyle={{ color: '#d1d5db' }}
          formatter={(v) => [`${v}h`, 'Escucha']}
        />
        <Area type="monotone" dataKey="hours" stroke="#1DB954" fill="url(#spotifyGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// Heatmap genérico (CSS Grid)
// ==========================================
interface HeatmapProps {
  rowLabels: string[];
  colLabels: string[];
  matrix: number[][];
  colorScale?: 'green' | 'red' | 'blue';
}

export function HeatmapGrid({ rowLabels, colLabels, matrix, colorScale = 'green' }: HeatmapProps) {
  const max = Math.max(...matrix.flat(), 1);
  const totalCells = rowLabels.length * colLabels.length;
  const showNumbers = totalCells <= 168 && max <= 200;

  const getColor = (value: number) => {
    if (value === 0) return 'rgba(255,255,255,0.03)';
    const t = value / max;
    if (colorScale === 'green') return `rgba(29, 185, 84, ${t * 0.85 + 0.1})`;
    if (colorScale === 'red') return `rgba(239, 68, 68, ${t * 0.85 + 0.1})`;
    return `rgba(59, 130, 246, ${t * 0.85 + 0.1})`;
  };

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-[1px]"
        style={{ gridTemplateColumns: `minmax(60px, auto) repeat(${colLabels.length}, minmax(20px, 1fr))` }}
      >
        {/* Header */}
        <div />
        {colLabels.map((l, i) => (
          <div key={i} className="text-[9px] text-gray-500 text-center pb-1 select-none">{l}</div>
        ))}
        {/* Rows */}
        {rowLabels.map((rowLabel, ri) => (
          <Fragment key={ri}>
            <div className="text-[10px] text-gray-400 pr-2 flex items-center justify-end truncate max-w-[120px] select-none">
              {rowLabel}
            </div>
            {matrix[ri].map((v, ci) => (
              <div
                key={ci}
                className="aspect-square rounded-sm flex items-center justify-center cursor-default transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: getColor(v), minWidth: 20, minHeight: 20 }}
                title={`${rowLabel} × ${colLabels[ci]}: ${v}`}
              >
                {showNumbers && v > 0 && (
                  <span className="text-[7px] text-white/80 font-mono leading-none">{v}</span>
                )}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Evolución de artistas por mes (Multi-line)
// ==========================================
const LINE_COLORS = ['#1DB954', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#14B8A6', '#F97316'];

interface ArtistEvolutionProps {
  data: Record<string, string | number>[];
  artists: string[];
}

export function ArtistEvolutionChart({ data, artists }: ArtistEvolutionProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #333', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
        {artists.map((artist, i) => (
          <Line
            key={artist}
            type="monotone"
            dataKey={artist}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            name={artist}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// Wrapper para descargar cualquier visualización como PNG
// ==========================================
interface DownloadableProps {
  children: React.ReactNode;
  filename: string;
}

export function DownloadableChart({ children, filename }: DownloadableProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!ref.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#09090B',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error downloading chart:', e);
    }
  }, [filename]);

  return (
    <div className="relative group">
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg border border-gray-600/50 text-gray-400 hover:text-white"
        title="Descargar como imagen"
      >
        <Download size={14} />
      </button>
      <div ref={ref}>
        {children}
      </div>
    </div>
  );
}
