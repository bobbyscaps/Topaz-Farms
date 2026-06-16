'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore, type WaterIntensity } from '@/store/useFarmStore'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TranslationCard } from '../ui/TranslationCard'
import { WaterAnimation } from '../game/WaterAnimation'
import { ACTION_TRANSLATIONS } from '@/lib/game/translation'
import { pct } from '@/lib/format'

const INTENSITY: { id: WaterIntensity; label: string; votes: number; drops: string }[] = [
  { id: 'small', label: 'Light sprinkle', votes: 2500, drops: '💧' },
  { id: 'medium', label: 'Steady watering', votes: 7500, drops: '💧💧' },
  { id: 'heavy', label: 'Heavy soak', votes: 20000, drops: '💧💧💧' },
]

export function WaterModal({ plotId, onClose }: { plotId?: string; onClose: () => void }) {
  const notify = useGameStore((s) => s.notify)
  const plots = useFarmStore((s) => s.plots)
  const waterPlot = useFarmStore((s) => s.waterPlot)
  const plot = plots.find((p) => p.id === plotId) ?? plots[0]
  const [intensity, setIntensity] = useState<WaterIntensity>('medium')
  const [watering, setWatering] = useState(false)

  function confirm() {
    if (!plot) return
    setWatering(true)
    const votes = INTENSITY.find((i) => i.id === intensity)!.votes
    setTimeout(() => {
      waterPlot(plot.id, intensity)
      notify({
        emoji: '💧',
        title: `Watered ${plot.field.token0Symbol}/${plot.field.token1Symbol}`,
        detail: `Voted ${votes.toLocaleString()} veTOPAZ to its gauge — crops grow faster!`,
        tone: 'success',
      })
      onClose()
    }, 1100)
  }

  return (
    <Modal open onClose={onClose} title="Water Your Plot" emoji="💧" maxWidth="max-w-lg">
      <TranslationCard t={ACTION_TRANSLATIONS.water} />

      {plot ? (
        <div className="relative mt-3 overflow-hidden rounded-2xl border-2 border-sky-400/40 bg-sky-400/10 p-3">
          {watering && <WaterAnimation />}
          <div className="relative z-10 text-sm font-extrabold">
            {plot.field.token0Symbol}/{plot.field.token1Symbol}
          </div>
          <div className="relative z-10 text-[11px] text-soft">
            Current votes: {plot.votePower.toLocaleString()} · Bribe APR {pct(plot.field.bribeApr)}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-soft">Plant a crop first to have a plot to water.</p>
      )}

      <label className="mt-3 block text-xs font-bold uppercase text-soft">Water intensity (vote size)</label>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {INTENSITY.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setIntensity(opt.id)}
            className={`rounded-2xl border-2 p-2 text-center transition ${
              intensity === opt.id ? 'border-sky-500 bg-sky-400/15' : 'border-[var(--panel-line)]'
            }`}
          >
            <div className="text-lg">{opt.drops}</div>
            <div className="text-[11px] font-bold">{opt.label}</div>
            <div className="text-[10px] text-soft">{opt.votes.toLocaleString()} votes</div>
          </button>
        ))}
      </div>

      <Button variant="topaz" className="mt-4 w-full" disabled={!plot || watering} onClick={confirm}>
        {watering ? '💧 Watering…' : '💧 Water the plot'}
      </Button>
    </Modal>
  )
}
