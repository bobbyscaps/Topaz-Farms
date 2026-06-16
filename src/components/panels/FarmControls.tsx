'use client'

import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { ACTION_TRANSLATIONS } from '@/lib/game/translation'
import { usdCompact } from '@/lib/format'

interface Control {
  key: string
  emoji: string
  label: string
  hint: string
  run: () => void
}

export function FarmControls() {
  const { wallet, selectedPlotId, openModal, setPortfolioOpen, setWalletPickerOpen, notify } = useGameStore()
  const plots = useFarmStore((s) => s.plots)
  const claimable = useFarmStore((s) => s.totalClaimable())

  const requireWallet = (fn: () => void) => () => {
    if (!wallet) {
      setWalletPickerOpen(true)
      return
    }
    fn()
  }

  const pickPlot = (action: 'water') => () => {
    const plotId = selectedPlotId ?? plots[0]?.id
    if (!plotId) {
      notify({ emoji: '🪴', title: 'Plant a crop first', detail: 'You need a plot before you can water it.', tone: 'info' })
      return
    }
    openModal({ action, plotId })
  }

  const controls: Control[] = [
    { key: 'plant', emoji: '🌱', label: 'Plant', hint: 'Provide liquidity', run: requireWallet(() => openModal({ action: 'plant' })) },
    { key: 'water', emoji: '💧', label: 'Water', hint: 'Vote gauges', run: requireWallet(pickPlot('water')) },
    { key: 'harvest', emoji: '🧺', label: 'Harvest', hint: 'Claim rewards', run: requireWallet(() => openModal({ action: 'harvest' })) },
    { key: 'governance', emoji: '🧪', label: 'Governance', hint: 'Fertilizer & bribes', run: requireWallet(() => openModal({ action: 'fertilize' })) },
    { key: 'upgrade', emoji: '🏗️', label: 'Upgrade', hint: 'Levels & dashboard', run: requireWallet(() => setPortfolioOpen(true)) },
  ]

  return (
    <aside className="panel flex flex-col gap-2 p-3">
      <h2 className="font-pixel text-[11px] text-soil-dark dark:text-wheat">Farm Tools</h2>
      <p className="text-[11px] text-soft">Every tool maps to a real Topaz action.</p>

      <div className="mt-1 flex flex-col gap-2">
        {controls.map((c) => (
          <button
            key={c.key}
            onClick={c.run}
            className="group flex items-center gap-3 rounded-2xl border-2 border-[var(--panel-line)] bg-black/[0.02] px-3 py-2.5 text-left transition hover:border-grass hover:bg-grass/10 dark:bg-white/[0.03]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--panel)] text-xl shadow-sm transition group-hover:scale-110">
              {c.emoji}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold">{c.label}</span>
              <span className="block text-[11px] text-soft">{c.hint}</span>
            </span>
          </button>
        ))}
      </div>

      {wallet && claimable > 0 && (
        <div className="mt-2 rounded-2xl border-2 border-wheat-dark/40 bg-wheat/20 p-3 text-center">
          <div className="text-[11px] font-bold text-soft">Ready to harvest</div>
          <div className="text-lg font-extrabold text-wheat-dark">{usdCompact(claimable)}</div>
        </div>
      )}

      <div className="mt-auto rounded-2xl bg-black/[0.03] p-2.5 text-[10px] leading-relaxed text-soft dark:bg-white/[0.04]">
        <div className="font-bold">🔎 How it works</div>
        {Object.values(ACTION_TRANSLATIONS).slice(0, 3).map((t) => (
          <div key={t.game} className="mt-1">{t.emoji} {t.game} = {t.blockchain.toLowerCase()}</div>
        ))}
      </div>
    </aside>
  )
}
