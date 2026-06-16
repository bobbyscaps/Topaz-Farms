import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortAddress } from '../lib/format'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <button className="btn btn-wallet" onClick={() => disconnect()}>
        <span className="wallet-dot" /> {shortAddress(address)}
      </button>
    )
  }

  const injected = connectors[0]
  return (
    <button
      className="btn btn-primary"
      disabled={isPending || !injected}
      onClick={() => injected && connect({ connector: injected })}
    >
      {isPending ? 'Opening wallet…' : '🔑 Connect Wallet'}
    </button>
  )
}
