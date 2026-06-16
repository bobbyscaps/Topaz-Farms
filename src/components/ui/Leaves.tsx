import { aprToLeaves } from '@/lib/game/translation'

export function Leaves({ apr }: { apr: number }) {
  const n = aprToLeaves(apr)
  return (
    <span aria-label={`${n} of 5 leaves`} title={`${n}/5 yield rating`}>
      <span>{'🍃'.repeat(n)}</span>
      <span className="opacity-30">{'·'.repeat(5 - n)}</span>
    </span>
  )
}
