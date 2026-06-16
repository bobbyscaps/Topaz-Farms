import {
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  type Address,
} from 'viem'
import { bsc } from 'viem/chains'
import { routerV2Abi } from '@/lib/abis'
import {
  STATS_API_BASE,
  RPC_URL,
  TOPAZ_ADDRESSES,
} from '@/config/topaz'
import type { TokenInfo } from '@/config/tokens'
import type {
  DexService,
  FieldInfo,
  PoolType,
  ProtocolSummary,
  SwapQuoteResult,
  SwapRouteLeg,
  TokenPriceInfo,
} from './types'

interface Envelope<T> {
  ok: boolean
  data: T
}

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RPC_URL),
})

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${STATS_API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Topaz Stats API ${path} failed: ${res.status}`)
  const body = (await res.json()) as Envelope<T>
  if (!body.ok) throw new Error(`Topaz Stats API ${path} returned ok=false`)
  return body.data
}

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === 'string' ? Number(v) : (v ?? 0)
  return isFinite(n) ? n : 0
}

// Heuristic 0..1 risk score: stables are calm soil, volatile/CL are wilder.
function riskScore(poolType: PoolType, totalApr: number): number {
  const base = poolType === 'v2-stable' ? 0.15 : poolType === 'v2-volatile' ? 0.45 : 0.55
  const aprPenalty = Math.min(0.4, totalApr / 1500)
  return Math.min(1, base + aprPenalty)
}

const F = TOPAZ_ADDRESSES.PoolFactory

function candidateRoutes(from: Address, to: Address): { routes: SwapRouteLeg[]; label: string }[] {
  const wbnb = TOPAZ_ADDRESSES.WBNB
  const direct = (stable: boolean): SwapRouteLeg[] => [{ from, to, stable, factory: F }]
  const candidates = [
    { routes: direct(false), label: 'direct · volatile' },
    { routes: direct(true), label: 'direct · stable' },
  ]
  if (from.toLowerCase() !== wbnb.toLowerCase() && to.toLowerCase() !== wbnb.toLowerCase()) {
    candidates.push({
      routes: [
        { from, to: wbnb, stable: false, factory: F },
        { from: wbnb, to, stable: false, factory: F },
      ],
      label: 'via WBNB · volatile',
    })
  }
  return candidates
}

export const topazService: DexService = {
  async getProtocol(): Promise<ProtocolSummary> {
    const d = await getJson<Record<string, string | number>>('/protocol')
    return {
      tvlUsd: num(d.tvlUsd),
      v2TvlUsd: num(d.v2TvlUsd),
      v3TvlUsd: num(d.v3TvlUsd),
      volume24hUsd: num(d.volume24hUsd),
      fees24hUsd: num(d.fees24hUsd),
      topazPriceUsd: num(d.topazPriceUsd),
      activeGaugeCount: num(d.activeGaugeCount),
      totalLockedTopaz: num(d.totalLockedTopaz),
      currentEpochStartIso: String(d.currentEpochStart),
      snapshotAtIso: String(d.snapshotAt),
    }
  },

  async getFields(): Promise<FieldInfo[]> {
    const rows = await getJson<Record<string, string | number | boolean>[]>('/gauges')
    return rows
      .filter((g) => g.alive && num(g.stakedTvlUsd as string) > 1)
      .map((g) => {
        const poolType = g.poolType as PoolType
        const totalApr = num(g.totalApr as string)
        return {
          gaugeAddress: String(g.gaugeAddress),
          poolAddress: String(g.poolAddress),
          poolType,
          token0Symbol: String(g.token0Symbol),
          token1Symbol: String(g.token1Symbol),
          token0Address: String(g.token0Address),
          token1Address: String(g.token1Address),
          tvlUsd: num(g.tvlUsd as string),
          stakedTvlUsd: num(g.stakedTvlUsd as string),
          totalApr,
          emissionApr: num(g.emissionApr as string),
          feeApr: num(g.feeApr as string),
          bribeApr: num(g.bribeApr as string),
          riskScore: riskScore(poolType, totalApr),
        }
      })
      .sort((a, b) => b.totalApr - a.totalApr)
  },

  async getTokenPrices(): Promise<TokenPriceInfo[]> {
    const rows = await getJson<Record<string, string | number>[]>('/tokens')
    return rows.map((t) => ({
      address: String(t.address),
      symbol: String(t.symbol),
      decimals: num(t.decimals),
      priceUsd: num(t.priceUsd as string),
    }))
  },

  async quoteSwap(tokenIn, tokenOut, amountInHuman): Promise<SwapQuoteResult> {
    const amountIn = parseUnits(amountInHuman || '0', tokenIn.decimals)
    if (amountIn <= 0n) throw new Error('Enter an amount greater than 0')

    const results = await Promise.allSettled(
      candidateRoutes(tokenIn.address, tokenOut.address).map(async ({ routes, label }) => {
        const amounts = (await publicClient.readContract({
          address: TOPAZ_ADDRESSES.Router,
          abi: routerV2Abi,
          functionName: 'getAmountsOut',
          args: [amountIn, routes],
        })) as bigint[]
        return { amounts, routes, label }
      }),
    )

    let best: { amountOut: bigint; routes: SwapRouteLeg[]; label: string } | null = null
    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      const out = r.value.amounts[r.value.amounts.length - 1]
      if (out > 0n && (!best || out > best.amountOut)) {
        best = { amountOut: out, routes: r.value.routes, label: r.value.label }
      }
    }
    if (!best) throw new Error('No Topaz v2 route found for this pair. Try another pair or amount.')

    const amountOutFormatted = formatUnits(best.amountOut, tokenOut.decimals)
    return {
      amountIn,
      amountOut: best.amountOut,
      amountOutFormatted,
      rate: Number(amountOutFormatted) / Number(amountInHuman),
      routeLabel: best.label,
      routes: best.routes,
    }
  },
}

export { publicClient }

// Re-export the token map so callers can pass TokenInfo through the service.
export type { TokenInfo }
