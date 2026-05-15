import { defineConfig } from 'vite'

export default defineConfig({
  base: '/goodkorea-workspace/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true
  }
})
