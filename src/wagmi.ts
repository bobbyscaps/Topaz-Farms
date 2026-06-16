import { http, createConfig } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { RPC_URL } from './config/topaz'

// Wallet + chain wiring for BNB Chain. Uses the injected connector (MetaMask,
// Rabby, Trust, etc.) and the dev-proxied RPC so reads work without CORS pain.
export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(RPC_URL),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
