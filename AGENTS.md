# Epoch Acres

A **farm-simulation game UI layered over the real Topaz ve(3,3) DEX** on BNB Chain
(chain id 56). Game actions map 1:1 to DeFi primitives (plant = provide liquidity,
water = vote gauges, fertilizer = bribes, harvest = claim). Built with Next.js
(App Router) + TypeScript + Tailwind v4 + Framer Motion + Zustand + Recharts.

See `docs/ARCHITECTURE.md` for the full design (layers, game↔finance mapping,
service/wallet abstractions, component map).

## Architecture (quick map)

- `src/lib/services/` — `DexService` interface + `topazService` (REAL: Stats API +
  viem quotes) + `mockFarm` (SIMULATED player positions, the mock data layer).
- `src/lib/wallet/` — abstract `WalletConnector` + demo / injected / WalletConnect.
- `src/store/` — `useGameStore` (UI + wallet), `useFarmStore` (plots + actions).
- `src/lib/game/` — game↔finance translation, plot stages, progression levels.
- `src/components/` — HUD, game scene, panels, modals, barn/well, ui kit.
- `src/config/topaz.ts` — canonical Topaz addresses (single source of truth).

## Topaz integration rules (from the official skill)

When wiring real swaps/liquidity/votes/claims (replacing the mock layer), follow
https://www.topazdex.com/skill.md: **quote before writing, build calldata, never
broadcast for the user**; mandatory slippage (0.5% v2 default) and a ~20m
deadline; prefer the Stats API for reads; v2 Router `Route` tuples require the
`factory` field.

## Cursor Cloud specific instructions

- **Stack:** Next.js 16 + React 19 + TypeScript 6 + Tailwind v4 + Framer Motion +
  Zustand + Recharts. Package manager is **npm** (`package-lock.json`). Node 22.
- **Run dev server:** `npm run dev` (Next dev on port 3000). Use this for UI work,
  not the production build.
- **Lint / build:** `npm run lint` (flat ESLint via `eslint-config-next`) and
  `npm run build` (`next build`, includes `tsc` type-check).
- **Networking gotcha (important):** the browser only calls same-origin
  `/api/stats/*` and `/rpc`, which work because `next.config.ts` *rewrites* them
  to `https://www.topazdex.com` and a public BSC RPC. This dodges CORS. These
  rewrites run under `next dev` and `next start`; a purely static export would
  not have them. No code change needed — just know live data flows through these
  rewrites.
- **Mock vs real data:** protocol numbers (TVL, APRs, prices, fields) are REAL and
  time-sensitive (they change every snapshot / with BNB price) — assert on
  shape/ranges, not exact values. Player positions (plots, balances, rewards,
  voting power) are deterministically MOCKED from the real fields via
  `src/lib/services/mockFarm.ts` until a funded-wallet write flow is added.
- **Wallet for testing:** no real wallet needed — the **Demo Farmer** connector in
  the wallet picker loads a full simulated farm over live Topaz data. Injected
  needs a browser wallet; WalletConnect needs
  `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional, `.env.example`).
- **No secrets required** for the default experience.
