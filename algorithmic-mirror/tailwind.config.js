/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: '#1DB954', // El verde oficial de Spotify para contrastes
        darkBg: '#0A0A0A',  // Un fondo casi negro para darle impacto
        darkCard: '#18181B', // Tarjetas un poco más claras
      }
    },
  },
  plugins: [],
}