'use client'

import { useMemo } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { mockVotingPower } from '@/lib/services/mockFarm'

// The well that holds your veTOPAZ voting power. "Watering" plots draws from it.
export function VotingWell() {
  const wallet = useGameStore((s) => s.wallet)
  const used = useFarmStore((s) => s.totalVotePower())
  const total = useMemo(() => (wallet ? mockVotingPower(wallet.address) : 0), [wallet])
  const remaining = Math.max(0, total - used)
  const usedPct = total > 0 ? Math.min(100, (used / total) * 100) : 0

  return (
    <div className="rounded-2xl border-2 border-sky-400/40 bg-sky-400/10 p-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1 text-sm font-extrabold">⛲ Voting Well</h3>
        <span className="text-[11px] text-soft">veTOPAZ</span>
      </div>
      <div className="mt-1 text-2xl font-extrabold text-sky-600 dark:text-sky-300">
        {remaining.toLocaleString()}
      </div>
      <div className="text-[11px] text-soft">water available · {total.toLocaleString()} total power</div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-sky-500" style={{ width: `${usedPct}%` }} />
      </div>
      <div className="mt-1 text-right text-[10px] text-soft">{usedPct.toFixed(0)}% poured into plots</div>
    </div>
  )
}
