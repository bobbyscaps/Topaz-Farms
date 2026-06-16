'use client'

import { motion } from 'framer-motion'
import type { Plot } from '@/lib/services/mockFarm'
import { cropForToken } from '@/config/tokens'
import { PLOT_STAGE_META } from '@/lib/game/translation'
import { usdCompact, pct } from '@/lib/format'
import { cn } from '@/lib/cn'

export function FarmPlot({
  plot,
  selected,
  onSelect,
}: {
  plot: Plot
  selected: boolean
  onSelect: () => void
}) {
  const { field } = plot
  const stage = PLOT_STAGE_META[plot.stage]
  const crop0 = cropForToken(field.token0Address, field.token0Symbol)
  const crop1 = cropForToken(field.token1Address, field.token1Symbol)
  // Water level (0..1) from accumulated vote power.
  const water = Math.min(1, plot.votePower / 30000)

  return (
    <motion.button
      layout
      onClick={onSelect}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition',
        selected ? 'border-grass ring-4 ring-grass/30' : 'border-[var(--panel-line)]',
      )}
    >
      {/* Soil bed */}
      <div className="relative h-24 bg-[repeating-linear-gradient(90deg,#6b4628_0_14px,#5a3a22_14px_28px)] dark:bg-[repeating-linear-gradient(90deg,#3c2716_0_14px,#2c1c10_14px_28px)]">
        <div className="absolute inset-x-0 bottom-0 h-2 bg-black/25" />
        {/* Growing crops */}
        <div className="absolute inset-0 flex items-end justify-center gap-1 pb-1">
          <motion.span
            className="origin-bottom text-3xl"
            initial={false}
            animate={{ scale: 0.5 + stage.growth * 0.7, opacity: 0.5 + stage.growth * 0.5 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            style={{ filter: 'drop-shadow(0 2px 0 rgba(0,0,0,.25))' }}
          >
            {plot.stage === 'seeded' ? '🌱' : crop0}
          </motion.span>
          {plot.stage !== 'seeded' && (
            <motion.span
              className="origin-bottom text-2xl"
              initial={false}
              animate={{ scale: 0.4 + stage.growth * 0.7 }}
              style={{ filter: 'drop-shadow(0 2px 0 rgba(0,0,0,.25))' }}
            >
              {crop1}
            </motion.span>
          )}
        </div>

        {/* Pending reward sparkle */}
        {plot.pendingRewardsUsd > 0 && (
          <motion.div
            className="absolute right-1.5 top-1.5 rounded-full bg-wheat px-2 py-0.5 text-[10px] font-extrabold text-soil-dark shadow"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            ✨ {usdCompact(plot.pendingRewardsUsd)}
          </motion.div>
        )}

        {/* Stage tag */}
        <div className="absolute left-1.5 top-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold text-white">
          {stage.emoji} {stage.label}
        </div>
      </div>

      {/* Info strip */}
      <div className="flex flex-col gap-1 bg-[var(--panel)] p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold">
            {field.token0Symbol}/{field.token1Symbol}
          </span>
          <span className="text-xs font-extrabold text-grass-dark">{pct(field.totalApr)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-soft">
          <span>{plot.cropName}</span>
          <span>{usdCompact(plot.positionValueUsd)}</span>
        </div>
        {/* Water meter */}
        <div className="flex items-center gap-1" title={`Water level — ${plot.votePower.toLocaleString()} veTOPAZ votes`}>
          <span className="text-[10px]">💧</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-sky-400" style={{ width: `${water * 100}%` }} />
          </div>
        </div>
      </div>
    </motion.button>
  )
}
