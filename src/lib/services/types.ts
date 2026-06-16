import type { Address } from 'viem'
import type { TokenInfo } from '@/config/tokens'

// ---------------------------------------------------------------------------
// Domain model shared by the game + finance layers.
// "Field" = a Topaz gauge/pool you can farm. "Plot" = a player's position in a
// field (see store/farm). Protocol data is REAL (Topaz); player data is mocked
// through the farm data layer until a funded wallet flow is wired.
// ---------------------------------------------------------------------------

export type PoolType = 'v2-volatile' | 'v2-stable' | 'v3-cl'

export interface ProtocolSummary {
  tvlUsd: number
  v2TvlUsd: number
  v3TvlUsd: number
  volume24hUsd: number
  fees24hUsd: number
  topazPriceUsd: number
  activeGaugeCount: number
  totalLockedTopaz: number
  currentEpochStartIso: string
  snapshotAtIso: string
}

export interface FieldInfo {
  gaugeAddress: string
  poolAddress: string
  poolType: PoolType
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  tvlUsd: number
  stakedTvlUsd: number
  totalApr: number
  emissionApr: number
  feeApr: number
  bribeApr: number
  /** 0..1 risk score derived from pool type + APR volatility heuristics. */
  riskScore: number
}

export interface TokenPriceInfo {
  address: string
  symbol: string
  decimals: number
  priceUsd: number
}

export interface SwapRouteLeg {
  from: Address
  to: Address
  stable: boolean
  factory: Address
}

export interface SwapQuoteResult {
  amountIn: bigint
  amountOut: bigint
  amountOutFormatted: string
  rate: number
  routeLabel: string
  routes: SwapRouteLeg[]
}

export interface BuiltTx {
  to: Address
  data: `0x${string}`
  value: string
  description: string
}

export interface DexService {
  getProtocol(): Promise<ProtocolSummary>
  getFields(): Promise<FieldInfo[]>
  getTokenPrices(): Promise<TokenPriceInfo[]>
  quoteSwap(
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountInHuman: string,
  ): Promise<SwapQuoteResult>
}
