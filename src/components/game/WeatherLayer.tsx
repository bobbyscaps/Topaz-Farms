'use client'

import { useGameStore } from '@/store/useGameStore'

// Ambient weather: drifting clouds by day, twinkling stars by night. Cosmetic.
export function WeatherLayer() {
  const darkMode = useGameStore((s) => s.darkMode)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
      {!darkMode && (
        <>
          <span className="absolute right-6 top-4 text-4xl drop-shadow">☀️</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="cloud absolute text-3xl opacity-80"
              style={{ top: `${10 + i * 16}%`, animationDuration: `${26 + i * 10}s`, animationDelay: `${i * -8}s` }}
            >
              ☁️
            </span>
          ))}
        </>
      )}
      {darkMode && (
        <>
          <span className="absolute right-6 top-4 text-3xl">🌙</span>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute size-[2px] rounded-full bg-white/70"
              style={{
                top: `${(i * 53) % 80 + 4}%`,
                left: `${(i * 37) % 92 + 3}%`,
                opacity: 0.3 + ((i * 7) % 6) / 10,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
