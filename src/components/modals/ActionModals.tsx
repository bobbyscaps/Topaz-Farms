'use client'

import { useGameStore } from '@/store/useGameStore'
import { PlantModal } from './PlantModal'
import { WaterModal } from './WaterModal'
import { HarvestModal } from './HarvestModal'
import { GovernanceModal } from './GovernanceModal'

export function ActionModals() {
  const { activeModal, closeModal } = useGameStore()
  if (!activeModal) return null

  switch (activeModal.action) {
    case 'plant':
      return <PlantModal onClose={closeModal} />
    case 'water':
      return <WaterModal plotId={activeModal.plotId} onClose={closeModal} />
    case 'harvest':
      return <HarvestModal plotId={activeModal.plotId} onClose={closeModal} />
    case 'fertilize':
      return <GovernanceModal onClose={closeModal} />
    default:
      return null
  }
}
