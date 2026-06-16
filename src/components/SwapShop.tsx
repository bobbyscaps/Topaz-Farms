import { useState } from 'react'
import { useAccount } from 'wagmi'
import { SWAP_TOKENS, type TokenInfo } from '../config/tokens'
import { quoteSwap, buildSwapTx, type SwapQuote, type BuiltSwapTx } from '../lib/quote'
import { shortAddress } from '../lib/format'

function TokenSelect({
  value,
  onChange,
  exclude,
}: {
  value: TokenInfo
  onChange: (t: TokenInfo) => void
  exclude?: string
}) {
  return (
    <select
      className="token-select"
      value={value.address}
      onChange={(e) => {
        const t = SWAP_TOKENS.find((x) => x.address === e.target.value)
        if (t) onChange(t)
      }}
    >
      {SWAP_TOKENS.filter((t) => t.address !== exclude).map((t) => (
        <option key={t.address} value={t.address}>
          {t.crop} {t.symbol}
        </option>
      ))}
    </select>
  )
}

export function SwapShop() {
  const { address, isConnected } = useAccount()
  const [tokenIn, setTokenIn] = useState<TokenInfo>(SWAP_TOKENS[0])
  const [tokenOut, setTokenOut] = useState<TokenInfo>(SWAP_TOKENS[1])
  const [amount, setAmount] = useState('1')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [built, setBuilt] = useState<BuiltSwapTx | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function swapDirection() {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setQuote(null)
    setBuilt(null)
  }

  async function onQuote() {
    setError(null)
    setBuilt(null)
    setLoading(true)
    try {
      const q = await quoteSwap(tokenIn, tokenOut, amount)
      setQuote(q)
    } catch (e) {
      setQuote(null)
      setError(e instanceof Error ? e.message : 'Quote failed')
    } finally {
      setLoading(false)
    }
  }

  function onBuild() {
    if (!quote || !address) return
    setBuilt(buildSwapTx(quote, tokenOut, address))
  }

  return (
    <section className="swap-shop">
      <div className="section-head">
        <h2>🛒 Seed Market</h2>
        <p>
          Trade seeds at live on-chain Topaz v2 prices. We quote first, then
          build wallet-ready calldata — nothing is ever broadcast for you.
        </p>
      </div>

      <div className="swap-card">
        <label className="swap-row">
          <span className="swap-row-label">You plant</span>
          <div className="swap-row-input">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setQuote(null)
                setBuilt(null)
              }}
            />
            <TokenSelect value={tokenIn} onChange={setTokenIn} exclude={tokenOut.address} />
          </div>
        </label>

        <button className="swap-flip" onClick={swapDirection} aria-label="Flip tokens">
          ⇅
        </button>

        <label className="swap-row">
          <span className="swap-row-label">You harvest</span>
          <div className="swap-row-input">
            <input
              type="text"
              readOnly
              placeholder="—"
              value={quote ? Number(quote.amountOutFormatted).toLocaleString(undefined, { maximumFractionDigits: 6 }) : ''}
            />
            <TokenSelect value={tokenOut} onChange={setTokenOut} exclude={tokenIn.address} />
          </div>
        </label>

        <button className="btn btn-primary btn-wide" onClick={onQuote} disabled={loading}>
          {loading ? 'Checking the market…' : '🌾 Get quote'}
        </button>

        {error && <div className="swap-error">⚠️ {error}</div>}

        {quote && (
          <div className="quote-box">
            <div className="quote-line">
              <span>Rate</span>
              <span>
                1 {tokenIn.symbol} ≈ {quote.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {tokenOut.symbol}
              </span>
            </div>
            <div className="quote-line">
              <span>Route</span>
              <span>{quote.routeLabel}</span>
            </div>
            <div className="quote-tag">quote · numbers only · no transaction</div>

            {isConnected ? (
              <button className="btn btn-plant btn-wide" onClick={onBuild}>
                🧾 Build swap order
              </button>
            ) : (
              <div className="quote-hint">Connect a wallet to build a signable order.</div>
            )}
          </div>
        )}

        {built && (
          <div className="calldata-box">
            <div className="calldata-head">🧾 Built calldata — sign in your own wallet</div>
            <div className="quote-line">
              <span>Min received (0.5% slippage)</span>
              <span>
                {Number(built.amountOutMinFormatted).toLocaleString(undefined, { maximumFractionDigits: 6 })} {tokenOut.symbol}
              </span>
            </div>
            <div className="quote-line">
              <span>Deadline</span>
              <span>{new Date(built.deadline * 1000).toLocaleTimeString()}</span>
            </div>
            <div className="calldata-step">
              <strong>1. Approve</strong> {tokenIn.symbol} → Router {shortAddress(built.approval.spender)}
              <code>{built.approval.data.slice(0, 26)}…</code>
            </div>
            <div className="calldata-step">
              <strong>2. Swap</strong> via Router {shortAddress(built.to)}
              <code>{built.data.slice(0, 26)}…</code>
            </div>
            <div className="quote-tag">built calldata · ready for wallet signature · not broadcast</div>
          </div>
        )}
      </div>
    </section>
  )
}
