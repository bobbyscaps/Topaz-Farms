export function usdCompact(value: number): string {
  const n = value
  if (!isFinite(n)) return '$0'
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 1_000_000_000) return `${sign}$${(a / 1_000_000_000).toFixed(2)}B`
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(1)}K`
  return `${sign}$${a.toFixed(a < 1 && a > 0 ? 4 : 2)}`
}

export function usdPrecise(value: number): string {
  if (!isFinite(value)) return '$0'
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (value <= 0) return '$0'
  return `$${value.toPrecision(4)}`
}

export function pct(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K%`
  return `${value.toFixed(value < 10 ? 2 : 1)}%`
}

export function num(value: number, max = 4): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: max })
}

export function shortAddress(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function timeUntilNextEpoch(currentEpochStartIso: string): string {
  const start = new Date(currentEpochStartIso).getTime()
  if (!isFinite(start)) return '—'
  const next = start + 7 * 24 * 60 * 60 * 1000
  const ms = next - Date.now()
  if (ms <= 0) return 'flipping…'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${days}d ${hours}h`
}
