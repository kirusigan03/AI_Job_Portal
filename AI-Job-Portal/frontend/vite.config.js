import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    // The API gateway's CORS config only allows http://localhost:5173,
    // so the dev server must stay on this port.
    port: 5173,
    strictPort: true,
  },
})
