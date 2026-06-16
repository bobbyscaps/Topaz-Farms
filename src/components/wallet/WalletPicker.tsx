'use client'

import { useGameStore } from '@/store/useGameStore'
import { WALLET_CONNECTORS } from '@/lib/wallet/connectors'
import { Modal } from '../ui/Modal'

export function WalletPicker() {
  const { walletPickerOpen, setWalletPickerOpen, connect, connecting } = useGameStore()

  return (
    <Modal
      open={walletPickerOpen}
      onClose={() => setWalletPickerOpen(false)}
      title="Connect Wallet"
      emoji="🔑"
    >
      <p className="mb-3 text-sm text-soft">
        Choose how to enter your farm. New here? The <strong>Demo Farmer</strong> lets you explore
        the full loop with simulated positions over live Topaz data — no wallet needed.
      </p>
      <div className="flex flex-col gap-2">
        {WALLET_CONNECTORS.map((c) => {
          const available = c.isAvailable()
          return (
            <button
              key={c.id}
              disabled={!available || connecting}
              onClick={() => connect(c)}
              className="flex items-center gap-3 rounded-2xl border-2 border-[var(--panel-line)] p-3 text-left transition enabled:hover:border-grass enabled:hover:bg-grass/10 disabled:opacity-50"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-black/[0.04] text-xl dark:bg-white/[0.06]">
                {c.icon}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold">{c.name}</span>
                <span className="block text-[11px] text-soft">
                  {available ? (c.id === 'demo' ? 'Recommended for exploring' : 'Ready') : c.unavailableReason}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-[10px] text-soft">
        Epoch Acres never broadcasts transactions for you. Real actions are built and shown for your
        wallet to sign.
      </p>
    </Modal>
  )
}
