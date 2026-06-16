# Epoch Acres — Architecture

Epoch Acres is a **farm-simulation UI layered over real Topaz DEX mechanics** on
BNB Chain (chain id 56). The game vocabulary (farm, crops, water, harvest) is a
visual abstraction; underneath, every action maps to a concrete DeFi primitive.
Players can flip between **Game View** and **Finance View** at any time and always
see real balances/metrics.

> This is **not** a fake game economy. Protocol data is live from Topaz; the
> player-position layer is currently mocked (clearly labelled) until a
> funded-wallet write flow is enabled.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (class-based dark mode) + retro pixel fonts |
| Animation | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Chain reads | viem (public client over a proxied BSC RPC) |
| Wallet | custom abstract connector layer (Demo / Injected / WalletConnect) |
| Data | Topaz public Stats API (no auth) |

## The game ↔ finance mapping

This is the core of the product. It is declared once in
`src/lib/game/translation.ts` (`ACTION_TRANSLATIONS`) and rendered by
`TranslationCard` so every action shows **Game → On-chain → Result**.

| Game action | Real Topaz action | Contract |
| --- | --- | --- |
| 🌱 Plant a crop | Provide liquidity (mint LP position) | `Router` / `NonfungiblePositionManager` |
| 💧 Water plots | Allocate veTOPAZ votes to a gauge | `Voter.vote()` |
| 🧪 Spread fertilizer | Vote toward a pool with external bribes | `Voter.vote()` → `BribeVotingReward` |
| 🧺 Harvest | Claim emissions + fees + bribes + rebase | `Gauge.getReward()` / `Voter.claimFees()` / `claimBribes()` |

| Game concept | Finance concept |
| --- | --- |
| Plot | A liquidity position in a pool/gauge |
| Field | A Topaz gauge/pool (real) |
| Crop growth stage | Position maturity (time staked + rewards) |
| Water level | veTOPAZ voting power directed at the gauge |
| Season | Epoch (1 week, Thu 00:00 UTC) |
| Reward Barn | Claimable rewards (emissions/fees/bribes) |
| Voting Well | Available veTOPAZ voting power |

## Layered design

```
                 ┌──────────────────────────────────────────┐
   UI / Game     │ components/ (HUD, FarmScene, panels,       │
   layer         │ modals, barn, well, ui)                    │
                 └───────────────┬───────────────────────────┘
                                 │ reads/writes
                 ┌───────────────▼───────────────────────────┐
   State         │ store/useGameStore (UI + wallet)           │
   (Zustand)     │ store/useFarmStore (plots + plant/water/   │
                 │ harvest actions, derived selectors)        │
                 └───────────────┬───────────────────────────┘
                                 │
        ┌────────────────────────┴───────────────────────────┐
        │                                                      │
┌───────▼─────────┐                              ┌─────────────▼───────────┐
│ Service layer    │                              │ Wallet layer             │
│ lib/services     │                              │ lib/wallet               │
│ • DexService     │  topazService (REAL)         │ • WalletConnector iface  │
│   getProtocol()  │  → Stats API + viem quotes   │ • demo / injected /      │
│   getFields()    │                              │   walletconnect          │
│   quoteSwap()    │  mockFarm (SIMULATED player) │                          │
└──────────────────┘                              └──────────────────────────┘
```

### Service abstraction (`src/lib/services`)

- `types.ts` — domain model (`ProtocolSummary`, `FieldInfo`, `SwapQuoteResult`, …)
  and the `DexService` interface. UI never imports a concrete data source.
- `topazService.ts` — the **real** `DexService`. Protocol/fields/prices from the
  Topaz Stats API; swap quotes via `Router.getAmountsOut` (probes
  volatile/stable/via-WBNB routes and keeps the best output) using viem.
- `mockFarm.ts` — **Deliverable #4 mock data layer**. Deterministically derives a
  player's plots, inventory and voting power from the *real* fields so the demo
  is internally consistent. Every object is flagged `simulated`.

Swapping in a different backend (subgraph, another chain, a write-enabled
service) means implementing `DexService` once.

### Wallet abstraction (`src/lib/wallet`)

- `types.ts` — `WalletConnector` interface (`connect/disconnect/isAvailable`).
- `connectors.ts` — three implementations:
  - **Demo Farmer** — deterministic address, always available, for exploring.
  - **Injected** — `window.ethereum` (MetaMask/Rabby/Trust).
  - **WalletConnect** — lazy-loaded `@walletconnect/ethereum-provider`, gated on
    `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (disabled with a hint when unset).

The rest of the app only knows the interface, so adding wallets is additive.

## State (`src/store`)

- `useGameStore` — UI + wallet: dark mode, view mode (game/finance), selected
  plot, modal/drawer/wallet-picker visibility, toast notifications, and
  `connect/disconnect` driving the wallet connectors.
- `useFarmStore` — the farm itself: `plots[]`, plus `plantCrop`, `waterPlot`,
  `harvestPlot`, `harvestAll`, and derived selectors (`totalPortfolioValue`,
  `totalClaimable`, `totalVotePower`). Seeded from real fields on connect.

## Components (`src/components`)

- `GameShell` — composes the responsive layout and wires dark mode + farm seeding.
- HUD: `GameHUD` (top bar), `InventoryBar` (bottom), `RewardTicker`, `NotificationStack`.
- Game scene: `FarmScene`, `FarmPlot`, `WeatherLayer`, `WaterAnimation`.
- Panels: `FarmControls` (left tools), `FinancePanel` (right details), `PortfolioDrawer` (dashboard).
- Economy widgets: `RewardBarn`, `VotingWell`.
- Modals: `PlantModal`, `WaterModal`, `HarvestModal`, `GovernanceModal` (+ `ActionModals` dispatcher).
- Wallet: `WalletPicker`. UI kit: `ui/` (`Button`, `Modal`, `Leaves`, `RiskMeter`, `Sparkline`, `TranslationCard`).

## Networking & CORS

The browser only talks to same-origin relative paths. `next.config.ts` rewrites:

- `/api/stats/*` → `https://www.topazdex.com/api/stats/*`
- `/rpc` → a public BSC RPC (`https://bsc-dataseed.bnbchain.org`)

This avoids CORS in development. Override upstreams with `TOPAZ_STATS_UPSTREAM`
and `BSC_RPC_UPSTREAM`. In production, serve equivalent rewrites/proxy.

## Build order (delivered)

1. Static farm UI → 2. Wallet integration → 3. Read positions (real protocol +
mock player) → 4. Claim/harvest → 5. Voting (water/fertilize) → 6. Animations
(Framer Motion, weather, coin/water FX) → 7. Mobile-responsive layout.

## Roadmap to fully on-chain positions

`mockFarm` is the single seam to replace. A write-enabled `DexService`
implementation would: read real LP/veNFT positions and claimable rewards via
viem, and (per the Topaz skill) **build calldata for the user to sign rather than
broadcasting** — mandatory slippage, 20-minute deadlines, quote-before-write.
