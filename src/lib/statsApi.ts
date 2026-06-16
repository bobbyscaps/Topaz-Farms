import { STATS_API_BASE } from '../config/topaz'

// The Topaz public Stats API wraps everything in { ok, data, meta }.
interface Envelope<T> {
  ok: boolean
  data: T
  meta?: Record<string, unknown>
}

export interface ProtocolStats {
  tvlUsd: string
  v2TvlUsd: string
  v3TvlUsd: string
  volume24hUsd: string
  volume7dUsd: string
  fees24hUsd: string
  fees7dUsd: string
  cumulativeVolumeUsd: string
  cumulativeFeesUsd: string
  poolCount: number
  activeGaugeCount: number
  topazPriceUsd: string
  totalLockedTopaz: string
  currentEpochStart: string
  snapshotAt: string
}

export interface Gauge {
  gaugeAddress: string
  poolAddress: string
  poolType: 'v2-volatile' | 'v2-stable' | 'v3-cl'
  alive: boolean
  stakedTvlUsd: string
  emissionsAnnualizedUsd: string
  emissionApr: string
  feeApr: string
  bribeApr: string
  totalApr: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  tvlUsd: string
}

export interface TokenPrice {
  address: string
  symbol: string
  decimals: number
  priceUsd: string
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${STATS_API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Topaz Stats API ${path} failed: ${res.status}`)
  }
  const body = (await res.json()) as Envelope<T>
  if (!body.ok) throw new Error(`Topaz Stats API ${path} returned ok=false`)
  return body.data
}

export const fetchProtocolStats = () => getJson<ProtocolStats>('/protocol')
export const fetchGauges = () => getJson<Gauge[]>('/gauges')
export const fetchTokenPrices = () => getJson<TokenPrice[]>('/tokens')
