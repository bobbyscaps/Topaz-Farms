'use client'

import { useMemo } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useProtocol } from '@/hooks/useTopaz'
import { mockInventory } from '@/lib/services/mockFarm'
import { usdCompact, num } from '@/lib/format'

export function InventoryBar() {
  const wallet = useGameStore((s) => s.wallet)
  const plots = useFarmStore((s) => s.plots)
  const claimable = useFarmStore((s) => s.totalClaimable())
  const { data: protocol } = useProtocol()

  const inventory = useMemo(
    () => (wallet ? mockInventory(wallet.address, protocol?.topazPriceUsd ?? 0.0039) : []),
    [wallet, protocol?.topazPriceUsd],
  )

  if (!wallet) {
    return (
      <footer className="panel flex items-center justify-center px-4 py-2 text-xs text-soft">
        🎒 Your inventory — connect a wallet to load assets, LP positions and reward stash.
      </footer>
    )
  }

  return (
    <footer className="panel flex items-center gap-3 overflow-x-auto px-3 py-2 thin-scroll">
      <span className="shrink-0 font-pixel text-[10px] text-soil-dark dark:text-wheat">Inventory</span>

      {inventory.map((a) => (
        <Slot key={a.symbol} emoji={a.emoji} title={a.symbol} main={num(a.amount, 2)} sub={usdCompact(a.valueUsd)} />
      ))}

      <Divider />
      <Slot emoji="🌾" title="LP positions" main={String(plots.length)} sub="plots" />
      <Slot emoji="🪙" title="Reward stash" main={usdCompact(claimable)} sub="claimable" highlight={claimable > 0} />
    </footer>
  )
}

function Divider() {
  return <div className="h-8 w-px shrink-0 bg-[var(--panel-line)]" />
}

function Slot({
  emoji,
  title,
  main,
  sub,
  highlight,
}: {
  emoji: string
  title: string
  main: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-[var(--panel-line)] bg-[var(--panel)] px-2.5 py-1.5" title={title}>
      <span className="text-xl">{emoji}</span>
      <div className="leading-tight">
        <div className={`text-sm font-extrabold ${highlight ? 'text-wheat-dark' : ''}`}>{main}</div>
        <div className="text-[10px] text-soft">{sub}</div>
      </div>
    </div>
  )
}
