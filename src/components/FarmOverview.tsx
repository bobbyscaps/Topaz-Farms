import { useProtocolStats } from '../hooks/useStats'
import { usdCompact, usdPrecise, timeUntilNextEpoch } from '../lib/format'

interface StatTile {
  icon: string
  label: string
  value: string
  sub?: string
}

export function FarmOverview() {
  const { data, isLoading, isError } = useProtocolStats()

  if (isError) {
    return (
      <section className="overview overview-error">
        🚜 Could not reach the Topaz fields right now. The Stats API may be
        warming up — try again in a moment.
      </section>
    )
  }

  const tiles: StatTile[] = data
    ? [
        {
          icon: '🌍',
          label: 'Soil Under Cultivation (TVL)',
          value: usdCompact(data.tvlUsd),
          sub: `v2 ${usdCompact(data.v2TvlUsd)} · v3 ${usdCompact(data.v3TvlUsd)}`,
        },
        {
          icon: '🚜',
          label: 'Harvest Traded (24h)',
          value: usdCompact(data.volume24hUsd),
          sub: `7d ${usdCompact(data.volume7dUsd)}`,
        },
        {
          icon: '🪙',
          label: 'Yield Collected (24h fees)',
          value: usdCompact(data.fees24hUsd),
          sub: `7d ${usdCompact(data.fees7dUsd)}`,
        },
        {
          icon: '💎',
          label: 'Seed Price (TOPAZ)',
          value: usdPrecise(data.topazPriceUsd),
          sub: `${data.activeGaugeCount} active fields`,
        },
        {
          icon: '⏳',
          label: 'Season Ends In',
          value: timeUntilNextEpoch(data.currentEpochStart),
          sub: 'epoch = 1 week (Thu 00:00 UTC)',
        },
      ]
    : []

  return (
    <section className="overview">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div className="stat-tile skeleton" key={i} />
          ))
        : tiles.map((t) => (
            <div className="stat-tile" key={t.label}>
              <div className="stat-icon">{t.icon}</div>
              <div className="stat-value">{t.value}</div>
              <div className="stat-label">{t.label}</div>
              {t.sub && <div className="stat-sub">{t.sub}</div>}
            </div>
          ))}
    </section>
  )
}
