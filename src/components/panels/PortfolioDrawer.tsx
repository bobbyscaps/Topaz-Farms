'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useProtocol } from '@/hooks/useTopaz'
import { levelForValue, FARM_LEVELS } from '@/lib/game/progression'
import { mockVotingPower } from '@/lib/services/mockFarm'
import { usdCompact, pct } from '@/lib/format'

const POOL_COLORS: Record<string, string> = {
  'v2-volatile': '#e0a93f',
  'v2-stable': '#4e8c2a',
  'v3-cl': '#6c5ce7',
}

export function PortfolioDrawer() {
  const { portfolioOpen, setPortfolioOpen, wallet } = useGameStore()
  const plots = useFarmStore((s) => s.plots)
  const harvested = useFarmStore((s) => s.harvestedTotalUsd)
  const claimable = useFarmStore((s) => s.totalClaimable())
  const usedVotes = useFarmStore((s) => s.totalVotePower())
  const { data: protocol } = useProtocol()

  const stats = useMemo(() => {
    const portfolio = plots.reduce((s, p) => s + p.positionValueUsd + p.pendingRewardsUsd, 0)
    const weightedApr = portfolio > 0
      ? plots.reduce((s, p) => s + p.field.totalApr * (p.positionValueUsd / portfolio), 0)
      : 0
    const weightedRisk = portfolio > 0
      ? plots.reduce((s, p) => s + p.field.riskScore * (p.positionValueUsd / portfolio), 0)
      : 0
    const avgIl = plots.length ? plots.reduce((s, p) => s + p.ilEstimatePct, 0) / plots.length : 0
    const dailyYield = plots.reduce((s, p) => s + (p.positionValueUsd * p.field.totalApr) / 100 / 365, 0)
    return { portfolio, weightedApr, weightedRisk, avgIl, dailyYield }
  }, [plots])

  const earningsSeries = useMemo(() => {
    let cum = harvested
    return Array.from({ length: 14 }).map((_, i) => {
      const variance = 0.7 + ((i * 53) % 7) / 10
      const day = stats.dailyYield * variance
      cum += day
      return { day: `D${i + 1}`, earnings: Number(day.toFixed(2)), cumulative: Number(cum.toFixed(2)) }
    })
  }, [stats.dailyYield, harvested])

  const weeklySeries = useMemo(
    () => earningsSeries.slice(-7).map((d) => ({ day: d.day, earnings: d.earnings })),
    [earningsSeries],
  )

  const allocation = useMemo(() => {
    const byType = new Map<string, number>()
    plots.forEach((p) => byType.set(p.field.poolType, (byType.get(p.field.poolType) ?? 0) + p.positionValueUsd))
    return Array.from(byType.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
  }, [plots])

  const totalVotes = wallet ? mockVotingPower(wallet.address) : 0
  const { current, next, progress } = levelForValue(stats.portfolio)

  return (
    <AnimatePresence>
      {portfolioOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPortfolioOpen(false)} />
          <motion.aside
            className="panel absolute right-0 top-0 flex h-full w-[min(94vw,560px)] flex-col gap-4 overflow-y-auto rounded-l-2xl rounded-r-none p-4 thin-scroll"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-[12px] text-soil-dark dark:text-wheat">📊 Farm Dashboard</h2>
              <button onClick={() => setPortfolioOpen(false)} className="grid size-8 place-items-center rounded-full border-2 border-[var(--panel-line)]">✕</button>
            </div>

            {/* Level */}
            <div className="rounded-2xl border-2 border-wheat-dark/40 bg-wheat/15 p-3">
              <div className="flex items-center justify-between text-sm font-extrabold">
                <span>{current.emoji} Level {current.level} · {current.title}</span>
                <span className="text-[11px] text-soft">{next ? `next: ${next.title}` : 'max level'}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-wheat to-wheat-dark" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-soft">Unlocked: {current.unlock}</div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Portfolio" value={usdCompact(stats.portfolio)} />
              <Kpi label="Claimable" value={usdCompact(claimable)} accent />
              <Kpi label="Lifetime harvested" value={usdCompact(harvested)} />
              <Kpi label="Avg APR" value={pct(stats.weightedApr)} />
              <Kpi label="Voting power" value={totalVotes.toLocaleString()} />
              <Kpi label="Votes cast" value={usedVotes.toLocaleString()} />
              <Kpi label="Risk score" value={`${Math.round(stats.weightedRisk * 100)}/100`} />
              <Kpi label="Avg IL est." value={`${stats.avgIl.toFixed(2)}%`} />
            </div>

            {/* Historical earnings */}
            <ChartCard title="Historical earnings (14d)">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={earningsSeries} margin={{ left: -18, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="ea-earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6db33f" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#6db33f" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,110,80,.2)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => usdCompact(Number(v))} />
                  <Area type="monotone" dataKey="cumulative" stroke="#4e8c2a" strokeWidth={2} fill="url(#ea-earn)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid gap-3 sm:grid-cols-2">
              <ChartCard title="Weekly performance">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklySeries} margin={{ left: -20, right: 4, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,110,80,.2)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => usdCompact(Number(v))} />
                    <Bar dataKey="earnings" radius={[4, 4, 0, 0]} fill="#e0a93f" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Allocation by pool type">
                {allocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={36} outerRadius={62} paddingAngle={3}>
                        {allocation.map((a) => (
                          <Cell key={a.name} fill={POOL_COLORS[a.name] ?? '#999'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => usdCompact(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-[160px] place-items-center text-sm text-soft">No positions yet</div>
                )}
              </ChartCard>
            </div>

            {/* Levels ladder */}
            <ChartCard title="Progression (cosmetic only)">
              <div className="flex flex-col gap-1.5">
                {FARM_LEVELS.map((l) => (
                  <div
                    key={l.level}
                    className={`flex items-center justify-between rounded-xl px-2 py-1.5 text-sm ${
                      l.level === current.level ? 'bg-grass/15 font-extrabold' : 'text-soft'
                    }`}
                  >
                    <span>{l.emoji} L{l.level} {l.title}</span>
                    <span className="text-[11px]">{usdCompact(l.minValueUsd)}+ · {l.unlock}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {protocol && (
              <p className="text-[10px] text-soft">
                Protocol data live from Topaz (snapshot {new Date(protocol.snapshotAtIso).toLocaleString()}). Player
                positions are simulated for the demo wallet.
              </p>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--panel-line)] p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-soft">{label}</div>
      <div className={`text-base font-extrabold ${accent ? 'text-wheat-dark' : ''}`}>{value}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--panel-line)] p-3">
      <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-soft">{title}</h3>
      {children}
    </div>
  )
}
