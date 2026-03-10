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
