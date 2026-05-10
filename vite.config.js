/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = env.VITE_BASE || '/'
  if (base !== '/' && !base.endsWith('/')) base = `${base}/`

  return {
    base,
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
    server: {
      proxy: {
        '/api/deepseek': {
          target: 'https://api.deepseek.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
        },
      },
    },
  }
})
