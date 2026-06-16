export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = 'var(--color-grass-dark)',
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)
  const points = data
    .map((d, i) => `${(i * step).toFixed(1)},${(height - ((d - min) / span) * height).toFixed(1)}`)
    .join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
