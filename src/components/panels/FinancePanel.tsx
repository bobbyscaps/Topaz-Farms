'use client'

import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useProtocol } from '@/hooks/useTopaz'
import { RewardBarn } from '../barn/RewardBarn'
import { VotingWell } from '../well/VotingWell'
import { Leaves } from '../ui/Leaves'
import { RiskMeter } from '../ui/RiskMeter'
import { Sparkline } from '../ui/Sparkline'
import { Button } from '../ui/Button'
import { usdCompact, usdPrecise, pct } from '@/lib/format'
import { POOL_TYPE_LABEL } from '@/lib/game/translation'

export function FinancePanel() {
  const { wallet, selectedPlotId, openModal } = useGameStore()
  const plots = useFarmStore((s) => s.plots)
  const { data: protocol } = useProtocol()
  const plot = plots.find((p) => p.id === selectedPlotId) ?? plots[0]

  return (
    <aside className="panel flex flex-col gap-3 overflow-y-auto p-3 thin-scroll lg:max-h-[calc(100vh-220px)]">
      <h2 className="font-pixel text-[11px] text-soil-dark dark:text-wheat">Finance</h2>

      {wallet && <RewardBarn />}
      {wallet && <VotingWell />}

      {/* Selected plot detail */}
      {wallet && plot ? (
        <div className="rounded-2xl border-2 border-[var(--panel-line)] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold">
              {plot.field.token0Symbol}/{plot.field.token1Symbol}
            </h3>
            <span className="rounded-full bg-topaz/15 px-2 py-0.5 text-[10px] font-bold text-topaz">
              {POOL_TYPE_LABEL[plot.field.poolType]}
            </span>
          </div>
          <div className="text-[11px] text-soft">Crop: {plot.cropName} · staked {plot.stakedSinceDays}d</div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-grass-dark">{pct(plot.field.totalApr)}</span>
            <Leaves apr={plot.field.totalApr} />
          </div>

          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <Row k="Position value" v={usdCompact(plot.positionValueUsd)} />
            <Row k="Pending rewards" v={usdCompact(plot.pendingRewardsUsd)} accent />
            <Row k="Pool TVL" v={usdCompact(plot.field.tvlUsd)} />
            <Row k="Staked TVL" v={usdCompact(plot.field.stakedTvlUsd)} />
            <Row k="Emissions APR" v={pct(plot.field.emissionApr)} />
            <Row k="Fees APR" v={pct(plot.field.feeApr)} />
            <Row k="Bribes APR" v={pct(plot.field.bribeApr)} />
            <Row k="IL estimate" v={`${plot.ilEstimatePct.toFixed(2)}%`} />
          </dl>

          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-[11px] text-soft">
              <span>Risk weather</span>
            </div>
            <RiskMeter score={plot.field.riskScore} />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-soft">7d earnings</span>
            <Sparkline data={plot.earnings7d} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="topaz" onClick={() => openModal({ action: 'water', plotId: plot.id })}>💧 Water</Button>
            <Button variant="wheat" disabled={plot.pendingRewardsUsd <= 0} onClick={() => openModal({ action: 'harvest', plotId: plot.id })}>🧺 Harvest</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[var(--panel-line)] p-4 text-center text-sm text-soft">
          {wallet ? 'Select a plot to see its finances.' : 'Connect to view your positions.'}
        </div>
      )}

      {/* Protocol snapshot */}
      <div className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/[0.04]">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-soft">Topaz protocol</h3>
        {protocol ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <Row k="TVL" v={usdCompact(protocol.tvlUsd)} />
            <Row k="24h volume" v={usdCompact(protocol.volume24hUsd)} />
            <Row k="24h fees" v={usdCompact(protocol.fees24hUsd)} />
            <Row k="TOPAZ price" v={usdPrecise(protocol.topazPriceUsd)} />
            <Row k="Active fields" v={String(protocol.activeGaugeCount)} />
            <Row k="veTOPAZ locked" v={usdCompact(protocol.totalLockedTopaz)} />
          </dl>
        ) : (
          <div className="mt-2 h-16 skeleton" />
        )}
        <p className="mt-2 text-[10px] text-soft">Live from the Topaz Stats API. Position data is simulated until a funded-wallet flow is enabled.</p>
      </div>
    </aside>
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
