import { BSC_CHAIN_ID, RPC_URL } from '@/config/topaz'
import type { WalletAccount, WalletConnector } from './types'

// Deterministic "demo farmer" so anyone can explore the full game loop without a
// real wallet. Player data is mocked, protocol data stays real.
const DEMO_ADDRESS = '0xF00DCafe00000000000000000000000000ACRE5'

export const demoConnector: WalletConnector = {
  id: 'demo',
  name: 'Demo Farmer',
  icon: '🧑‍🌾',
  isAvailable: () => true,
  async connect(): Promise<WalletAccount> {
    return { address: DEMO_ADDRESS, chainId: BSC_CHAIN_ID, kind: 'demo' }
  },
  async disconnect() {},
}

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

function getInjected(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum
}

export const injectedConnector: WalletConnector = {
  id: 'injected',
  name: 'Browser Wallet',
  icon: '🦊',
  isAvailable: () => Boolean(getInjected()),
  unavailableReason: 'No browser wallet (MetaMask/Rabby) detected',
  async connect(): Promise<WalletAccount> {
    const provider = getInjected()
    if (!provider) throw new Error('No injected wallet found')
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
    const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string
    return {
      address: accounts[0],
      chainId: parseInt(chainIdHex, 16),
      kind: 'injected',
    }
  },
  async disconnect() {},
}

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// WalletConnect v2. Lazy-loaded so the heavy SDK never touches SSR or the initial
// bundle, and gated behind a project id so it stays optional.
export const walletConnectConnector: WalletConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  icon: '🔗',
  isAvailable: () => Boolean(WC_PROJECT_ID),
  unavailableReason: 'Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable',
  async connect(): Promise<WalletAccount> {
    if (!WC_PROJECT_ID) throw new Error('WalletConnect project id not configured')
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider')
    const provider = await EthereumProvider.init({
      projectId: WC_PROJECT_ID,
      chains: [BSC_CHAIN_ID],
      showQrModal: true,
      rpcMap: { [BSC_CHAIN_ID]: RPC_URL },
    })
    await provider.connect()
    const accounts = provider.accounts
    return {
      address: accounts[0],
      chainId: provider.chainId,
      kind: 'walletconnect',
    }
  },
  async disconnect() {
    if (!WC_PROJECT_ID) return
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider')
    const provider = await EthereumProvider.init({
      projectId: WC_PROJECT_ID,
      chains: [BSC_CHAIN_ID],
      showQrModal: false,
    })
    await provider.disconnect().catch(() => {})
  },
}

export const WALLET_CONNECTORS: WalletConnector[] = [
  demoConnector,
  injectedConnector,
  walletConnectConnector,
]
