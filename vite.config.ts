import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

  base: 'https://multiplayer-whiteboard-production.up.railway.app',

  plugins: [react()],
  resolve: {
    alias: {
      // Uncomment if you need to alias 'crypto' or other Node built-ins
      // 'crypto': 'crypto-browserify',
    },
  },
})
