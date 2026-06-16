'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/cn'

const TONE: Record<string, string> = {
  info: 'border-sky-400/50',
  success: 'border-grass/60',
  warn: 'border-rose-400/60',
}

export function NotificationStack() {
  const { notifications, dismissNotification } = useGameStore()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,340px)] flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            onClick={() => dismissNotification(n.id)}
            className={cn('panel pointer-events-auto cursor-pointer border-l-4 p-3', TONE[n.tone])}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{n.emoji}</span>
              <div>
                <div className="text-sm font-extrabold">{n.title}</div>
                {n.detail && <div className="text-xs text-soft">{n.detail}</div>}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
