import { create } from 'zustand';
import type { SpotifyData } from '../types/spotify';

interface DataState {
  /** Datos de Spotify cargados en RAM */
  data: SpotifyData | null;
  /** Si los datos ya fueron cargados */
  isLoaded: boolean;
  /** Guarda los datos parseados */
  setData: (data: SpotifyData) => void;
  /** Limpia todo y vuelve a la landing */
  reset: () => void;
}

/**
 * Store central con Zustand.
 * Los datos NUNCA salen de la RAM del navegador.
 */
export const useDataStore = create<DataState>((set) => ({
  data: null,
  isLoaded: false,
  setData: (data) => set({ data, isLoaded: true }),
  reset: () => set({ data: null, isLoaded: false }),
}));
