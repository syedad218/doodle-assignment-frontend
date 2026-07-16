import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      include: ['src/**'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/types/**', 'src/vite-env.d.ts'],
      reporter: ['text', 'json-summary'],
    },
  },
})
