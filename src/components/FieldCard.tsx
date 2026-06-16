import { useState } from 'react'
import type { Gauge } from '../lib/statsApi'
import { cropForToken } from '../config/tokens'
import { TOPAZ_LINKS } from '../config/topaz'
import { usdCompact, pct, aprToLeaves } from '../lib/format'

const POOL_BADGE: Record<Gauge['poolType'], { label: string; cls: string }> = {
  'v2-volatile': { label: 'v2 · volatile', cls: 'badge-volatile' },
  'v2-stable': { label: 'v2 · stable', cls: 'badge-stable' },
  'v3-cl': { label: 'v3 · concentrated', cls: 'badge-cl' },
}

export function FieldCard({ gauge }: { gauge: Gauge }) {
  const [planted, setPlanted] = useState(false)
  const crop0 = cropForToken(gauge.token0Address, gauge.token0Symbol)
  const crop1 = cropForToken(gauge.token1Address, gauge.token1Symbol)
  const leaves = aprToLeaves(gauge.totalApr)
  const badge = POOL_BADGE[gauge.poolType]

  return (
    <article className={`field-card${planted ? ' is-planted' : ''}`}>
      <div className="field-soil">
        <span className="crop crop-0">{crop0}</span>
        <span className="crop crop-1">{crop1}</span>
        {planted && <span className="sprout">🌱</span>}
      </div>

      <div className="field-head">
        <h3>
          {gauge.token0Symbol} / {gauge.token1Symbol}
        </h3>
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
      </div>

      <div className="field-yield">
        <div className="yield-big">{pct(gauge.totalApr)}</div>
        <div className="yield-leaves" aria-label={`${leaves} of 5 leaves`}>
          {'🍃'.repeat(leaves)}
          <span className="leaves-empty">{'·'.repeat(5 - leaves)}</span>
        </div>
        <div className="yield-label">est. yield (APR)</div>
      </div>

      <dl className="field-stats">
        <div>
          <dt>Soil staked</dt>
          <dd>{usdCompact(gauge.stakedTvlUsd)}</dd>
        </div>
        <div>
          <dt>Emissions</dt>
          <dd>{pct(gauge.emissionApr)}</dd>
        </div>
        <div>
          <dt>Fees</dt>
          <dd>{pct(gauge.feeApr)}</dd>
        </div>
        <div>
          <dt>Bribes</dt>
          <dd>{pct(gauge.bribeApr)}</dd>
        </div>
      </dl>

      <div className="field-actions">
        <button
          className="btn btn-plant"
          onClick={() => setPlanted((p) => !p)}
        >
          {planted ? '🌱 Scouted!' : '🔍 Scout field'}
        </button>
        <a
          className="btn btn-ghost"
          href={TOPAZ_LINKS.app}
          target="_blank"
          rel="noreferrer"
        >
          Plant ↗
        </a>
      </div>
    </article>
  )
}
