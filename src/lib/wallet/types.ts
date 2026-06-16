export type WalletKind = 'demo' | 'injected' | 'walletconnect'

export interface WalletAccount {
  address: string
  chainId: number
  kind: WalletKind
}

// Abstract wallet connector. New wallets plug in by implementing this — the rest
// of the app never imports a concrete wallet SDK directly.
export interface WalletConnector {
  id: WalletKind
  name: string
  icon: string
  /** Whether this connector can be used in the current environment. */
  isAvailable(): boolean
  /** Optional human hint shown when not available. */
  unavailableReason?: string
  connect(): Promise<WalletAccount>
  disconnect(): Promise<void>
}
