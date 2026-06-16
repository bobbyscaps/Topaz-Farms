'use client'

import { create } from 'zustand'
import type { WalletAccount, WalletConnector } from '@/lib/wallet/types'
import type { ActionKey } from '@/lib/game/translation'

export type ViewMode = 'game' | 'finance'

export interface GameNotification {
  id: string
  emoji: string
  title: string
  detail?: string
  tone: 'info' | 'success' | 'warn'
}

export interface ActiveModal {
  action: ActionKey
  plotId?: string
}

interface GameState {
  // UI
  darkMode: boolean
  viewMode: ViewMode
  selectedPlotId: string | null
  portfolioOpen: boolean
  walletPickerOpen: boolean
  activeModal: ActiveModal | null
  notifications: GameNotification[]

  // Wallet
  wallet: WalletAccount | null
  connecting: boolean

  toggleDarkMode: () => void
  setViewMode: (m: ViewMode) => void
  selectPlot: (id: string | null) => void
  setPortfolioOpen: (open: boolean) => void
  setWalletPickerOpen: (open: boolean) => void
  openModal: (modal: ActiveModal) => void
  closeModal: () => void
  notify: (n: Omit<GameNotification, 'id'>) => void
  dismissNotification: (id: string) => void

  connect: (connector: WalletConnector) => Promise<void>
  disconnect: () => Promise<WalletConnector | null>
  _lastConnector: WalletConnector | null
}

export const useGameStore = create<GameState>((set, get) => ({
  darkMode: false,
  viewMode: 'game',
  selectedPlotId: null,
  portfolioOpen: false,
  walletPickerOpen: false,
  activeModal: null,
  notifications: [],
  wallet: null,
  connecting: false,
  _lastConnector: null,

  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setViewMode: (m) => set({ viewMode: m }),
  selectPlot: (id) => set({ selectedPlotId: id }),
  setPortfolioOpen: (open) => set({ portfolioOpen: open }),
  setWalletPickerOpen: (open) => set({ walletPickerOpen: open }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  notify: (n) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ notifications: [{ ...n, id }, ...s.notifications].slice(0, 6) }))
    setTimeout(() => get().dismissNotification(id), 6000)
  },
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  connect: async (connector) => {
    set({ connecting: true })
    try {
      const account = await connector.connect()
      set({ wallet: account, walletPickerOpen: false, _lastConnector: connector })
      get().notify({
        emoji: connector.icon,
        title: `Connected via ${connector.name}`,
        detail: 'Welcome to your farm!',
        tone: 'success',
      })
    } catch (e) {
      get().notify({
        emoji: '⚠️',
        title: 'Wallet connection failed',
        detail: e instanceof Error ? e.message : 'Unknown error',
        tone: 'warn',
      })
    } finally {
      set({ connecting: false })
    }
  },

  disconnect: async () => {
    const connector = get()._lastConnector
    try {
      await connector?.disconnect()
    } catch {
      // ignore disconnect errors
    }
    set({ wallet: null, _lastConnector: null, selectedPlotId: null })
    return connector
  },
}))
