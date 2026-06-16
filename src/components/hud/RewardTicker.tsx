'use client'

import { useProtocol, useFields } from '@/hooks/useTopaz'
import { usdCompact, usdPrecise, pct, timeUntilNextEpoch } from '@/lib/format'

export function RewardTicker() {
  const { data: p } = useProtocol()
  const { data: fields } = useFields()

  const items: string[] = []
  if (p) {
    items.push(`🌍 Farmland TVL ${usdCompact(p.tvlUsd)}`)
    items.push(`🚜 24h volume ${usdCompact(p.volume24hUsd)}`)
    items.push(`🪙 24h fees ${usdCompact(p.fees24hUsd)}`)
    items.push(`💎 TOPAZ ${usdPrecise(p.topazPriceUsd)}`)
    items.push(`🌾 ${p.activeGaugeCount} fields in season`)
    items.push(`⏳ harvest season ends in ${timeUntilNextEpoch(p.currentEpochStartIso)}`)
  }
  if (fields) {
    fields.slice(0, 5).forEach((f) =>
      items.push(`✨ ${f.token0Symbol}/${f.token1Symbol} yields ${pct(f.totalApr)} APR`),
    )
  }
  if (items.length === 0) items.push('Loading live Topaz fields…')

  const loop = [...items, ...items]
  return (
    <div className="panel overflow-hidden py-1.5">
      <div className="flex w-max gap-8 whitespace-nowrap pl-8 [animation:ea-marquee_45s_linear_infinite] motion-reduce:[animation:none]">
        {loop.map((t, i) => (
          <span key={i} className="text-xs font-bold text-soft">
            {t}
          </span>
        ))}
      </div>
      <style>{`@keyframes ea-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}
