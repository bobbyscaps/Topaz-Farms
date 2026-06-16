'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useFields } from '@/hooks/useTopaz'
import { FarmPlot } from './FarmPlot'
import { WeatherLayer } from './WeatherLayer'
import { Button } from '../ui/Button'
import { Leaves } from '../ui/Leaves'
import { RiskMeter } from '../ui/RiskMeter'
import { usdCompact, pct } from '@/lib/format'

export function FarmScene() {
  const { wallet, viewMode, selectedPlotId, selectPlot, openModal, setWalletPickerOpen } = useGameStore()
  const plots = useFarmStore((s) => s.plots)
  const { data: fields, isLoading } = useFields()

  return (
    <section className="panel relative flex min-h-[420px] flex-col overflow-hidden p-3">
      <WeatherLayer />
      <div className="relative z-10 flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-soil-dark dark:text-wheat">
          {wallet ? 'Your Farm' : 'Welcome to Epoch Acres'}
        </h2>
        {wallet && (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold dark:bg-white/10">
            🌾 {plots.length} plots
          </span>
        )}
      </div>

      {/* Not connected: hero + seed catalogue preview */}
      {!wallet && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl"
          >
            🚜
          </motion.div>
          <div className="max-w-md">
            <h3 className="font-pixel text-sm text-grass-dark">Turn DeFi into a farm</h3>
            <p className="mt-2 text-sm text-soft">
              Plant liquidity, water gauges with veTOPAZ votes, and harvest fees, bribes &
              emissions on the real Topaz DEX. Connect a wallet — or hop in as the Demo Farmer.
            </p>
          </div>
          <Button variant="primary" onClick={() => setWalletPickerOpen(true)}>
            🔑 Connect & start farming
          </Button>

          {fields && fields.length > 0 && (
            <div className="mt-2 w-full">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-soft">
                🌱 Seeds available today (live Topaz fields)
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {fields.slice(0, 6).map((f) => (
                  <div key={f.gaugeAddress} className="rounded-xl border-2 border-[var(--panel-line)] bg-[var(--panel)] p-2 text-left">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>{f.token0Symbol}/{f.token1Symbol}</span>
                      <span className="text-grass-dark">{pct(f.totalApr)}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-soft">TVL {usdCompact(f.tvlUsd)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connected: GAME view */}
      {wallet && viewMode === 'game' && (
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence>
            {plots.map((p) => (
              <FarmPlot
                key={p.id}
                plot={p}
                selected={selectedPlotId === p.id}
                onSelect={() => selectPlot(p.id)}
              />
            ))}
          </AnimatePresence>
          {/* Plant-new tile */}
          <motion.button
            layout
            whileHover={{ y: -4 }}
            onClick={() => openModal({ action: 'plant' })}
            className="grid min-h-[140px] place-items-center rounded-2xl border-2 border-dashed border-[var(--panel-line)] text-soft transition hover:border-grass hover:text-grass-dark"
          >
            <div className="text-center">
              <div className="text-4xl">➕</div>
              <div className="mt-1 text-xs font-bold">Plant new crop</div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Connected: FINANCE view */}
      {wallet && viewMode === 'finance' && (
        <div className="relative z-10 mt-3 overflow-x-auto thin-scroll">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-soft">
                <th className="p-2">Pool</th>
                <th className="p-2">Position</th>
                <th className="p-2">APR</th>
                <th className="p-2">Pending</th>
                <th className="p-2">Votes</th>
                <th className="p-2">IL est.</th>
                <th className="p-2 min-w-[110px]">Risk</th>
              </tr>
            </thead>
            <tbody>
              {plots.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => selectPlot(p.id)}
                  className={`cursor-pointer border-t border-[var(--panel-line)] hover:bg-grass/5 ${selectedPlotId === p.id ? 'bg-grass/10' : ''}`}
                >
                  <td className="p-2 font-bold">
                    {p.field.token0Symbol}/{p.field.token1Symbol}
                    <div className="text-[10px] font-normal text-soft">{p.field.poolType}</div>
                  </td>
                  <td className="p-2">{usdCompact(p.positionValueUsd)}</td>
                  <td className="p-2 font-bold text-grass-dark">
                    {pct(p.field.totalApr)} <Leaves apr={p.field.totalApr} />
                  </td>
                  <td className="p-2 font-bold text-wheat-dark">{usdCompact(p.pendingRewardsUsd)}</td>
                  <td className="p-2">{p.votePower.toLocaleString()}</td>
                  <td className="p-2">{p.ilEstimatePct.toFixed(2)}%</td>
                  <td className="p-2"><RiskMeter score={p.field.riskScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {wallet && plots.length === 0 && !isLoading && (
        <div className="relative z-10 flex flex-1 items-center justify-center text-sm text-soft">
          Loading your fields…
        </div>
      )}
    </section>
  )
}
