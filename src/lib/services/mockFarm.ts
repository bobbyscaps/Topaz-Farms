import type { FieldInfo } from './types'
import { cropName, type PlotStage } from '@/lib/game/translation'

// ---------------------------------------------------------------------------
// MOCK player-data layer (Deliverable #4).
// Protocol numbers (fields/APRs/prices/TVL) are REAL from Topaz. A funded-wallet
// flow for live positions is the next phase; until then a player's plots are
// generated deterministically from the real fields so the game feels alive and
// internally consistent. Everything here is clearly labelled "simulated".
// ---------------------------------------------------------------------------

export interface Plot {
  id: string
  field: FieldInfo
  cropName: string
  stage: PlotStage
  positionValueUsd: number
  stakedSinceDays: number
  pendingRewardsUsd: number
  /** veTOPAZ voting power directed at this plot's gauge ("water level"). */
  votePower: number
  ilEstimatePct: number
  earnings7d: number[]
  simulated: true
}

// Tiny deterministic PRNG (mulberry32) seeded from a string.
function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAGE_BY_GROWTH: { max: number; stage: PlotStage }[] = [
  { max: 0.2, stage: 'seeded' },
  { max: 0.5, stage: 'growing' },
  { max: 0.8, stage: 'blooming' },
  { max: 1.01, stage: 'harvest-ready' },
]

function stageForGrowth(growth: number): PlotStage {
  return STAGE_BY_GROWTH.find((s) => growth < s.max)?.stage ?? 'harvest-ready'
}

export function makePlot(field: FieldInfo, address: string, growthHint?: number): Plot {
  const rng = seededRng(`${address}:${field.gaugeAddress}`)
  const positionValueUsd = 80 + rng() * 4200
  const stakedSinceDays = Math.round(1 + rng() * 26)
  const growth = growthHint ?? Math.min(1, stakedSinceDays / 28 + rng() * 0.2)
  const dailyYield = (positionValueUsd * (field.totalApr / 100)) / 365
  const pendingRewardsUsd = dailyYield * stakedSinceDays * (0.4 + rng() * 0.6)
  const votePower = Math.round(rng() * 9000)
  const ilEstimatePct =
    field.poolType === 'v2-stable' ? rng() * 0.6 : 0.5 + rng() * 6.5
  const earnings7d = Array.from({ length: 7 }, () => dailyYield * (0.6 + rng() * 0.9))

  return {
    id: field.gaugeAddress,
    field,
    cropName: cropName(`${field.token0Symbol}${field.token1Symbol}`),
    stage: stageForGrowth(growth),
    positionValueUsd,
    stakedSinceDays,
    pendingRewardsUsd,
    votePower,
    ilEstimatePct,
    earnings7d,
    simulated: true,
  }
}

// Seed an initial farm: a handful of the strongest real fields become plots.
export function seedInitialPlots(fields: FieldInfo[], address: string, count = 6): Plot[] {
  return fields.slice(0, count).map((f) => makePlot(f, address))
}

// Mock wallet inventory derived from real token prices where possible.
export interface InventoryAsset {
  symbol: string
  emoji: string
  amount: number
  valueUsd: number
}

export function mockInventory(address: string, topazPriceUsd: number): InventoryAsset[] {
  const rng = seededRng(`${address}:inventory`)
  const topaz = 5000 + rng() * 90000
  const wbnb = 0.2 + rng() * 6
  const usdt = 50 + rng() * 3000
  return [
    { symbol: 'TOPAZ', emoji: '💎', amount: topaz, valueUsd: topaz * topazPriceUsd },
    { symbol: 'WBNB', emoji: '🌻', amount: wbnb, valueUsd: wbnb * 600 },
    { symbol: 'USDT', emoji: '🌽', amount: usdt, valueUsd: usdt },
  ]
}

// Mock veTOPAZ lock (voting power) for the connected farmer.
export function mockVotingPower(address: string): number {
  const rng = seededRng(`${address}:ve`)
  return Math.round(20000 + rng() * 380000)
}
