import { useState } from 'react'
import Landing from './views/Landing'
import Dashboard from './views/Dashboard' // Importamos el nuevo componente
import type { SpotifyData } from './types/spotify'

function App() {
  // Aquí se guarda toda la información de los JSON
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);

  // Función para "Cerrar sesión" y volver a empezar
  const resetData = () => {
    setSpotifyData(null);
  }

  return (
    <main className="font-sans antialiased text-white min-h-screen bg-darkBg">
      {!spotifyData ? (
        // Si NO hay datos, mostramos el Landing
        <Landing onDataLoaded={(data) => setSpotifyData(data)} />
      ) : (
        // Si SÍ hay datos, mostramos el Dashboard y le pasamos la info
        <Dashboard data={spotifyData} onReset={resetData} />
      )}
    </main>
  )
}

export default App