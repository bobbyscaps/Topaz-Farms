'use client'

import { create } from 'zustand'
import type { FieldInfo } from '@/lib/services/types'
import {
  makePlot,
  seedInitialPlots,
  type Plot,
} from '@/lib/services/mockFarm'
import { PLOT_STAGE_META, type PlotStage } from '@/lib/game/translation'

export type WaterIntensity = 'small' | 'medium' | 'heavy'

const WATER_VOTES: Record<WaterIntensity, number> = {
  small: 2500,
  medium: 7500,
  heavy: 20000,
}

const STAGE_ORDER: PlotStage[] = ['empty', 'seeded', 'growing', 'blooming', 'harvest-ready']

function bumpStage(stage: PlotStage, steps = 1): PlotStage {
  const i = Math.min(STAGE_ORDER.length - 1, STAGE_ORDER.indexOf(stage) + steps)
  return STAGE_ORDER[i]
}

interface FarmState {
  plots: Plot[]
  seededFor: string | null
  harvestedTotalUsd: number
  lifetimeHarvests: number

  seedFarm: (fields: FieldInfo[], address: string) => void
  resetFarm: () => void
  plantCrop: (field: FieldInfo, address: string, amountUsd: number) => string
  waterPlot: (plotId: string, intensity: WaterIntensity) => void
  harvestPlot: (plotId: string) => number
  harvestAll: () => number

  totalPortfolioValue: () => number
  totalClaimable: () => number
  totalVotePower: () => number
}

export const useFarmStore = create<FarmState>((set, get) => ({
  plots: [],
  seededFor: null,
  harvestedTotalUsd: 0,
  lifetimeHarvests: 0,

  seedFarm: (fields, address) => {
    if (get().seededFor === address) return
    set({ plots: seedInitialPlots(fields, address), seededFor: address })
  },

  resetFarm: () =>
    set({ plots: [], seededFor: null, harvestedTotalUsd: 0, lifetimeHarvests: 0 }),

  plantCrop: (field, address, amountUsd) => {
    const existing = get().plots.find((p) => p.id === field.gaugeAddress)
    if (existing) {
      set((s) => ({
        plots: s.plots.map((p) =>
          p.id === field.gaugeAddress
            ? { ...p, positionValueUsd: p.positionValueUsd + amountUsd, stage: bumpStage(p.stage) }
            : p,
        ),
      }))
      return existing.id
    }
    const plot = makePlot(field, address, PLOT_STAGE_META.seeded.growth)
    plot.positionValueUsd = amountUsd
    plot.stage = 'seeded'
    plot.stakedSinceDays = 0
    plot.pendingRewardsUsd = 0
    set((s) => ({ plots: [...s.plots, plot] }))
    return plot.id
  },

  waterPlot: (plotId, intensity) =>
    set((s) => ({
      plots: s.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              votePower: p.votePower + WATER_VOTES[intensity],
              stage: bumpStage(p.stage, intensity === 'heavy' ? 2 : 1),
            }
          : p,
      ),
    })),

  harvestPlot: (plotId) => {
    const plot = get().plots.find((p) => p.id === plotId)
    if (!plot || plot.pendingRewardsUsd <= 0) return 0
    const harvested = plot.pendingRewardsUsd
    set((s) => ({
      harvestedTotalUsd: s.harvestedTotalUsd + harvested,
      lifetimeHarvests: s.lifetimeHarvests + 1,
      plots: s.plots.map((p) =>
        p.id === plotId ? { ...p, pendingRewardsUsd: 0, stage: 'growing' } : p,
      ),
    }))
    return harvested
  },

  harvestAll: () => {
    const total = get().plots.reduce((sum, p) => sum + p.pendingRewardsUsd, 0)
    if (total <= 0) return 0
    set((s) => ({
      harvestedTotalUsd: s.harvestedTotalUsd + total,
      lifetimeHarvests: s.lifetimeHarvests + s.plots.filter((p) => p.pendingRewardsUsd > 0).length,
      plots: s.plots.map((p) =>
        p.pendingRewardsUsd > 0 ? { ...p, pendingRewardsUsd: 0, stage: 'growing' } : p,
      ),
    }))
    return total
  },

  totalPortfolioValue: () =>
    get().plots.reduce((sum, p) => sum + p.positionValueUsd + p.pendingRewardsUsd, 0),
  totalClaimable: () => get().plots.reduce((sum, p) => sum + p.pendingRewardsUsd, 0),
  totalVotePower: () => get().plots.reduce((sum, p) => sum + p.votePower, 0),
}))
