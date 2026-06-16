import type { ActionTranslation } from '@/lib/game/translation'

// The UX rule made visible: Game Action → Real Blockchain Action → Expected Result.
export function TranslationCard({ t }: { t: ActionTranslation }) {
  const rows = [
    { tag: 'Game action', icon: t.emoji, text: t.game, tone: 'text-grass-dark' },
    { tag: 'On-chain', icon: '⛓️', text: t.blockchain, tone: 'text-topaz' },
    { tag: 'Result', icon: '✨', text: t.result, tone: 'text-wheat-dark' },
  ]
  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--panel-line)] bg-black/[0.02] p-3 dark:bg-white/[0.03]">
      {rows.map((r, i) => (
        <div key={r.tag}>
          <div className="flex items-start gap-2 py-1">
            <span className="text-lg leading-none">{r.icon}</span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-soft">{r.tag}</div>
              <div className="text-sm font-semibold">{r.text}</div>
            </div>
          </div>
          {i < rows.length - 1 && <div className="ml-2 text-soft">↓</div>}
        </div>
      ))}
      <div className="mt-1 text-[10px] text-soft">Contract: <code>{t.contract}</code></div>
    </div>
  )
}
