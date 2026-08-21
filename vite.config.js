import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        zebra: resolve(rootDir, 'work/zebra/index.html'),
        starwreck: resolve(rootDir, 'work/starwreck/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three'
          if (id.includes('/node_modules/react') || id.includes('/node_modules/scheduler/')) return 'react'
          return undefined
        },
      },
    },
  },
})
