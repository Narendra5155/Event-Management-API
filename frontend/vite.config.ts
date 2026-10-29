import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    server: {
      port: 5173,
      // Proxying keeps the API same-origin in dev, so HTTP-only cookies just work.
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:5050', changeOrigin: true },
      },
    },
  }
})
