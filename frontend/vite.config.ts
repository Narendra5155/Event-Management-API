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
      // Mirrors the /api rewrite in vercel.json, so the app talks to the API on its own origin.
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:5050', changeOrigin: true },
      },
    },
  }
})
