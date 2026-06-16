'use client'

import { motion } from 'framer-motion'

// A short burst of falling water droplets, shown when watering a plot.
export function WaterAnimation({ count = 8 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-base"
          style={{ left: `${8 + (i * 84) / count}%`, top: '-10%' }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 120, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, delay: i * 0.06, repeat: Infinity, repeatDelay: 0.4 }}
        >
          💧
        </motion.span>
      ))}
    </div>
  )
}
