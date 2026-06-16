'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TranslationCard } from '../ui/TranslationCard'
import { ACTION_TRANSLATIONS } from '@/lib/game/translation'
import { usdCompact } from '@/lib/format'

export function HarvestModal({ plotId, onClose }: { plotId?: string; onClose: () => void }) {
  const notify = useGameStore((s) => s.notify)
  const plots = useFarmStore((s) => s.plots)
  const harvestPlot = useFarmStore((s) => s.harvestPlot)
  const harvestAll = useFarmStore((s) => s.harvestAll)

  const plot = plotId ? plots.find((p) => p.id === plotId) : undefined
  const total = plot
    ? plot.pendingRewardsUsd
    : plots.reduce((s, p) => s + p.pendingRewardsUsd, 0)
  const [celebrating, setCelebrating] = useState(false)

  function confirm() {
    const harvested = plot ? harvestPlot(plot.id) : harvestAll()
    if (harvested <= 0) return
    setCelebrating(true)
    notify({
      emoji: '🧺',
      title: `Harvested ${usdCompact(harvested)}`,
      detail: 'Claimed emissions, fees & bribes — straight to your barn!',
      tone: 'success',
    })
    setTimeout(onClose, 1100)
  }

  return (
    <Modal open onClose={onClose} title="Harvest Rewards" emoji="🧺" maxWidth="max-w-lg">
      <TranslationCard t={ACTION_TRANSLATIONS.harvest} />

      <div className="relative mt-3 grid place-items-center overflow-hidden rounded-2xl border-2 border-wheat-dark/40 bg-wheat/15 p-5">
        <AnimatePresence>
          {celebrating &&
            Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xl"
                style={{ left: `${10 + (i * 80) / 14}%`, bottom: '20%' }}
                initial={{ y: 0, opacity: 1, scale: 0.6 }}
                animate={{ y: -120, opacity: 0, scale: 1.2, rotate: 180 }}
                transition={{ duration: 1, delay: i * 0.04 }}
              >
                🪙
              </motion.span>
            ))}
        </AnimatePresence>
        <div className="text-[11px] font-bold uppercase text-soft">
          {plot ? `${plot.field.token0Symbol}/${plot.field.token1Symbol}` : 'All plots'} · claimable
        </div>
        <div className="text-3xl font-extrabold text-wheat-dark">{usdCompact(total)}</div>
      </div>

      {!plot && (
        <div className="mt-3 max-h-40 overflow-y-auto thin-scroll rounded-2xl border-2 border-[var(--panel-line)] p-2">
          {plots.filter((p) => p.pendingRewardsUsd > 0).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-1 py-1 text-sm">
              <span className="font-semibold">{p.field.token0Symbol}/{p.field.token1Symbol}</span>
              <span className="font-bold text-wheat-dark">{usdCompact(p.pendingRewardsUsd)}</span>
            </div>
          ))}
          {total <= 0 && <div className="p-2 text-center text-sm text-soft">Nothing ripe yet — water your plots to grow rewards.</div>}
        </div>
      )}

      <Button variant="wheat" className="mt-4 w-full" disabled={total <= 0 || celebrating} onClick={confirm}>
        🧺 {plot ? 'Harvest this plot' : 'Harvest everything'} · {usdCompact(total)}
      </Button>
    </Modal>
  )
}
