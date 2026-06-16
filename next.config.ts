import type { NextConfig } from 'next'

// The Topaz Stats API and a public BSC RPC are proxied through Next rewrites so
// the browser only ever talks to same-origin relative paths (no CORS headaches).
// Override via env if you want to point at different upstreams.
const STATS_UPSTREAM =
  process.env.TOPAZ_STATS_UPSTREAM ?? 'https://www.topazdex.com'
const RPC_UPSTREAM =
  process.env.BSC_RPC_UPSTREAM ?? 'https://bsc-dataseed.bnbchain.org'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/stats/:path*', destination: `${STATS_UPSTREAM}/api/stats/:path*` },
      { source: '/rpc', destination: RPC_UPSTREAM },
    ]
  },
}

export default nextConfig
