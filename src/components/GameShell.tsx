'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useFields } from '@/hooks/useTopaz'
import { GameHUD } from './hud/GameHUD'
import { FarmControls } from './panels/FarmControls'
import { FarmScene } from './game/FarmScene'
import { FinancePanel } from './panels/FinancePanel'
import { InventoryBar } from './hud/InventoryBar'
import { RewardTicker } from './hud/RewardTicker'
import { NotificationStack } from './hud/NotificationStack'
import { WalletPicker } from './wallet/WalletPicker'
import { PortfolioDrawer } from './panels/PortfolioDrawer'
import { ActionModals } from './modals/ActionModals'

export function GameShell() {
  const darkMode = useGameStore((s) => s.darkMode)
  const wallet = useGameStore((s) => s.wallet)
  const { data: fields } = useFields()
  const seedFarm = useFarmStore((s) => s.seedFarm)
  const resetFarm = useFarmStore((s) => s.resetFarm)

  // Apply class-based dark mode to <html>.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Seed the (mock) farm from real fields once a wallet connects.
  useEffect(() => {
    if (wallet && fields && fields.length > 0) {
      seedFarm(fields, wallet.address)
    }
    if (!wallet) resetFarm()
  }, [wallet, fields, seedFarm, resetFarm])

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-3 p-3 sm:p-4">
      <GameHUD />
      <RewardTicker />
      <div className="grid flex-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <FarmControls />
        <FarmScene />
        <FinancePanel />
      </div>
      <InventoryBar />

      <NotificationStack />
      <WalletPicker />
      <PortfolioDrawer />
      <ActionModals />
    </div>
  )
}
