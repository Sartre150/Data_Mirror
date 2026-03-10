import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Tag as TagIcon, Activity, LogOut, Brain, Search, Clock, Music,
  Heart, ListMusic, Library, Podcast, CreditCard, Star, Globe, Users, Fingerprint, Radio,
  Eye, ShieldOff, Scan, Package, Smartphone, Target
} from 'lucide-react';
import type { SpotifyData, StreamingHistoryMusic, StreamingHistoryPodcast, SearchQuery,
  Playlist, YourLibrary, Follow, Wrapped, MarqueeItem, PodcastRatedShow } from '../types/spotify';
import { Card, CardHeader, BigStat, MiniStat, ProgressBar, Tag } from '../components/ui/Card';
import { HorizontalBarChart, HourlyChart, WeekRadar, MonthlyArea } from '../components/visualizations/Charts';
import { CorporateInsight } from '../components/ui/CorporateInsight';
import {
  getTotalHours, getTopArtists, getTopTracks, getUniqueTracks, getUniqueArtists,
  getListeningByHour, getListeningByDay, getListeningByMonth, msToHours, getDateRange
} from '../utils/dataParser';

interface Props {
  data: SpotifyData;
  onReset: () => void;
}

export default function Dashboard({ data, onReset }: Props) {
  // ==========================================
  // EXTRACCIÓN SEGURA DE TODOS LOS DATASETS (MEMOIZADA)
  // ==========================================
  const userData = useMemo(() => data.Userdata ?? {}, [data]);
  const identity = useMemo(() => data.Identity ?? {}, [data]);
  const follow = data.Follow as Follow | undefined;
  
  // Limpiamos y separamos las inferencias
  const rawInferences = useMemo(() => data.Inferences?.inferences ?? [], [data]);

  // Historial — busca con y sin trailing underscore
  const musicHistory = useMemo(() => (data.StreamingHistory_music ?? data['StreamingHistory_music_'] ?? []) as StreamingHistoryMusic[], [data]);
  const podcastHistory = useMemo(() => (data.StreamingHistory_podcast ?? data['StreamingHistory_podcast_'] ?? []) as StreamingHistoryPodcast[], [data]);

  // Búsquedas
  const searchQueries = useMemo(() => (data.SearchQueries ?? []) as SearchQuery[], [data]);

  // Playlists
  const playlists = useMemo(() => (data.Playlist as { playlists?: Playlist[] } | undefined)?.playlists ?? [], [data]);

  // Biblioteca
  const library = useMemo(() => (data.YourLibrary ?? {}) as YourLibrary, [data]);

  // Marquee
  const marquee = useMemo(() => (data.Marquee ?? []) as MarqueeItem[], [data]);

  // Wrapped
  const wrapped = useMemo(() => (data.Wrapped ?? data['Wrapped2025'] ?? data['Wrapped2024'] ?? {}) as Wrapped, [data]);

  // Podcasts
  const podcastRated = useMemo(() => (data.PodcastInteractivityRatedShow as { ratedShows?: PodcastRatedShow[] } | undefined)?.ratedShows ?? [], [data]);

  // Pagos
  const payments = data.Payments as { payment_method?: string } | undefined;

  // Identifiers
  const identifiers = data.Identifiers as { identifierType?: string; identifierValue?: string } | undefined;

  // DuoNewFamily
  const duo = data.DuoNewFamily as { address?: string } | undefined;

  // ==========================================
  // CÁLCULOS (MEMOIZADOS PARA RENDIMIENTO)
  // ==========================================
  const totalHours = useMemo(() => getTotalHours(musicHistory), [musicHistory]);
  const topArtists = useMemo(() => getTopArtists(musicHistory, 50), [musicHistory]);
  const topTracks = useMemo(() => getTopTracks(musicHistory, 50), [musicHistory]);
  const uniqueTracks = useMemo(() => getUniqueTracks(musicHistory), [musicHistory]);
  const uniqueArtists = useMemo(() => getUniqueArtists(musicHistory), [musicHistory]);
  const hourlyData = useMemo(() => getListeningByHour(musicHistory), [musicHistory]);
  const weeklyData = useMemo(() => getListeningByDay(musicHistory), [musicHistory]);
  const monthlyData = useMemo(() => getListeningByMonth(musicHistory), [musicHistory]);
  const dataDateRange = useMemo(() => getDateRange(musicHistory, podcastHistory), [musicHistory, podcastHistory]);

  const podcastHours = useMemo(() => msToHours(podcastHistory.reduce((s, p) => s + p.msPlayed, 0)), [podcastHistory]);
  const uniquePodcasts = useMemo(() => new Set(podcastHistory.map(p => p.podcastName)).size, [podcastHistory]);

  const totalPlaylistTracks = useMemo(() => playlists.reduce((s, p) => s + p.items.length, 0), [playlists]);

  // Wrapped party stats
  const party = wrapped?.party;
  const listeningAge = wrapped?.listeningAge;

  // ==========================================
  // ANIMACIONES
  // ==========================================
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const parsedSearchQueries = useMemo(() => {
    return [...searchQueries].reverse().map(sq => {
      const cleanDateString = sq.searchTime.replace(/\[UTC\]$/, '');
      const dateObj = new Date(cleanDateString);
      
      return {
        ...sq,
        formattedDate: !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Fecha desconocida',
        formattedTime: !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          : ''
      };
    });
  }, [searchQueries]);

  const productCategories = useMemo(() => {
    // 1. MEJORAMOS LA DETECCIÓN DE CÓDIGOS SECRETOS (Con y sin guiones)
    const isHash = (str: string) => /^[0-9a-f]{32}$/i.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const categories = {
      demographics: [] as string[],
      devices: [] as string[],
      behaviors: [] as string[],
      interests: [] as string[],
      hidden: [] as string[],
    };

    rawInferences.forEach((tag) => {
      let clean = tag.replace(/1P_|3P_|Custom_|Segment_/g, '').trim();
      
      if (isHash(clean) || (/^[0-9]+$/i.test(clean) && clean.length > 5)) {
        categories.hidden.push(clean);
        return;
      }

      clean = clean.replace(/-/g, ' ');
      const lowerClean = clean.toLowerCase();
      
      if (lowerClean.includes('demographic')) {
        categories.demographics.push(clean.replace(/demographic/i, '').trim());
      } else if (lowerClean.match(/(apple|samsung|windows|ios|tv|wearable|device|restricted)/)) {
        categories.devices.push(clean.replace(/\[advertiser restricted\]/i, '').trim());
      } else if (lowerClean.match(/(listener|streamer|moment|playlist|engager|hub users)/)) {
        categories.behaviors.push(clean);
      } else {
        categories.interests.push(clean.replace(/^interest /i, '').trim());
      }
    });

    return categories;
  }, [rawInferences]);

  // Contar cuántos datasets se cargaron
  const loadedSections = useMemo(() => [
    musicHistory.length > 0,
    podcastHistory.length > 0,
    Object.keys(userData).length > 0,
    Object.keys(identity).length > 0,
    rawInferences.length > 0,
    searchQueries.length > 0,
    playlists.length > 0,
    Object.keys(library).length > 0,
    marquee.length > 0,
    Object.keys(wrapped).length > 0,
    podcastRated.length > 0,
    !!payments?.payment_method,
    !!identifiers?.identifierType,
    !!follow,
    !!duo?.address,
  ].filter(Boolean).length, [
    musicHistory, podcastHistory, userData, identity, rawInferences, 
    searchQueries, playlists, library, marquee, wrapped, 
    podcastRated, payments, identifiers, follow, duo
  ]);

  // ==========================================
  // FASES / TABS
  // ==========================================
  type Phase = 'espejo' | 'psicologo' | 'espia' | 'producto';
  const phases: { key: Phase; label: string; icon: React.ReactNode; color: string; activeColor: string; desc: string }[] = [
    { key: 'espejo',    label: '1. El Espejo',      icon: <Eye size={16} />,       color: 'bg-gray-800 text-gray-400 hover:bg-gray-700', activeColor: 'bg-spotify text-black',     desc: 'Tu identidad y consumo' },
    { key: 'psicologo', label: '2. El Psicólogo',   icon: <Brain size={16} />,     color: 'bg-gray-800 text-gray-400 hover:bg-gray-700', activeColor: 'bg-blue-500 text-white',     desc: 'Patrones y emociones' },
    { key: 'espia',     label: '3. El Espía',       icon: <Scan size={16} />,      color: 'bg-gray-800 text-gray-400 hover:bg-gray-700', activeColor: 'bg-yellow-500 text-black',   desc: 'Tus secretos' },
    { key: 'producto',  label: '4. Eres el Producto',icon: <Package size={16} />,  color: 'bg-gray-800 text-gray-400 hover:bg-gray-700', activeColor: 'bg-red-500 text-white',      desc: 'Tu valor comercial' },
  ];

  const [activeTab, setActiveTab] = useState<Phase>('espejo');

  return (
    <div className="min-h-screen pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-darkBg/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">
              Tu <span className="text-spotify">Reflejo</span> Algorítmico
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
              <span className="text-xs text-gray-500">{loadedSections} categorías cargadas</span>
              {dataDateRange && (
                <>
                  <span className="hidden sm:inline text-gray-600">•</span>
                  <span className="text-[11px] md:text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded-full border border-gray-700/50">
                    Periodo analizado: {dataDateRange}
                  </span>
                </>
              )}
            </div>
          </div>
          <button onClick={onReset} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-400 hover:text-white transition-colors px-3 md:px-4 py-2 border border-gray-700 rounded-lg hover:border-spotify shrink-0">
            <LogOut size={14} />
            <span className="hidden sm:inline">Analizar otros datos</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>

        {/* TABS DE FASES */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {phases.map((p) => (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap shrink-0 ${activeTab === p.key ? p.activeColor : p.color}`}
            >
              {p.icon}
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.label.split('. ')[0]}.</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHAPTER INTRO */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-3 md:pb-4">
        <ChapterIntro phase={activeTab} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait">
          {/* ================================================
              FASE 1: EL ESPEJO — Identidad y Consumo
              ================================================ */}
          {activeTab === 'espejo' && (
            <motion.div key="espejo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

                {/* Perfil */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader icon={<User size={20} />} title="Tu Perfil Digital" />
                    {(identity.largeImageUrl || identity.imageUrl) && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={identity.largeImageUrl ?? identity.imageUrl}
                          alt="Foto de perfil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-spotify/40 shadow-lg"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <ProfileRow label="Usuario" value={userData.username} />
                      <ProfileRow label="Email" value={userData.email} />
                      <ProfileRow label="País" value={userData.country} />
                      <ProfileRow label="Género" value={userData.gender} />
                      <ProfileRow label="Nacimiento" value={userData.birthdate} />
                      <ProfileRow label="Creación cuenta" value={userData.creationTime} />
                      {userData.createdFromFacebook && (
                        <p className="text-xs text-orange-400">⚠ Cuenta creada vía Facebook</p>
                      )}
                    </div>
                    <CorporateInsight
                      title="Perfil Demográfico"
                      description="Tu edad, género, país y email conforman tu 'perfil demográfico base'. Se cruza con datos de terceros (Meta, Google) para construir un avatar publicitario completo. Cuando creaste tu cuenta vía Facebook, ambas empresas sincronizaron tus grafos sociales."
                    />
                  </Card>
                </motion.div>

                {/* Identidad */}
                {Object.keys(identity).length > 0 && (
                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader icon={<Fingerprint size={20} />} title="Identidad Pública" color="text-purple-400" />
                      <div className="space-y-3">
                        <ProfileRow label="Nombre mostrado" value={identity.displayName} />
                        <ProfileRow label="Nombre" value={[identity.firstName, identity.lastName].filter(Boolean).join(' ') || undefined} />
                        {identity.verified && <p className="text-xs text-blue-400">✓ Cuenta verificada</p>}
                        {identity.tasteMaker && <p className="text-xs text-spotify">★ Taste Maker</p>}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Consumo Total */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader icon={<Activity size={20} />} title="Consumo Total" color="text-blue-400" />
                    <BigStat value={`${totalHours}h`} label="Tiempo de tu vida entregado a Spotify" />
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-5">
                      <MiniStat label="Reproducciones" value={musicHistory.length.toLocaleString()} />
                      <MiniStat label="Canciones únicas" value={uniqueTracks.toLocaleString()} />
                      <MiniStat label="Artistas" value={uniqueArtists.toLocaleString()} />
                    </div>
                    <CorporateInsight
                      title="Engagement Metrics"
                      description="Tus horas de escucha son la métrica principal de 'engagement'. A mayor tiempo, más datos conductuales genera el algoritmo. Cada reproducción alimenta el modelo de recomendación que te mantiene enganchado, como una máquina tragamonedas auditiva diseñada para maximizar tu tiempo en la plataforma."
                    />
                  </Card>
                </motion.div>

                {/* Top Artistas */}
                {topArtists.length > 0 && (
                  <motion.div variants={fadeUp} className="lg:col-span-2">
                    <Card>
                      <CardHeader icon={<Music size={20} />} title="Tus Artistas Más Escuchados" color="text-green-400" />
                      <HorizontalBarChart data={topArtists.map(a => ({ name: a.name, value: a.hours }))} />
                    </Card>
                  </motion.div>
                )}

                {/* Top Canciones */}
                {topTracks.length > 0 && (
                  <motion.div variants={fadeUp} className="lg:col-span-2">
                    <Card>
                      <CardHeader icon={<Star size={20} />} title="Tus Canciones Más Escuchadas" color="text-yellow-400" />
                      <TopTracksList tracks={topTracks} />
                    </Card>
                  </motion.div>
                )}

                {/* Playlists */}
                {playlists.length > 0 && (
                  <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader icon={<ListMusic size={20} />} title="Tus Playlists" color="text-teal-400" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                        <MiniStat label="Playlists" value={playlists.length} />
                        <MiniStat label="Canciones totales" value={totalPlaylistTracks.toLocaleString()} />
                        <MiniStat label="Seguidores máx." value={Math.max(...playlists.map(p => p.numberOfFollowers), 0)} />
                        <MiniStat label="Colaboradores" value={playlists.filter(p => p.collaborators && p.collaborators.length > 0).length} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-[480px] overflow-y-auto pr-1">
                        {playlists.map((pl, i) => (
                          <div key={i} className="bg-gray-800/30 rounded-xl p-3 border border-gray-800/50">
                            <p className="font-medium text-sm truncate">{pl.name}</p>
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              <span>{pl.items.length} pistas</span>
                              <span>{pl.numberOfFollowers} seguidores</span>
                            </div>
                            {pl.description && <p className="text-xs text-gray-600 mt-1 truncate">{pl.description}</p>}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Biblioteca */}
                {Object.keys(library).length > 0 && (
                  <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader icon={<Library size={20} />} title="Tu Biblioteca" color="text-sky-400" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-4 md:mb-5">
                        {library.tracks && <MiniStat label="Canciones" value={library.tracks.length.toLocaleString()} />}
                        {library.albums && <MiniStat label="Álbumes" value={library.albums.length.toLocaleString()} />}
                        {library.artists && <MiniStat label="Artistas" value={library.artists.length.toLocaleString()} />}
                        {library.shows && <MiniStat label="Podcasts" value={library.shows.length.toLocaleString()} />}
                        {library.episodes && <MiniStat label="Episodios" value={library.episodes.length.toLocaleString()} />}
                        {library.bannedTracks && library.bannedTracks.length > 0 && <MiniStat label="Bloqueadas" value={library.bannedTracks.length} />}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {library.tracks && library.tracks.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-sky-400 mb-2">🎵 Canciones guardadas</p>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                              {library.tracks.map((t, i) => (
                                <div key={i} className="text-xs text-gray-400 py-1 border-b border-gray-800/50">
                                  <span className="text-gray-200">{t.track}</span> — {t.artist}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {library.albums && library.albums.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-sky-400 mb-2">💿 Álbumes guardados</p>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                              {library.albums.map((a, i) => (
                                <div key={i} className="text-xs text-gray-400 py-1 border-b border-gray-800/50">
                                  <span className="text-gray-200">{a.album}</span> — {a.artist}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {library.artists && library.artists.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-sky-400 mb-2">🎤 Artistas seguidos</p>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                              {library.artists.map((a, i) => (
                                <div key={i} className="text-xs text-gray-200 py-1 border-b border-gray-800/50">{a.name}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {library.shows && library.shows.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-sky-400 mb-2">🎙 Podcasts suscritos</p>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                              {library.shows.map((s, i) => (
                                <div key={i} className="text-xs text-gray-400 py-1 border-b border-gray-800/50">
                                  <span className="text-gray-200">{s.name}</span> — {s.publisher}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {library.episodes && library.episodes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-sky-400 mb-2">📻 Episodios guardados</p>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                              {library.episodes.map((e, i) => (
                                <div key={i} className="text-xs text-gray-400 py-1 border-b border-gray-800/50">
                                  <span className="text-gray-200">{e.name}</span> — {e.show}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

              </motion.div>
            </motion.div>
          )}

          {/* ================================================
              FASE 2: EL PSICÓLOGO — Patrones y Emociones
              ================================================ */}
          {activeTab === 'psicologo' && (
            <motion.div key="psicologo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

                {/* Horarios */}
                {musicHistory.length > 0 && (
                  <>
                    <motion.div variants={fadeUp} className="lg:col-span-2">
                      <Card>
                        <CardHeader icon={<Clock size={20} />} title="¿A Qué Hora Escuchas?" color="text-cyan-400" />
                        <p className="text-xs text-gray-500 mb-3">Actividad acumulada por hora del día</p>
                        <HourlyChart data={hourlyData} />
                        <CorporateInsight
                          title="Behavioral Timing Patterns"
                          description="Tu horario de escucha revela tu rutina diaria: cuándo despiertas, cuándo comes, cuándo entrenas, cuándo te acuestas. Los anunciantes pagan premium por 'daypart targeting' — saber la hora exacta en que eres más susceptible a ciertos mensajes. Tu pico de las 2AM es oro puro para ads de comida rápida."
                        />
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <Card>
                        <CardHeader icon={<Radio size={20} />} title="Días de la Semana" color="text-emerald-400" />
                        <WeekRadar data={weeklyData} />
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                      <Card>
                        <CardHeader icon={<Activity size={20} />} title="Evolución Mensual" color="text-indigo-400" />
                        <MonthlyArea data={monthlyData} />
                      </Card>
                    </motion.div>
                  </>
                )}

                {/* Perfil Emocional */}
                {party && (
                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader icon={<Brain size={20} />} title="Tu Perfil Emocional" color="text-pink-400" />
                      <p className="text-xs text-gray-500 mb-4">
                        Spotify clasifica la "vibra" de tu música para inferir tu estado emocional.
                      </p>
                      <div className="space-y-3">
                        <ProgressBar label="😢 Melancolía" value={Math.round(party.percentSadTracks ?? 0)} color="bg-blue-400" />
                        <ProgressBar label="☮️ Relajación" value={Math.round(party.percentChillTracks ?? 0)} color="bg-green-400" />
                        <ProgressBar label="❤️ Romance" value={Math.round(party.percentLoveTracks ?? 0)} color="bg-rose-400" />
                        <ProgressBar label="🎉 Fiesta" value={Math.round(party.percentPartyTracks ?? 0)} color="bg-amber-400" />
                      </div>
                      {party.percentListenedNight !== undefined && (
                        <p className="text-xs text-gray-500 mt-4">
                          🌙 {Math.round(party.percentListenedNight)}% de tu escucha es nocturna
                        </p>
                      )}
                      <CorporateInsight
                        title="Segmentación por Estado de Ánimo"
                        description="Las marcas pagan más por anuncios cuando saben cómo te sientes. Si el algoritmo detecta un pico de 'Melancolía' un domingo por la noche, es el momento perfecto para venderte comida rápida o compras impulsivas. Tu tristeza es una métrica de conversión."
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Wrapped */}
                {Object.keys(wrapped).length > 0 && (
                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader icon={<Globe size={20} />} title="Spotify Wrapped" color="text-violet-400" />
                      <div className="space-y-4">
                        {listeningAge && (
                          <div>
                            <p className="text-xs text-gray-500">Edad auditiva estimada</p>
                            <p className="text-2xl font-bold text-violet-400">{listeningAge.listeningAge} años</p>
                            {listeningAge.decadePhase && <p className="text-xs text-gray-500">Fase: {listeningAge.decadePhase}</p>}
                          </div>
                        )}
                        {wrapped.topGenres?.topGenres && wrapped.topGenres.topGenres.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Top Géneros</p>
                            <div className="flex flex-wrap gap-1">
                              {wrapped.topGenres.topGenres.map((g, i) => (
                                <Tag key={i} text={g.replace('spotify:concept:', '')} />
                              ))}
                            </div>
                          </div>
                        )}
                        {wrapped.clubs?.userClub && (
                          <div>
                            <p className="text-xs text-gray-500">Tu club</p>
                            <p className="font-medium">{wrapped.clubs.userClub} <span className="text-gray-500 text-xs">({wrapped.clubs.role})</span></p>
                          </div>
                        )}
                        {party?.numArtistsDiscovered !== undefined && <MiniStat label="Artistas descubiertos" value={party.numArtistsDiscovered} />}
                        {party?.streakNumListeningDays !== undefined && <MiniStat label="Racha de días" value={`${party.streakNumListeningDays} días`} />}
                      </div>
                      <CorporateInsight
                        title="Wrapped: Marketing Viral Gratuito"
                        description="Wrapped no es un regalo — es la campaña de marketing más barata de la historia. Tú compartes voluntariamente tus datos en redes sociales, generando publicidad gratuita para Spotify. Mientras tanto, la 'edad auditiva' y los 'clubs' son clasificadores que refinan tu perfil de segmentación."
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Podcasts */}
                {(podcastHistory.length > 0 || podcastRated.length > 0) && (
                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader icon={<Podcast size={20} />} title="Podcasts" color="text-fuchsia-400" />
                      <div className="space-y-3">
                        <MiniStat label="Horas escuchadas" value={podcastHours} />
                        <MiniStat label="Podcasts únicos" value={uniquePodcasts} />
                        <MiniStat label="Episodios" value={podcastHistory.length.toLocaleString()} />
                      </div>
                      {podcastRated.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2">Podcasts que calificaste:</p>
                          <div className="max-h-48 overflow-y-auto pr-1">
                            {podcastRated.map((p, i) => (
                              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-800/50">
                                <span className="truncate mr-2 text-gray-300">{p.showName}</span>
                                <span className="text-yellow-400 shrink-0">{'★'.repeat(p.rating)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <CorporateInsight
                        title="Podcast = Ideología Rastreable"
                        description="La música revela emociones, pero los podcasts revelan tus creencias, intereses políticos y preocupaciones personales. Un usuario que escucha podcasts de finanzas + true crime + autoayuda genera un perfil psicográfico extraordinariamente detallado para anunciantes."
                      />
                    </Card>
                  </motion.div>
                )}

              </motion.div>
            </motion.div>
          )}

          {/* ================================================
              FASE 3: EL ESPÍA — Tus Secretos
              ================================================ */}
          {activeTab === 'espia' && (
            <motion.div key="espia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

                {/* Búsquedas */}
                {searchQueries.length > 0 && (
                  <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader icon={<Search size={20} />} title="Tus Búsquedas Registradas" color="text-yellow-400" />
                      <p className="text-sm text-gray-400 mb-4">
                        Cada búsqueda queda grabada con fecha, hora exacta y plataforma. Incluso las de las 3AM.
                      </p>
                      <div className="max-h-[400px] md:max-h-[480px] overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                          {parsedSearchQueries.map((sq, idx) => {
                            return (
                              <div key={idx} className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                                <p className="font-mono text-spotify font-medium truncate text-sm" title={sq.searchQuery}>
                                  "{sq.searchQuery}"
                                </p>
                                <div className="flex flex-col mt-2 text-xs text-gray-500">
                                  <span>{sq.formattedDate}</span>
                                  {sq.formattedTime && <span>{sq.formattedTime}</span>}
                                  {sq.platform && <span className="mt-1 text-gray-600">{sq.platform}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-4 text-right">{searchQueries.length} búsquedas totales registradas</p>
                      <CorporateInsight
                        title="Search Intent = Intención Pura"
                        description="Tu historial de búsquedas es más revelador que tu historial de escucha. Cuando buscas algo, estás expresando una intención activa — un deseo, una curiosidad, una necesidad emocional. Los Data Brokers consideran los 'search signals' como datos de altísimo valor porque predicen comportamiento futuro."
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Red Social — bloqueos y seguidores */}
                {follow && (
                  <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader icon={<Users size={20} />} title="Tu Red Social" color="text-blue-400" />
                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
                        <MiniStat label="Siguiendo" value={follow.userIsFollowing?.length ?? 0} />
                        <MiniStat label="Seguidores" value={follow.userIsFollowedBy?.length ?? 0} />
                        <MiniStat label="Bloqueados" value={follow.userIsBlocking?.length ?? 0} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        {follow.userIsFollowing && follow.userIsFollowing.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-400 mb-2">👤 Usuarios que sigues</p>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                              {follow.userIsFollowing.map((u, i) => (
                                <div key={i} className="text-xs text-gray-300 py-1 border-b border-gray-800/50 font-mono">{u}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {follow.userIsFollowedBy && follow.userIsFollowedBy.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-400 mb-2">👥 Usuarios que te siguen</p>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                              {follow.userIsFollowedBy.map((u, i) => (
                                <div key={i} className="text-xs text-gray-300 py-1 border-b border-gray-800/50 font-mono">{u}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {follow.userIsBlocking && follow.userIsBlocking.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-400 mb-2">🚫 Usuarios bloqueados</p>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                              {follow.userIsBlocking.map((u, i) => (
                                <div key={i} className="text-xs text-gray-300 py-1 border-b border-gray-800/50 font-mono">{u}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <CorporateInsight
                        title="Grafo Social y Shadow Profiles"
                        description="Tus contactos, seguidores y bloqueados construyen un 'grafo social'. Incluso las personas que bloqueas revelan información: conflictos, ex parejas, relaciones rotas. Este grafo se cruza con los de otras plataformas para crear 'shadow profiles' de personas que ni siquiera tienen cuenta en Spotify."
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Pagos, IDs, Duo */}
                {(payments?.payment_method || identifiers?.identifierType || duo?.address) && (
                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader icon={<CreditCard size={20} />} title="Datos Financieros y Técnicos" color="text-red-400" />
                      <div className="space-y-3">
                        {payments?.payment_method && <ProfileRow label="Método de pago" value={payments.payment_method} />}
                        {identifiers?.identifierType && <ProfileRow label="Tipo ID" value={identifiers.identifierType} />}
                        {identifiers?.identifierValue && <ProfileRow label="Valor ID" value={identifiers.identifierValue} />}
                        {duo?.address && <ProfileRow label="Dirección Duo/Family" value={duo.address} />}
                      </div>
                      <CorporateInsight
                        title="Datos Financieros e Identificadores Únicos"
                        description="Tu método de pago revela tu banco y capacidad económica. La dirección del plan familiar es una geolocalización física exacta. Los identificadores técnicos permiten rastrearte entre dispositivos y sesiones incluso si usas VPN. Estos datos son los más sensibles y los más valiosos."
                      />
                    </Card>
                  </motion.div>
                )}

              </motion.div>
            </motion.div>
          )}

          {/* ================================================
              FASE 4: ERES EL PRODUCTO — Corporate Insights
              ================================================ */}
          {activeTab === 'producto' && (
            <motion.div key="producto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

                {/* ================================================
              SECCIÓN 5: INFERENCIAS PUBLICITARIAS (CATEGORIZADAS)
              ================================================ */}
          <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardHeader icon={<TagIcon size={20} />} title='El "Tú" Comercial — Tu Perfil de Datos' color="text-orange-400" />
              
              <p className="text-sm text-gray-400 mb-6">
                Spotify no solo sabe qué escuchas, deduce tu estilo de vida para subastarte a los anunciantes. 
                Hemos decodificado y categorizado tu perfil interno:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                {/* BUCKET 1: Demografía */}
                {productCategories.demographics.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-900/30 p-4 md:p-5 rounded-xl hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-blue-400 tracking-wider flex items-center gap-2">
                        <User size={16} /> Perfil Demográfico
                      </h3>
                      <span className="text-xs font-mono text-blue-500/50">{productCategories.demographics.length} atributos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.demographics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-md text-xs capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUCKET 2: Dispositivos */}
                {productCategories.devices.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-900/30 p-4 md:p-5 rounded-xl hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-purple-400 tracking-wider flex items-center gap-2">
                        <Smartphone size={16} /> Ecosistema Tech
                      </h3>
                      <span className="text-xs font-mono text-purple-500/50">{productCategories.devices.length} atributos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.devices.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-200 rounded-md text-xs capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUCKET 3: Comportamiento */}
                {productCategories.behaviors.length > 0 && (
                  <div className="bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-900/30 p-4 md:p-5 rounded-xl hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-emerald-400 tracking-wider flex items-center gap-2">
                        <Activity size={16} /> Hábitos de Uso
                      </h3>
                      <span className="text-xs font-mono text-emerald-500/50">{productCategories.behaviors.length} atributos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.behaviors.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-md text-xs capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUCKET 4: Intereses */}
                {productCategories.interests.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-900/30 p-4 md:p-5 rounded-xl hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-orange-400 tracking-wider flex items-center gap-2">
                        <Target size={16} /> Intereses y Pasiones
                      </h3>
                      <span className="text-xs font-mono text-orange-500/50">{productCategories.interests.length} atributos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.interests.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded-md text-xs capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUCKET 5: Los Data Brokers - Abarca ambas columnas en desktop */}
                {productCategories.hidden.length > 0 && (
                  <div className="lg:col-span-2 mt-2 pt-4 border-t border-red-900/30 bg-gradient-to-b from-red-950/20 to-black/40 px-4 md:px-6 py-5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye size={18} className="text-red-500 animate-pulse" />
                        <h3 className="text-sm md:text-base font-bold text-red-400 tracking-wide uppercase">
                          Red de Data Brokers (Ids Ocultos)
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-red-500/50">{productCategories.hidden.length} identificadores</span>
                    </div>
                    <p className="text-xs text-red-300/70 mb-4 max-w-3xl">
                      Estos hashes encriptados te vinculan en tiempo real con anunciantes externos (Meta, Google, Amazon). Venden tu perfil anonimizado como "inventario" para subastas publicitarias sin revelar tu correo.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                      {productCategories.hidden.map((t, i) => (
                        <div key={i} className="px-2 py-1.5 bg-black border border-red-900/50 text-red-400/80 rounded text-[10px] font-mono select-all truncate hover:text-red-300 hover:border-red-500/80 transition-colors cursor-crosshair" title={t}>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                    <CorporateInsight
                      title="Data Brokering y Publicidad Programática"
                      description="Este es el verdadero producto de Spotify. No eres el cliente, eres el inventario. Estas etiquetas se empaquetan de forma anónima y se cruzan con Meta (Facebook) y Google. Si dice 'interest business', significa que tu perfil fue subastado a empresas B2B en tiempo real mientras escuchabas un podcast."
                    />
                  </Card>
                </motion.div>

                {/* Marquee */}
                {marquee.length > 0 && (
                  <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader icon={<Heart size={20} />} title="Segmentos de Audiencia (Marquee)" color="text-rose-400" />
                      <p className="text-xs text-gray-500 mb-3">Spotify clasifica tu relación con estos artistas para campañas de marketing:</p>
                      <div className="flex flex-wrap gap-2">
                        {marquee.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-full text-sm">
                            <span className="text-white">{m.artistName}</span>
                            <span className="text-gray-500 ml-1 text-xs">({m.segment})</span>
                          </span>
                        ))}
                      </div>
                      <CorporateInsight
                        title="Funnels de Retención de Artistas"
                        description="Los segmentos (Lapsed, Active, Potential) indican cómo te ven las disqueras. 'Marquee' es un servicio donde los artistas le pagan a Spotify para aparecer en tu pantalla. Spotify cobra a los músicos por el privilegio de recuperar TU atención basándose en estos datos."
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Resumen de valor comercial */}
                <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3">
                  <Card>
                    <CardHeader icon={<ShieldOff size={20} />} title="Tu Valor Como Producto" color="text-red-500" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                      <ValueMetric label="Datos de perfil" value={Object.keys(userData).length + Object.keys(identity).length} unit="campos" />
                      <ValueMetric label="Inferencias publicitarias" value={rawInferences.length} unit="etiquetas" />
                      <ValueMetric label="Historial rastreable" value={musicHistory.length + podcastHistory.length + searchQueries.length} unit="registros" />
                      <ValueMetric label="Segmentos Marquee" value={marquee.length} unit="segmentos" />
                    </div>
                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 md:p-5">
                      <p className="text-sm text-red-200/80 leading-relaxed font-mono">
                        <span className="text-red-400 font-bold">&gt; RESUMEN_EJECUTIVO.txt</span><br /><br />
                        Spotify tiene <span className="text-white font-semibold">{(musicHistory.length + podcastHistory.length).toLocaleString()}</span> registros de tu actividad,{' '}
                        <span className="text-white font-semibold">{rawInferences.length}</span> etiquetas publicitarias sobre ti,{' '}
                        <span className="text-white font-semibold">{searchQueries.length}</span> búsquedas que revelan tus deseos más íntimos, y un perfil emocional completo que clasifica tu melancolía, tu euforia y tus horas de vulnerabilidad.<br /><br />
                        Todo esto se procesa, se empaqueta y se vende — no como "tus datos", sino como "audiencias segmentadas" — a anunciantes que pagan en subastas de milisegundos mientras tú escuchas tu playlist favorita.<br /><br />
                        <span className="text-red-400">Tú no eres el cliente de Spotify. Eres el producto.</span>
                      </p>
                    </div>
                  </Card>
                </motion.div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10 md:mt-12 pt-6 border-t border-gray-800/50 text-center">
        <p className="text-xs text-gray-600 mb-1">Tus datos nunca abandonaron tu navegador. 100% local, 0% servidor.</p>
        <p className="text-xs text-gray-700">Algorithmic Mirror — {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

/** Fila de dato de perfil */
function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

/** Lista estructurada de top canciones con rank, nombre, artista y barra */
function TopTracksList({ tracks }: { tracks: { name: string; artist: string; hours: number }[] }) {
  const max = Math.max(...tracks.map(t => t.hours), 1);
  return (
    <div className="max-h-[400px] md:max-h-[520px] overflow-y-auto pr-1 space-y-2">
      {tracks.map((t, i) => (
        <div key={i} className="flex items-center gap-3 group">
          <span className="text-xs font-mono text-gray-600 w-5 shrink-0 text-right">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-100 truncate">{t.name}</p>
            <p className="text-xs text-gray-500 truncate">{t.artist}</p>
            <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${(t.hours / max) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-yellow-400 font-semibold shrink-0">{t.hours}h</span>
        </div>
      ))}
    </div>
  );
}

/** Métrica de valor comercial */
function ValueMetric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-3 md:p-4 text-center">
      <p className="text-xl md:text-2xl font-bold text-red-400">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{unit}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

/** Intro de capítulo según la fase activa */
function ChapterIntro({ phase }: { phase: string }) {
  const chapters: Record<string, { num: string; title: string; subtitle: string; color: string; border: string }> = {
    espejo: {
      num: 'CAPÍTULO I',
      title: 'El Espejo',
      subtitle: 'Tu identidad y consumo. Datos amigables que bajan tu guardia.',
      color: 'text-spotify',
      border: 'border-spotify/20',
    },
    psicologo: {
      num: 'CAPÍTULO II',
      title: 'El Psicólogo',
      subtitle: 'Tus patrones, emociones y rutinas. Spotify sabe cuándo ríes y cuándo lloras.',
      color: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    espia: {
      num: 'CAPÍTULO III',
      title: 'El Espía',
      subtitle: 'Tus búsquedas secretas, tus bloqueos, tu huella financiera. Lo que no querías que nadie viera.',
      color: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
    producto: {
      num: 'CAPÍTULO IV',
      title: 'El Producto Eres Tú',
      subtitle: 'Tu perfil empaquetado, etiquetado y vendido al mejor postor. El golpe final.',
      color: 'text-red-400',
      border: 'border-red-500/20',
    },
  };

  const ch = chapters[phase];
  if (!ch) return null;

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`border-l-2 ${ch.border} pl-4 md:pl-5 mb-2`}
    >
      <p className={`text-xs font-mono tracking-widest ${ch.color} mb-1`}>{ch.num}</p>
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">{ch.title}</h2>
      <p className="text-xs md:text-sm text-gray-500 mt-1">{ch.subtitle}</p>
    </motion.div>
  );
}