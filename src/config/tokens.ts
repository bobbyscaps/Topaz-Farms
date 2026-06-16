import { getAddress, type Address } from 'viem'
import { TOPAZ_ADDRESSES } from './topaz'

export interface TokenInfo {
  address: Address
  symbol: string
  decimals: number
  /** Emoji "crop" giving each token a farm personality. */
  crop: string
}

export const SWAP_TOKENS: TokenInfo[] = [
  { address: TOPAZ_ADDRESSES.WBNB, symbol: 'WBNB', decimals: 18, crop: '🌻' },
  { address: getAddress('0x55d398326f99059fF775485246999027B3197955'), symbol: 'USDT', decimals: 18, crop: '🌽' },
  { address: getAddress('0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'), symbol: 'USDC', decimals: 18, crop: '🥕' },
  { address: TOPAZ_ADDRESSES.TOPAZ, symbol: 'TOPAZ', decimals: 18, crop: '💎' },
  { address: getAddress('0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'), symbol: 'BTCB', decimals: 18, crop: '🎃' },
  { address: getAddress('0x2170Ed0880ac9A755fd29B2688956BD959F933F8'), symbol: 'ETH', decimals: 18, crop: '🍇' },
  { address: getAddress('0x570A5D26f7765Ecb712C0924E4De545B89fD43dF'), symbol: 'SOL', decimals: 18, crop: '🍑' },
]

const cropByAddress = new Map<string, string>(
  SWAP_TOKENS.map((t) => [t.address.toLowerCase(), t.crop]),
)

const FALLBACK_CROPS = ['🌾', '🥬', '🍅', '🍓', '🌶️', '🧄', '🧅', '🥦', '🫐', '🍐', '🥔', '🌰']

export function cropForToken(address: string, symbol: string): string {
  const known = cropByAddress.get(address.toLowerCase())
  if (known) return known
  let hash = 0
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0
  return FALLBACK_CROPS[hash % FALLBACK_CROPS.length]
}
