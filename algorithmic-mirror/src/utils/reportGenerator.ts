import type { SpotifyData, StreamingHistoryMusic, StreamingHistoryPodcast, SearchQuery, Playlist, YourLibrary, Wrapped, Follow, MarqueeItem } from '../types/spotify';
import { getTotalHours, getTopArtists, getTopTracks, getUniqueTracks, getUniqueArtists, getListeningByHour, getListeningByDay, msToHours, getDateRange } from './dataParser';

/**
 * Genera un resumen detallado en texto plano y lo descarga como archivo .txt
 */
export function downloadSummaryReport(data: SpotifyData) {
  const userData = data.Userdata ?? {} as Record<string, string>;
  const identity = data.Identity ?? {} as Record<string, unknown>;
  const musicHistory = (data.StreamingHistory_music ?? data['StreamingHistory_music_'] ?? []) as StreamingHistoryMusic[];
  const podcastHistory = (data.StreamingHistory_podcast ?? data['StreamingHistory_podcast_'] ?? []) as StreamingHistoryPodcast[];
  const searchQueries = (data.SearchQueries ?? []) as SearchQuery[];
  const playlists = ((data.Playlist as { playlists?: Playlist[] } | undefined)?.playlists ?? []) as Playlist[];
  const library = (data.YourLibrary ?? {}) as YourLibrary;
  const rawInferences = data.Inferences?.inferences ?? [];
  const follow = data.Follow as Follow | undefined;
  const wrapped = (data.Wrapped ?? data['Wrapped2025'] ?? data['Wrapped2024'] ?? {}) as Wrapped;
  const marquee = (data.Marquee ?? []) as MarqueeItem[];

  const totalHours = getTotalHours(musicHistory);
  const topArtists = getTopArtists(musicHistory, 20);
  const topTracks = getTopTracks(musicHistory, 20);
  const uniqueTracks = getUniqueTracks(musicHistory);
  const uniqueArtists = getUniqueArtists(musicHistory);
  const hourlyData = getListeningByHour(musicHistory);
  const weeklyData = getListeningByDay(musicHistory);
  const dateRange = getDateRange(musicHistory, podcastHistory);

  const peakHour = hourlyData.reduce((max, d) => d.minutes > max.minutes ? d : max, hourlyData[0]);
  const peakDay = weeklyData.reduce((max, d) => d.hours > max.hours ? d : max, weeklyData[0]);

  const podHours = msToHours(podcastHistory.reduce((s, p) => s + p.msPlayed, 0));
  const uniquePods = new Set(podcastHistory.map(p => p.podcastName)).size;

  const lines: string[] = [];
  const hr = '═'.repeat(60);
  const br = '─'.repeat(60);

  lines.push(hr);
  lines.push('  ALGORITHMIC MIRROR — Resumen Detallado de Datos Spotify');
  lines.push(hr);
  lines.push(`  Generado: ${new Date().toLocaleString('es-ES')}`);
  if (dateRange) lines.push(`  Periodo analizado: ${dateRange}`);
  lines.push('');

  // PERFIL
  lines.push(br);
  lines.push('  PERFIL DE USUARIO');
  lines.push(br);
  if (userData.username) lines.push(`  Usuario:        ${userData.username}`);
  if (userData.email) lines.push(`  Email:          ${userData.email}`);
  if (userData.country) lines.push(`  País:           ${userData.country}`);
  if (userData.gender) lines.push(`  Género:         ${userData.gender}`);
  if (userData.birthdate) lines.push(`  Nacimiento:     ${userData.birthdate}`);
  if (userData.creationTime) lines.push(`  Cuenta creada:  ${userData.creationTime}`);
  if (identity.displayName) lines.push(`  Nombre público: ${identity.displayName}`);
  lines.push('');

  // CONSUMO
  lines.push(br);
  lines.push('  RESUMEN DE CONSUMO');
  lines.push(br);
  lines.push(`  Horas totales de música:   ${totalHours.toLocaleString()}h`);
  lines.push(`  Reproducciones totales:    ${musicHistory.length.toLocaleString()}`);
  lines.push(`  Canciones únicas:          ${uniqueTracks.toLocaleString()}`);
  lines.push(`  Artistas únicos:           ${uniqueArtists.toLocaleString()}`);
  lines.push(`  Horas de podcasts:         ${podHours}h`);
  lines.push(`  Podcasts únicos:           ${uniquePods}`);
  lines.push(`  Episodios de podcast:      ${podcastHistory.length.toLocaleString()}`);
  lines.push(`  Playlists:                 ${playlists.length}`);
  lines.push(`  Canciones en playlists:    ${playlists.reduce((s, p) => s + p.items.length, 0).toLocaleString()}`);
  lines.push('');

  // BIBLIOTECA
  if (Object.keys(library).length > 0) {
    lines.push(br);
    lines.push('  BIBLIOTECA GUARDADA');
    lines.push(br);
    if (library.tracks) lines.push(`  Canciones:     ${library.tracks.length.toLocaleString()}`);
    if (library.albums) lines.push(`  Álbumes:       ${library.albums.length.toLocaleString()}`);
    if (library.artists) lines.push(`  Artistas:      ${library.artists.length.toLocaleString()}`);
    if (library.shows) lines.push(`  Podcasts:      ${library.shows.length}`);
    if (library.episodes) lines.push(`  Episodios:     ${library.episodes.length}`);
    if (library.bannedTracks?.length) lines.push(`  Bloqueadas:    ${library.bannedTracks.length}`);
    lines.push('');
  }

  // TOP ARTISTAS
  lines.push(br);
  lines.push('  TOP 20 ARTISTAS MÁS ESCUCHADOS');
  lines.push(br);
  topArtists.forEach((a, i) => {
    lines.push(`  ${String(i + 1).padStart(2)}. ${a.name.padEnd(35)} ${a.hours}h`);
  });
  lines.push('');

  // TOP CANCIONES
  lines.push(br);
  lines.push('  TOP 20 CANCIONES MÁS ESCUCHADAS');
  lines.push(br);
  topTracks.forEach((t, i) => {
    lines.push(`  ${String(i + 1).padStart(2)}. ${t.name} — ${t.artist}  (${t.hours}h)`);
  });
  lines.push('');

  // PATRONES
  lines.push(br);
  lines.push('  PATRONES DE ESCUCHA');
  lines.push(br);
  if (peakHour) lines.push(`  Hora pico:         ${peakHour.hour}:00 (${Math.round(peakHour.minutes / 60)}h acumuladas)`);
  if (peakDay) lines.push(`  Día más activo:    ${peakDay.day} (${peakDay.hours}h)`);
  lines.push('');
  lines.push('  Distribución por hora:');
  hourlyData.forEach(h => {
    const bar = '█'.repeat(Math.round((h.minutes / (peakHour?.minutes || 1)) * 30));
    lines.push(`    ${String(h.hour).padStart(2)}h  ${bar} ${Math.round(h.minutes / 60)}h`);
  });
  lines.push('');
  lines.push('  Distribución por día:');
  weeklyData.forEach(d => {
    const bar = '█'.repeat(Math.round((d.hours / (peakDay?.hours || 1)) * 30));
    lines.push(`    ${d.day}  ${bar} ${d.hours}h`);
  });
  lines.push('');

  // WRAPPED
  if (Object.keys(wrapped).length > 0) {
    lines.push(br);
    lines.push('  SPOTIFY WRAPPED');
    lines.push(br);
    if (wrapped.listeningAge?.listeningAge) lines.push(`  Edad auditiva: ${wrapped.listeningAge.listeningAge} años`);
    if (wrapped.topGenres?.topGenres) lines.push(`  Géneros: ${wrapped.topGenres.topGenres.map(g => g.replace('spotify:concept:', '')).join(', ')}`);
    if (wrapped.clubs?.userClub) lines.push(`  Club: ${wrapped.clubs.userClub} (${wrapped.clubs.role})`);
    if (wrapped.party) {
      const p = wrapped.party;
      if (p.percentSadTracks !== undefined) lines.push(`  Melancolía: ${Math.round(p.percentSadTracks)}%`);
      if (p.percentChillTracks !== undefined) lines.push(`  Relajación: ${Math.round(p.percentChillTracks)}%`);
      if (p.percentLoveTracks !== undefined) lines.push(`  Romance: ${Math.round(p.percentLoveTracks)}%`);
      if (p.percentPartyTracks !== undefined) lines.push(`  Fiesta: ${Math.round(p.percentPartyTracks)}%`);
      if (p.percentListenedNight !== undefined) lines.push(`  Escucha nocturna: ${Math.round(p.percentListenedNight)}%`);
    }
    lines.push('');
  }

  // BÚSQUEDAS
  if (searchQueries.length > 0) {
    lines.push(br);
    lines.push('  BÚSQUEDAS REGISTRADAS');
    lines.push(br);
    lines.push(`  Total: ${searchQueries.length} búsquedas`);
    lines.push('  Últimas 30:');
    [...searchQueries].reverse().slice(0, 30).forEach(sq => {
      const d = new Date(sq.searchTime.replace(/\[UTC\]$/, ''));
      const date = !isNaN(d.getTime()) ? d.toLocaleDateString('es-ES') : '';
      const time = !isNaN(d.getTime()) ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
      lines.push(`    "${sq.searchQuery}" — ${date} ${time} (${sq.platform ?? ''})`);
    });
    lines.push('');
  }

  // RED SOCIAL
  if (follow) {
    lines.push(br);
    lines.push('  RED SOCIAL');
    lines.push(br);
    lines.push(`  Siguiendo:   ${follow.userIsFollowing?.length ?? 0}`);
    lines.push(`  Seguidores:  ${follow.userIsFollowedBy?.length ?? 0}`);
    lines.push(`  Bloqueados:  ${follow.userIsBlocking?.length ?? 0}`);
    lines.push('');
  }

  // INFERENCIAS
  if (rawInferences.length > 0) {
    lines.push(br);
    lines.push('  PERFIL PUBLICITARIO (INFERENCIAS)');
    lines.push(br);
    lines.push(`  Total de etiquetas: ${rawInferences.length}`);
    
    const isHash = (s: string) => /^[0-9a-f]{32}$/i.test(s) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const hashes = rawInferences.filter(t => isHash(t.replace(/1P_|3P_|Custom_|Segment_/g, '').trim()));
    const readable = rawInferences.filter(t => !isHash(t.replace(/1P_|3P_|Custom_|Segment_/g, '').trim()));
    
    lines.push(`  Etiquetas legibles: ${readable.length}`);
    lines.push(`  IDs ocultos (data brokers): ${hashes.length}`);
    lines.push('');
    lines.push('  Etiquetas:');
    readable.forEach(t => lines.push(`    • ${t.replace(/1P_|3P_|Custom_|Segment_/g, '').trim()}`));
    lines.push('');
  }

  // MARQUEE
  if (marquee.length > 0) {
    lines.push(br);
    lines.push('  SEGMENTOS MARQUEE');
    lines.push(br);
    marquee.forEach(m => lines.push(`  ${m.artistName} — ${m.segment}`));
    lines.push('');
  }

  // RESUMEN FINAL
  lines.push(hr);
  lines.push('  RESUMEN EJECUTIVO');
  lines.push(hr);
  lines.push(`  Spotify tiene ${(musicHistory.length + podcastHistory.length).toLocaleString()} registros de tu actividad,`);
  lines.push(`  ${rawInferences.length} etiquetas publicitarias, ${searchQueries.length} búsquedas registradas,`);
  lines.push(`  y un perfil emocional completo que clasifica tu melancolía, tu euforia`);
  lines.push(`  y tus horas de vulnerabilidad.`);
  lines.push('');
  lines.push('  Todo esto se procesa, se empaqueta y se vende — no como "tus datos",');
  lines.push('  sino como "audiencias segmentadas" — a anunciantes que pagan en');
  lines.push('  subastas de milisegundos mientras tú escuchas tu playlist favorita.');
  lines.push('');
  lines.push('  Tú no eres el cliente de Spotify. Eres el producto.');
  lines.push('');
  lines.push(hr);
  lines.push('  Generado por Algorithmic Mirror');
  lines.push('  Tus datos nunca abandonaron tu navegador. 100% local, 0% servidor.');
  lines.push(hr);

  const text = lines.join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `Algorithmic_Mirror_Resumen_${new Date().toISOString().slice(0, 10)}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
