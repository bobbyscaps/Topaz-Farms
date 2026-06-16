// Cosmetic progression. Levels unlock skins/buildings/animations only — never any
// gameplay/financial advantage. Driven by total farm value under management.

export interface FarmLevel {
  level: number
  title: string
  emoji: string
  minValueUsd: number
  unlock: string
}

export const FARM_LEVELS: FarmLevel[] = [
  { level: 1, title: 'Starter Farmer', emoji: '🌱', minValueUsd: 0, unlock: 'Starter plot skin' },
  { level: 2, title: 'Plot Owner', emoji: '🌿', minValueUsd: 250, unlock: 'Wooden fences' },
  { level: 3, title: 'Ranch Manager', emoji: '🚜', minValueUsd: 2_500, unlock: 'Barn + scarecrow' },
  { level: 4, title: 'Land Baron', emoji: '🏡', minValueUsd: 25_000, unlock: 'Golden crops skin' },
  { level: 5, title: 'Governor', emoji: '👑', minValueUsd: 100_000, unlock: 'Windmill + aurora weather' },
]

export interface LevelProgress {
  current: FarmLevel
  next: FarmLevel | null
  progress: number // 0..1 toward next level
}

export function levelForValue(valueUsd: number): LevelProgress {
  let current = FARM_LEVELS[0]
  for (const lvl of FARM_LEVELS) {
    if (valueUsd >= lvl.minValueUsd) current = lvl
  }
  const next = FARM_LEVELS.find((l) => l.level === current.level + 1) ?? null
  const progress = next
    ? Math.min(
        1,
        (valueUsd - current.minValueUsd) /
          (next.minValueUsd - current.minValueUsd),
      )
    : 1
  return { current, next, progress }
}
