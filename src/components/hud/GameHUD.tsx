'use client'

import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { levelForValue } from '@/lib/game/progression'
import { usdCompact, shortAddress } from '@/lib/format'
import { Button } from '../ui/Button'

export function GameHUD() {
  const { wallet, viewMode, darkMode, toggleDarkMode, setViewMode, setWalletPickerOpen, setPortfolioOpen, disconnect } =
    useGameStore()
  const portfolio = useFarmStore((s) => s.totalPortfolioValue())
  const claimable = useFarmStore((s) => s.totalClaimable())
  const { current, next, progress } = levelForValue(portfolio)

  return (
    <header className="panel flex flex-wrap items-center gap-3 px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-2.5">
        <span className="animate-sway text-3xl">🌾</span>
        <div className="leading-tight">
          <h1 className="font-pixel text-[13px] text-grass-dark sm:text-[15px]">Epoch Acres</h1>
          <p className="hidden text-[11px] text-soft sm:block">Farm the Topaz ve(3,3) DEX</p>
        </div>
      </div>

      {/* View toggle: Game ↔ Finance */}
      <div className="ml-1 flex rounded-full border-2 border-[var(--panel-line)] p-0.5">
        {(['game', 'finance'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize transition ${
              viewMode === m ? 'bg-grass text-white' : 'text-soft'
            }`}
          >
            {m === 'game' ? '🎮 Game' : '📊 Finance'}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Stats */}
      {wallet && (
        <div className="hidden items-center gap-4 md:flex">
          <HudStat label="Farm value" value={usdCompact(portfolio)} icon="🏡" />
          <button onClick={() => setPortfolioOpen(true)} className="text-left">
            <HudStat label="Claimable" value={usdCompact(claimable)} icon="🪙" highlight={claimable > 0} />
          </button>
          <div className="min-w-[150px]">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>{current.emoji} {current.title}</span>
              <span className="text-soft">{next ? `→ ${next.title}` : 'max'}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-wheat to-wheat-dark" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggleDarkMode}
        className="grid size-9 place-items-center rounded-full border-2 border-[var(--panel-line)] text-lg"
        aria-label="Toggle dark mode"
        title="Toggle day / night"
      >
        {darkMode ? '🌙' : '☀️'}
      </button>

      {wallet ? (
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-grass/20 text-lg" title="Player avatar">🧑‍🌾</span>
          <Button variant="ghost" onClick={() => disconnect()} title={wallet.address}>
            <span className="size-2 rounded-full bg-green-500" />
            {shortAddress(wallet.address)}
          </Button>
        </div>
      ) : (
        <Button variant="primary" onClick={() => setWalletPickerOpen(true)}>
          🔑 Connect Wallet
        </Button>
      )}
    </header>
  )
}

function HudStat({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className="leading-tight">
      <div className="text-[10px] font-bold uppercase tracking-wide text-soft">{label}</div>
      <div className={`text-sm font-extrabold ${highlight ? 'text-wheat-dark' : ''}`}>
        {icon} {value}
      </div>
    </div>
  )
}
