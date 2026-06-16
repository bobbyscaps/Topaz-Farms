import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Topaz Stats API and a public BSC RPC are proxied in dev to avoid any
// browser CORS issues. The app always talks to these relative paths, so the
// same code works whether or not the upstreams send permissive CORS headers.
const STATS_UPSTREAM = 'https://www.topazdex.com'
const RPC_UPSTREAM = 'https://bsc-dataseed.bnbchain.org'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/stats': {
        target: STATS_UPSTREAM,
        changeOrigin: true,
        secure: true,
      },
      '/rpc': {
        target: RPC_UPSTREAM,
        changeOrigin: true,
        secure: true,
        rewrite: () => '/',
      },
    },
  },
})
