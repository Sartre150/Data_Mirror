import type { SpotifyData, StreamingHistoryMusic, StreamingHistoryPodcast } from '../types/spotify';
import JSZip from 'jszip';

// ==========================================
// Utilidades de conversión
// ==========================================

export const msToHours = (ms: number): number =>
  Math.round(ms / 3_600_000);

export const msToMinutes = (ms: number): number =>
  Math.round(ms / 60_000);

// ==========================================
// Funciones de análisis del historial
// ==========================================

export function getTotalHours(items: StreamingHistoryMusic[]): number {
  return msToHours(items.reduce((s, i) => s + i.msPlayed, 0));
}

export function getTopArtists(items: StreamingHistoryMusic[], limit = 10) {
  const map = new Map<string, number>();
  for (const i of items) map.set(i.artistName, (map.get(i.artistName) ?? 0) + i.msPlayed);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, ms]) => ({ name, ms, hours: msToHours(ms) }));
}

export function getTopTracks(items: StreamingHistoryMusic[], limit = 10) {
  const key = (i: StreamingHistoryMusic) => `${i.trackName}|||${i.artistName}`;
  const map = new Map<string, number>();
  for (const i of items) map.set(key(i), (map.get(key(i)) ?? 0) + i.msPlayed);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, ms]) => {
      const [name, artist] = k.split('|||');
      return { name, artist, ms, hours: msToHours(ms) };
    });
}

export function getListeningByHour(items: StreamingHistoryMusic[]) {
  const hours = new Array(24).fill(0) as number[];
  for (const i of items) {
    const h = new Date(i.endTime).getHours();
    if (!isNaN(h)) hours[h] += i.msPlayed;
  }
  return hours.map((ms, hour) => ({ hour, minutes: msToMinutes(ms) }));
}

export function getListeningByDay(items: StreamingHistoryMusic[]) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const totals = new Array(7).fill(0) as number[];
  for (const i of items) {
    const d = new Date(i.endTime).getDay();
    if (!isNaN(d)) totals[d] += i.msPlayed;
  }
  return totals.map((ms, idx) => ({ day: days[idx], hours: msToHours(ms) }));
}

export function getListeningByMonth(items: StreamingHistoryMusic[]) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  // Usamos un mapa para agrupar por "Año-Mes" en lugar de solo meses
  const totalsByMonthAndYear = new Map<string, number>();
  
  for (const i of items) {
    const d = new Date(i.endTime);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear().toString().slice(-2); // "24", "25"
      const monthIdx = d.getMonth();
      const m = months[monthIdx];
      const key = `${m} '${year}`; // ej: "Ene '24"
      
      totalsByMonthAndYear.set(key, (totalsByMonthAndYear.get(key) || 0) + i.msPlayed);
    }
  }

  // Convertir a array y ordenarlo cronológicamente si las fechas son secuenciales
  // O podemos dejar que Recharts mantenga el orden de inserción si el historial ya está ordenado
  const result = Array.from(totalsByMonthAndYear.entries()).map(([key, ms]) => ({
    month: key,
    hours: msToHours(ms)
  }));
  
  return result;
}

export function getUniqueTracks(items: StreamingHistoryMusic[]): number {
  return new Set(items.map((i) => `${i.trackName}—${i.artistName}`)).size;
}

export function getUniqueArtists(items: StreamingHistoryMusic[]): number {
  return new Set(items.map((i) => i.artistName)).size;
}

export function getDateRange(music: StreamingHistoryMusic[], podcasts: StreamingHistoryPodcast[]): string | null {
  let minDate = Infinity;
  let maxDate = -Infinity;

  const processDate = (timeStr: string) => {
    const time = new Date(timeStr).getTime();
    if (!isNaN(time)) {
      if (time < minDate) minDate = time;
      if (time > maxDate) maxDate = time;
    }
  };

  for (const m of music) processDate(m.endTime);
  for (const p of podcasts) processDate(p.endTime);

  if (minDate === Infinity || maxDate === -Infinity) return null;

  const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const start = new Date(minDate).toLocaleDateString('es-ES', formatOpts);
  const end = new Date(maxDate).toLocaleDateString('es-ES', formatOpts);

  return `${start} al ${end}`;
}

// ==========================================
// Heatmaps y análisis avanzados (del profesor)
// ==========================================

/** Heatmap: Día de la semana × Hora del día (reproducciones) */
export function getHeatmapDayHour(items: StreamingHistoryMusic[]) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const i of items) {
    const d = new Date(i.endTime);
    if (isNaN(d.getTime())) continue;
    const dayIdx = (d.getDay() + 6) % 7; // Lun=0 … Dom=6
    matrix[dayIdx][d.getHours()]++;
  }
  return { days, matrix };
}

/** Heatmap: Top N artistas × Hora del día */
export function getArtistsByHour(items: StreamingHistoryMusic[], limit = 20) {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.artistName, (counts.get(i.artistName) ?? 0) + 1);
  const artists = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n);

  const matrix: number[][] = Array.from({ length: artists.length }, () => new Array(24).fill(0));
  for (const i of items) {
    const idx = artists.indexOf(i.artistName);
    if (idx === -1) continue;
    const d = new Date(i.endTime);
    if (!isNaN(d.getTime())) matrix[idx][d.getHours()]++;
  }
  return { artists, matrix };
}

/** Heatmap: Top N artistas × Día de la semana */
export function getArtistsByDay(items: StreamingHistoryMusic[], limit = 20) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.artistName, (counts.get(i.artistName) ?? 0) + 1);
  const artists = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n);

  const matrix: number[][] = Array.from({ length: artists.length }, () => new Array(7).fill(0));
  for (const i of items) {
    const idx = artists.indexOf(i.artistName);
    if (idx === -1) continue;
    const d = new Date(i.endTime);
    if (!isNaN(d.getTime())) matrix[idx][(d.getDay() + 6) % 7]++;
  }
  return { artists, days, matrix };
}

