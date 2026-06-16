'use client'

import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useFields } from '@/hooks/useTopaz'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Leaves } from '../ui/Leaves'
import { RiskMeter } from '../ui/RiskMeter'
import { TranslationCard } from '../ui/TranslationCard'
import { ACTION_TRANSLATIONS } from '@/lib/game/translation'
import { usdCompact, pct } from '@/lib/format'

const AMOUNTS = [100, 500, 1000, 5000]

export function PlantModal({ onClose }: { onClose: () => void }) {
  const { wallet, selectPlot, notify } = useGameStore()
  const plantCrop = useFarmStore((s) => s.plantCrop)
  const { data: fields } = useFields()
  const [fieldIdx, setFieldIdx] = useState(0)
  const [amount, setAmount] = useState(500)

  const field = fields?.[fieldIdx]
  const estYearly = useMemo(
    () => (field ? amount * (field.totalApr / 100) : 0),
    [field, amount],
  )

  function confirm() {
    if (!field || !wallet) return
    const id = plantCrop(field, wallet.address, amount)
    selectPlot(id)
    notify({
      emoji: '🌱',
      title: `Planted ${field.token0Symbol}/${field.token1Symbol}`,
      detail: `Provided ${usdCompact(amount)} liquidity · now earning ${pct(field.totalApr)} APR`,
      tone: 'success',
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Plant a Crop" emoji="🌱" maxWidth="max-w-lg">
      <TranslationCard t={ACTION_TRANSLATIONS.plant} />

      <label className="mt-3 block text-xs font-bold uppercase text-soft">Choose a field (Topaz pool)</label>
      <select
        className="mt-1 w-full rounded-xl border-2 border-[var(--panel-line)] bg-[var(--panel)] p-2 text-sm font-semibold"
        value={fieldIdx}
        onChange={(e) => setFieldIdx(Number(e.target.value))}
      >
        {fields?.slice(0, 30).map((f, i) => (
          <option key={f.gaugeAddress} value={i}>
            {f.token0Symbol}/{f.token1Symbol} · {pct(f.totalApr)} APR · {f.poolType}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-xs font-bold uppercase text-soft">Liquidity amount</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-extrabold transition ${
              amount === a ? 'border-grass bg-grass text-white' : 'border-[var(--panel-line)]'
            }`}
          >
            {usdCompact(a)}
          </button>
        ))}
      </div>

      {field && (
        <div className="mt-3 rounded-2xl border-2 border-[var(--panel-line)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold">{field.token0Symbol}/{field.token1Symbol}</span>
            <span className="flex items-center gap-2 text-sm font-extrabold text-grass-dark">
              {pct(field.totalApr)} <Leaves apr={field.totalApr} />
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <Row k="Est. yield / year" v={usdCompact(estYearly)} accent />
            <Row k="Pool TVL" v={usdCompact(field.tvlUsd)} />
            <Row k="Emissions APR" v={pct(field.emissionApr)} />
            <Row k="Fees APR" v={pct(field.feeApr)} />
          </dl>
          <div className="mt-2">
            <div className="text-[11px] text-soft">Impermanent loss risk</div>
            <RiskMeter score={field.riskScore} />
          </div>
        </div>
      )}

      <Button variant="primary" className="mt-4 w-full" onClick={confirm} disabled={!field}>
        🌱 Plant crop · {usdCompact(amount)}
      </Button>
      <p className="mt-2 text-[10px] text-soft">
        Demo plants update your simulated farm instantly. With a funded wallet this builds a real
        add-liquidity transaction for you to sign.
      </p>
    </Modal>
  )
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-soft">{k}</dt>
      <dd className={`font-bold ${accent ? 'text-wheat-dark' : ''}`}>{v}</dd>
    </div>
  )
}
