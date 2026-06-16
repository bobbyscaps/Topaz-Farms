export function usdCompact(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!isFinite(n)) return '$0'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(n < 1 ? 4 : 2)}`
}

export function usdPrecise(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!isFinite(n)) return '$0'
  if (n >= 1) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  return `$${n.toPrecision(4)}`
}

export function pct(value: string | number | null | undefined): string {
  if (value == null) return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (!isFinite(n)) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K%`
  return `${n.toFixed(n < 10 ? 2 : 1)}%`
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// "Crop maturity" flavor: turn an APR into a 1-5 leaf rating for the field cards.
export function aprToLeaves(apr: string | number): number {
  const n = typeof apr === 'string' ? Number(apr) : apr
  if (!isFinite(n) || n <= 0) return 0
  if (n < 25) return 1
  if (n < 75) return 2
  if (n < 200) return 3
  if (n < 500) return 4
  return 5
}

export function timeUntilNextEpoch(currentEpochStartIso: string): string {
  const start = new Date(currentEpochStartIso).getTime()
  const next = start + 7 * 24 * 60 * 60 * 1000 // epochs are 1 week
  const ms = next - Date.now()
  if (ms <= 0) return 'flipping…'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${days}d ${hours}h`
}
