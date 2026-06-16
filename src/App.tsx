import { Header } from './components/Header'
import { FarmOverview } from './components/FarmOverview'
import { Fields } from './components/Fields'
import { SwapShop } from './components/SwapShop'
import { TOPAZ_LINKS } from './config/topaz'

export default function App() {
  return (
    <div className="app">
      <div className="sky" aria-hidden />
      <div className="container">
        <Header />
        <FarmOverview />
        <div className="main-grid">
          <Fields />
          <SwapShop />
        </div>
        <footer className="site-footer">
          <span>🌾 Topaz Farms — an unofficial farm-game UI for the Topaz ve(3,3) DEX.</span>
          <nav>
            <a href={TOPAZ_LINKS.app} target="_blank" rel="noreferrer">App</a>
            <a href={TOPAZ_LINKS.docs} target="_blank" rel="noreferrer">Docs</a>
            <a href={TOPAZ_LINKS.x} target="_blank" rel="noreferrer">X</a>
          </nav>
        </footer>
      </div>
    </div>
  )
}
