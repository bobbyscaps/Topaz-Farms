'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  emoji,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  title: string
  emoji?: string
  children: ReactNode
  maxWidth?: string
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`panel relative z-10 max-h-[90vh] w-full overflow-y-auto p-4 thin-scroll ${maxWidth}`}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-pixel text-[12px] text-soil-dark dark:text-wheat">
                {emoji && <span className="text-xl">{emoji}</span>}
                {title}
              </h2>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full border-2 border-[var(--panel-line)] text-soft hover:text-rose-500"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
