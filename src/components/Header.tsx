import { ConnectButton } from './ConnectButton'

export function Header() {
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-logo">🌾</span>
        <div className="brand-text">
          <h1>Topaz Farms</h1>
          <p>Plant liquidity · grow yields · harvest TOPAZ on BNB Chain</p>
        </div>
      </div>
      <ConnectButton />
    </header>
  )
}
