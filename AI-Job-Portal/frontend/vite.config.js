import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (command === 'build' && mode === 'production') {
    const apiUrl = env.VITE_API_BASE_URL?.trim()
    let parsedUrl

    try {
      parsedUrl = new URL(apiUrl)
    } catch {
      throw new Error(
        'Set VITE_API_BASE_URL to the public HTTPS API gateway URL before building for production.',
      )
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const isLoopback =
      hostname === 'localhost' || hostname === '[::1]' || /^127\./.test(hostname)

    if (
      parsedUrl.protocol !== 'https:' ||
      isLoopback ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      throw new Error(
        'VITE_API_BASE_URL must be a public HTTPS URL without embedded credentials for production.',
      )
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      // Keep the dev server on the origin allowed by the local API gateway.
      port: 5173,
      strictPort: true,
    },
  }
})
