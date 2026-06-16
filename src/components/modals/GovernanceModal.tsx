'use client'

import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useFields } from '@/hooks/useTopaz'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TranslationCard } from '../ui/TranslationCard'
import { ACTION_TRANSLATIONS } from '@/lib/game/translation'
import { pct } from '@/lib/format'

export function GovernanceModal({ onClose }: { onClose: () => void }) {
  const { wallet, selectPlot, notify } = useGameStore()
  const { data: fields } = useFields()
  const plots = useFarmStore((s) => s.plots)
  const plantCrop = useFarmStore((s) => s.plantCrop)
  const waterPlot = useFarmStore((s) => s.waterPlot)
  const [selected, setSelected] = useState<string | null>(null)

  // Fertilizer bags = pools carrying the juiciest external bribes.
  const bribed = useMemo(
    () => (fields ?? []).filter((f) => f.bribeApr > 0).sort((a, b) => b.bribeApr - a.bribeApr).slice(0, 8),
    [fields],
  )

  function apply() {
    if (!wallet) return
    const field = bribed.find((f) => f.gaugeAddress === selected)
    if (!field) return
    if (!plots.find((p) => p.id === field.gaugeAddress)) {
      plantCrop(field, wallet.address, 0)
    }
    waterPlot(field.gaugeAddress, 'medium')
    selectPlot(field.gaugeAddress)
    notify({
      emoji: '🧪',
      title: `Fertilized ${field.token0Symbol}/${field.token1Symbol}`,
      detail: `Voted toward ${pct(field.bribeApr)} bribe APR — claim the incentives at harvest.`,
      tone: 'success',
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Governance · Fertilizer" emoji="🧪" maxWidth="max-w-lg">
      <TranslationCard t={ACTION_TRANSLATIONS.fertilize} />

      <p className="mt-3 text-sm text-soft">
        Fertilizer bags are pools offering external <strong>bribes</strong>. Pour your votes here to
        earn those incentives. Hover a bag to see its exact reward rate.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {bribed.map((f) => (
          <button
            key={f.gaugeAddress}
            onClick={() => setSelected(f.gaugeAddress)}
            title={`Bribe APR ${pct(f.bribeApr)} · total ${pct(f.totalApr)}`}
            className={`rounded-2xl border-2 p-3 text-left transition ${
              selected === f.gaugeAddress ? 'border-grass bg-grass/10' : 'border-[var(--panel-line)] hover:border-grass/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🧪</span>
              <span className="text-xs font-extrabold text-grass-dark">{pct(f.bribeApr)}</span>
            </div>
            <div className="mt-1 text-xs font-bold">{f.token0Symbol}/{f.token1Symbol}</div>
            <div className="text-[10px] text-soft">bribe APR</div>
          </button>
        ))}
      </div>

      <Button variant="primary" className="mt-4 w-full" disabled={!selected} onClick={apply}>
        🧪 Apply fertilizer (vote)
      </Button>
    </Modal>
  )
}