/** Top N artistas por mes (para line chart) */
export function getTopArtistsByMonth(items: StreamingHistoryMusic[], limit = 5) {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const totals = new Map<string, number>();
  for (const i of items) totals.set(i.artistName, (totals.get(i.artistName) ?? 0) + 1);
  const artists = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n);

  const monthlyMap = new Map<string, Map<string, number>>();
  const seen = new Set<string>();
  const monthOrder: string[] = [];

  for (const i of items) {
    const d = new Date(i.endTime);
    if (isNaN(d.getTime())) continue;
    const key = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
    if (!seen.has(key)) { seen.add(key); monthOrder.push(key); }
    if (!monthlyMap.has(key)) monthlyMap.set(key, new Map());
    if (artists.includes(i.artistName)) {
      const m = monthlyMap.get(key)!;
      m.set(i.artistName, (m.get(i.artistName) ?? 0) + 1);
    }
  }

  const data = monthOrder.map(month => {
    const entry: Record<string, string | number> = { month };
    const aMap = monthlyMap.get(month)!;
    for (const a of artists) entry[a] = aMap.get(a) ?? 0;
    return entry;
  });
  return { data, artists };
}

/** Historial filtrado por una fecha específica */
export function getHistoryByDate(items: StreamingHistoryMusic[], dateStr: string) {
  const t = new Date(dateStr);
  if (isNaN(t.getTime())) return [];
  return items
    .filter(i => {
      const d = new Date(i.endTime);
      return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
    })
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
}

// ==========================================
// Parser — mapea nombres de archivo a keys
// ==========================================

/** Mapa de nombre base del archivo → key en SpotifyData */
const FILE_KEY_MAP: Record<string, string> = {
  'StreamingHistory_music': 'StreamingHistory_music',
  'StreamingHistory_podcast': 'StreamingHistory_podcast',
  'Userdata': 'Userdata',
  'Identity': 'Identity',
  'Identifiers': 'Identifiers',
  'DuoNewFamily': 'DuoNewFamily',
  'Follow': 'Follow',
  'Inferences': 'Inferences',
  'SearchQueries': 'SearchQueries',
  'Playlist': 'Playlist',
  'YourLibrary': 'YourLibrary',
  'Marquee': 'Marquee',
  'Payments': 'Payments',
  'PodcastInteractivityRatedShow': 'PodcastInteractivityRatedShow',
  'Wrapped': 'Wrapped',
  'YourSoundCapsule': 'YourSoundCapsule',
};

function resolveKey(fileName: string): string {
  // Quita extensión y números finales: "StreamingHistory_music_0.json" → "StreamingHistory_music"
  const base = fileName.replace(/\.json$/i, '').replace(/_?\d+$/, '');
  // Buscar match exacto o parcial
  for (const [pattern, key] of Object.entries(FILE_KEY_MAP)) {
    if (base === pattern || base.startsWith(pattern)) return key;
  }
  // Si es Wrapped2025, Wrapped2024, etc.
  if (base.startsWith('Wrapped')) return 'Wrapped';
  return base;
}

/**
 * Parsea TODOS los archivos JSON subidos.
 * 100% local — nada sale del navegador.
 */
export async function parseUploadedFiles(files: FileList): Promise<SpotifyData> {
  const data: SpotifyData = {};
  const fileArray = Array.from(files);

  // Procesar en paralelo para rapidez
  const results = await Promise.allSettled(
    fileArray.map(async (file) => {
      if (!file.name.toLowerCase().endsWith('.json')) return null;
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      return { name: file.name, parsed };
    })
  );

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { name, parsed } = result.value;

    try {
      const key = resolveKey(name);

      if (Array.isArray(parsed)) {
        // Arrays se concatenan usando concat para evitar el "Maximum call stack size exceeded" 
        // de usar el spread operator ([...a, ...b]) en historiales con 100k+ registros
        const existing = (data[key] ?? []) as unknown[];
        data[key] = existing.concat(parsed);
      } else {
        // Objetos se asignan directamente
        data[key] = parsed as Record<string, unknown>;
      }
    } catch {
      console.warn(`⚠️ No se pudo procesar: ${name}`);
    }
  }

  return data;
}

/**
 * Parsea un archivo ZIP subido, extrayendo todos los JSON internos.
 * 100% local.
 */
export async function parseZipFile(file: File, onProgress?: (count: number) => void): Promise<SpotifyData> {
  const data: SpotifyData = {};
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  // Filtrar solo los JSON (ignorando carpetas ocultas tipo __MACOSX)
  const jsonFiles = Object.values(loadedZip.files).filter(
    (zipEntry) => !zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.json') && !zipEntry.name.includes('__MACOSX')
  );

  if (onProgress) {
    onProgress(jsonFiles.length);
  }

  // Leer y parsear en paralelo
  const results = await Promise.allSettled(
    jsonFiles.map(async (zipEntry) => {
      // Extrae solo el nombre del archivo (ignorando la estructura de carpetas)
      const fileName = zipEntry.name.split('/').pop() || zipEntry.name;
      const text = await zipEntry.async('text');
      const parsed = JSON.parse(text) as unknown;
      return { name: fileName, parsed };
    })
  );

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { name, parsed } = result.value;

    try {
      const key = resolveKey(name);

      if (Array.isArray(parsed)) {
        const existing = (data[key] ?? []) as unknown[];
        data[key] = existing.concat(parsed);
      } else {
        data[key] = parsed as Record<string, unknown>;
      }
    } catch {
      console.warn(`⚠️ No se pudo procesar desde ZIP: ${name}`);
    }
  }

  return data;
}
