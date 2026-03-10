// ==========================================
// Tipos para TODOS los JSON de Spotify
// ==========================================

// --- StreamingHistory ---
export interface StreamingHistoryMusic {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export interface StreamingHistoryPodcast {
  endTime: string;
  podcastName: string;
  episodeName: string;
  msPlayed: number;
}

// --- Perfil ---
export interface UserData {
  username?: string;
  email?: string;
  country?: string;
  createdFromFacebook?: boolean;
  facebookUid?: string;
  birthdate?: string;
  gender?: string;
  postalCode?: string | null;
  mobileNumber?: string | null;
  mobileOperator?: string | null;
  mobileBrand?: string | null;
  creationTime?: string;
}

export interface Identity {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  largeImageUrl?: string;
  tasteMaker?: boolean;
  verified?: boolean;
}

// --- Social ---
export interface Follow {
  userIsFollowing?: string[];
  userIsFollowedBy?: string[];
  userIsBlocking?: string[];
}

// --- Inferencias ---
export interface Inferences {
  inferences: string[];
}

// --- Búsquedas ---
export interface SearchQuery {
  platform: string;
  searchTime: string;
  searchQuery: string;
  searchInteractionURIs?: string[];
}

// --- Playlists ---
export interface PlaylistTrack {
  track: {
    trackName: string;
    artistName: string;
    albumName: string;
    trackUri: string;
  };
  addedDate: string;
}

export interface Playlist {
  name: string;
  lastModifiedDate: string;
  description?: string;
  numberOfFollowers: number;
  collaborators?: string[];
  items: PlaylistTrack[];
}

export interface PlaylistData {
  playlists: Playlist[];
}

// --- Biblioteca ---
export interface YourLibrary {
  tracks?: { artist: string; album: string; track: string; uri: string }[];
  albums?: { artist: string; album: string; uri: string }[];
  shows?: { name: string; publisher: string; uri: string }[];
  episodes?: { name: string; show: string; uri: string }[];
  bannedTracks?: unknown[];
  artists?: { name: string; uri: string }[];
}

// --- Marquee ---
export interface MarqueeItem {
  artistName: string;
  segment: string;
}

// --- Pagos ---
export interface Payments {
  payment_method?: string;
}

// --- Podcasts ---
export interface PodcastRatedShow {
  showName: string;
  rating: number;
  ratedAt: string;
}

// --- Wrapped ---
export interface Wrapped {
  topArtists?: {
    topArtistUris?: string[];
    numUniqueArtists?: number;
    topNPercentileFan?: number;
    topArtistMsPlayed?: number;
  };
  topTracks?: {
    topTracks?: { trackUri: string; count: number; msPlayed: number }[];
    numUniqueTracks?: number;
  };
  topGenres?: {
    topGenres?: string[];
    totalNumGenres?: number;
  };
  topAlbums?: {
    topAlbums?: string[];
    numCompletedAlbums?: number;
    topAlbumTimePlayed?: number;
  };
  topPodcasts?: {
    topPodcastsUri?: string[];
    topPodcastMilliseconds?: number;
    totalPodcastMilliseconds?: number;
  };
  yearlyMetrics?: {
    totalMsListened?: number;
  };
  listeningAge?: {
    listeningAge?: number;
    windowStartYear?: number;
    decadePhase?: string;
  };
  party?: {
    avgTrackPopularityScore?: number;
    percentListenedNight?: number;
    totalNumListeningMinutes?: number;
    totalNumListeningDays?: number;
    streakNumListeningDays?: number;
    numArtistsDiscovered?: number;
    percentChillTracks?: number;
    percentSadTracks?: number;
    percentLoveTracks?: number;
    percentPartyTracks?: number;
  };
  clubs?: {
    userClub?: string;
    percentInClub?: number;
    role?: string;
  };
}

// --- Sound Capsule ---
export interface SoundCapsuleStat {
  date: string;
  streamCount: number;
  secondsPlayed: number;
  topTracks?: { name: string; streamCount: number; secondsPlayed: number }[];
  topArtists?: { name: string; streamCount: number; secondsPlayed: number }[];
}

export interface YourSoundCapsule {
  stats: SoundCapsuleStat[];
}

// --- Identificadores ---
export interface Identifiers {
  identifierType?: string;
  identifierValue?: string;
}

// --- Duo ---
export interface DuoNewFamily {
  address?: string;
}

// ==========================================
// Estructura maestra con TODOS los datos
// ==========================================
export interface SpotifyData {
  // Historial
  StreamingHistory_music?: StreamingHistoryMusic[];
  StreamingHistory_podcast?: StreamingHistoryPodcast[];
  // Perfil
  Userdata?: UserData;
  Identity?: Identity;
  Identifiers?: Identifiers;
  DuoNewFamily?: DuoNewFamily;
  // Social
  Follow?: Follow;
  // Inferencias
  Inferences?: Inferences;
  // Búsquedas
  SearchQueries?: SearchQuery[];
  // Playlists y biblioteca
  Playlist?: PlaylistData;
  YourLibrary?: YourLibrary;
  // Marquee y pagos
  Marquee?: MarqueeItem[];
  Payments?: Payments;
  // Podcasts
  PodcastInteractivityRatedShow?: { ratedShows?: PodcastRatedShow[] };
  // Wrapped
  Wrapped?: Wrapped;
  // Sound Capsule
  YourSoundCapsule?: YourSoundCapsule;
  // Catch-all
  [key: string]: unknown;
}
