import { useState, useCallback } from 'react';
import { UploadCloud, ShieldCheck, Lock, WifiOff, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseUploadedFiles, parseZipFile } from '../utils/dataParser';
import type { SpotifyData } from '../types/spotify';

interface Props {
  onDataLoaded: (data: SpotifyData) => void;
}

export default function Landing({ onDataLoaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsLoading(true);
    const fileArray = Array.from(files);
    
    // Check if there is a ZIP file
    const zipFile = fileArray.find(f => f.name.toLowerCase().endsWith('.zip'));

    try {
      let data: SpotifyData;
      
      if (zipFile) {
        // If it's a zip file, parse it directly
        setFileCount(1); // or we could count inner files, but 1 zip is fine for UI initially
        data = await parseZipFile(zipFile, (count) => setFileCount(count));
      } else {
        // Fallback to multiple JSON files
        const jsonFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.json'));
        setFileCount(jsonFiles.length);

        const dt = new DataTransfer();
        jsonFiles.forEach(f => dt.items.add(f));
        data = await parseUploadedFiles(dt.files);
      }

      // Pausa dramática para que la gente vea el loading
      setTimeout(() => {
        setIsLoading(false);
        onDataLoaded(data);
      }, 1500);

    } catch (error) {
      console.error("Error processing files:", error);
      setIsLoading(false);
      // Podríamos agregar un estado de error, por ahora solo console log
      alert("Hubo un error procesando los archivos. Por favor, revisa el archivo ZIP o los JSON.");
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 text-center relative overflow-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-spotify/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-spotify/10 border border-spotify/20 flex items-center justify-center"
        >
          <FileJson className="w-8 h-8 text-spotify" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Conoce tu{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(to right, #1DB954, #34d399)' }}
          >
            Reflejo Algorítmico
          </span>
        </h1>
        <p className="text-gray-400 mb-6 md:mb-10 text-base md:text-lg max-w-lg mx-auto">
          Descubre qué sabe Spotify de ti: tu perfil emocional, tus búsquedas secretas,
          las etiquetas que te definen para los anunciantes, y mucho más.
        </p>

        {/* Zona de Drop */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="border-2 border-spotify/30 bg-spotify/5 rounded-2xl p-8 md:p-16 flex flex-col items-center"
            >
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-spotify/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-t-2 border-spotify animate-spin" />
              </div>
              <p className="text-lg md:text-xl font-medium text-white mb-2">Descifrando tu huella digital...</p>
              <p className="text-sm text-gray-500">{fileCount} archivos procesándose localmente</p>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-14 transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-spotify bg-spotify/10 scale-[1.02]'
                  : 'border-gray-700 bg-darkCard hover:border-gray-500'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <UploadCloud className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-spotify' : 'text-gray-500'}`} />
              <p className="text-lg md:text-xl mb-2 font-medium text-gray-200">
                Arrastra tu archivo .zip aquí
              </p>
              <p className="text-sm text-gray-500 mb-4 md:mb-6">
                Sube directamente el .zip original de Spotify (o múltiples archivos .json)
              </p>

              <label className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-gray-200 transition-colors">
                Seleccionar Archivo
                <input
                  type="file"
                  multiple
                  accept=".json,.zip,application/zip,application/x-zip-compressed"
                  className="hidden"
                  onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges de privacidad */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500"
        >
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-spotify" /> 100% privado
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-spotify" /> Cero servidores
          </span>
          <span className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-spotify" /> Funciona sin internet
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}