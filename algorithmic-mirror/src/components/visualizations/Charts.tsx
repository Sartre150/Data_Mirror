import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, AreaChart, Area
} from 'recharts';
import { useEffect, useState } from 'react';

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
