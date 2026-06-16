import { cn } from '@/lib/cn'

export function RiskMeter({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100)
  const label = pct < 30 ? 'Calm' : pct < 60 ? 'Breezy' : 'Stormy'
  const color = pct < 30 ? 'bg-green-500' : pct < 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-bold whitespace-nowrap text-soft">{label}</span>}
    </div>
  )
}
