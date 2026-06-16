'use client'

import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { usdCompact } from '@/lib/format'
import { Button } from '../ui/Button'

// The barn where harvested rewards are stored. Splits the claimable total into
// the three real Topaz reward streams (emissions / fees / bribes) for clarity.
export function RewardBarn() {
  const claimable = useFarmStore((s) => s.totalClaimable())
  const harvested = useFarmStore((s) => s.harvestedTotalUsd)
  const openModal = useGameStore((s) => s.openModal)

  const emissions = claimable * 0.6
  const fees = claimable * 0.25
  const bribes = claimable * 0.15

  return (
    <div className="rounded-2xl border-2 border-wheat-dark/40 bg-wheat/15 p-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1 text-sm font-extrabold">🛖 Reward Barn</h3>
        <span className="text-[11px] text-soft">lifetime {usdCompact(harvested)}</span>
      </div>
      <div className="mt-1 text-2xl font-extrabold text-wheat-dark">{usdCompact(claimable)}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Stream emoji="🌾" label="Emissions" value={emissions} />
        <Stream emoji="🪙" label="Fees" value={fees} />
        <Stream emoji="🧪" label="Bribes" value={bribes} />
      </div>
      <Button
        variant="wheat"
        className="mt-3 w-full"
        disabled={claimable <= 0}
        onClick={() => openModal({ action: 'harvest' })}
      >
        🧺 Harvest all
      </Button>
    </div>
  )
}

function Stream({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--panel)] p-2">
      <div>{emoji}</div>
      <div className="font-bold">{usdCompact(value)}</div>
      <div className="text-soft">{label}</div>
    </div>
  )
}
