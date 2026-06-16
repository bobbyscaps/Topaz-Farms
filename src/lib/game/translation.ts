import type { PoolType } from '@/lib/services/types'

// Plot lifecycle. Maps to how mature a liquidity position is (time staked +
// rewards accrued). Purely visual; never gates real value.
export type PlotStage =
  | 'empty'
  | 'seeded'
  | 'growing'
  | 'blooming'
  | 'harvest-ready'

export const PLOT_STAGE_META: Record<
  PlotStage,
  { label: string; emoji: string; growth: number }
> = {
  empty: { label: 'Fallow', emoji: '🟫', growth: 0 },
  seeded: { label: 'Seeded', emoji: '🌱', growth: 0.2 },
  growing: { label: 'Growing', emoji: '🌿', growth: 0.5 },
  blooming: { label: 'Blooming', emoji: '🌼', growth: 0.8 },
  'harvest-ready': { label: 'Harvest ready', emoji: '🌾', growth: 1 },
}

export const POOL_TYPE_LABEL: Record<PoolType, string> = {
  'v2-volatile': 'v2 · volatile',
  'v2-stable': 'v2 · stable',
  'v3-cl': 'v3 · concentrated',
}

// The heart of the product: every game action declares its real DeFi mapping so
// the UI can always show Game → Blockchain → Result.
export interface ActionTranslation {
  game: string
  emoji: string
  blockchain: string
  result: string
  contract: string
}

export const ACTION_TRANSLATIONS = {
  plant: {
    game: 'Plant a crop',
    emoji: '🌱',
    blockchain: 'Provide liquidity to a Topaz pool (mint an LP position)',
    result: 'Position starts earning swap fees + TOPAZ emissions',
    contract: 'Router / NonfungiblePositionManager',
  },
  water: {
    game: 'Water your plots',
    emoji: '💧',
    blockchain: 'Allocate veTOPAZ voting power to the pool’s gauge',
    result: 'Directs emissions here and earns you this pool’s fees + bribes',
    contract: 'Voter.vote()',
  },
  fertilize: {
    game: 'Spread fertilizer',
    emoji: '🧪',
    blockchain: 'Vote toward a pool carrying external bribes / incentives',
    result: 'Claim the bribe rewards posted by projects for your votes',
    contract: 'Voter.vote() → BribeVotingReward',
  },
  harvest: {
    game: 'Harvest the field',
    emoji: '🧺',
    blockchain: 'Claim staked emissions, trading fees, bribes and rebase',
    result: 'Rewards land in your wallet — ready to compound or hold',
    contract: 'Gauge.getReward() / Voter.claimFees() / claimBribes()',
  },
} as const satisfies Record<string, ActionTranslation>

export type ActionKey = keyof typeof ACTION_TRANSLATIONS

// Crop name from a token pair, for extra farm flavor on each plot.
const CROP_NAMES = [
  'Tomatoes', 'Pumpkins', 'Wheat', 'Sunflowers', 'Grapes', 'Berries',
  'Carrots', 'Corn', 'Peppers', 'Squash', 'Melons', 'Barley',
]

export function cropName(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return CROP_NAMES[hash % CROP_NAMES.length]
}

// APR → 1..5 leaf rating used across cards.
export function aprToLeaves(apr: number): number {
  if (!isFinite(apr) || apr <= 0) return 0
  if (apr < 25) return 1
  if (apr < 75) return 2
  if (apr < 200) return 3
  if (apr < 500) return 4
  return 5
}
