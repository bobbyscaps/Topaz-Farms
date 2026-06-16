# Topaz Farms

A cozy **farm-style game front end for the Topaz ve(3,3) DEX** on BNB Chain (chain id 56).
Topaz gauges are rendered as "fields" you farm, the swap widget is the "Seed Market",
and TOPAZ emissions are the "harvest". Built with Vite + React + TypeScript + wagmi/viem.

## Architecture (quick map)

- `src/config/topaz.ts` — canonical Topaz addresses, chain id, API/RPC base paths. **Single source of truth** for protocol facts; do not duplicate addresses elsewhere.
- `src/config/tokens.ts` — curated swap token list + cosmetic "crop" emojis.
- `src/lib/statsApi.ts` — client for the public Topaz Stats API (`/protocol`, `/gauges`, `/tokens`).
- `src/lib/quote.ts` — on-chain v2 swap quoting (`Router.getAmountsOut`) + wallet-ready calldata builder. **Quotes/builds only — never broadcasts.**
- `src/lib/abis.ts` — minimal ABIs (ERC20, Solidly-style v2 Router with factory-based Route tuples).
- `src/components/*` — `FarmOverview` (stat tiles), `Fields`/`FieldCard` (gauges as fields), `SwapShop` (Seed Market), `Header`/`ConnectButton` (wallet).

## Topaz integration rules (from the official skill)

When changing swap/quote/pool/gauge logic, follow https://www.topazdex.com/skill.md:
- **Quote before building; never broadcast on the user's behalf.** Label output as `quote` or `built calldata`.
- Slippage is mandatory (default 0.5% for v2 swaps); never use `amountOutMin = 0`. Deadline default `now + 20m`.
- Prefer the **Stats API** for any read it can serve (TVL, APRs, prices, epochs). Reserve on-chain reads for user state and tx construction.
- v2 Router `Route` is a tuple `(from, to, stable, factory)` — the factory field is required on this Solidly-style router.

## Cursor Cloud specific instructions

- **Stack:** Vite 8 + React 19 + TypeScript 6 + wagmi 3 + viem 2. Package manager is **npm** (`package-lock.json`). Node 22.
- **Run dev server:** `npm run dev` (Vite, port 5173, `host: true`). This is the development command to use — do **not** rely on `npm run build` for testing UI.
- **Lint / typecheck+build:** `npm run lint` and `npm run build` (build runs `tsc -b` then `vite build`).
- **Networking gotcha (important):** the app talks to **relative paths** `/api/stats` and `/rpc`, which only exist because Vite's dev server proxies them (see `vite.config.ts`) to `https://www.topazdex.com` and a public BSC RPC (`https://bsc-dataseed.bnbchain.org`). This is to dodge browser CORS. A plain `vite preview` of the production `dist/` build will NOT have these proxies, so live data and quotes only work under `npm run dev` (or behind your own reverse proxy in prod). Verify data loads via the dev server, not `preview`.
- **No secrets / env vars required.** Everything runs against the public Topaz Stats API (no auth) and a public BSC RPC. Wallet actions use the injected connector (MetaMask/Rabby/etc.); without a browser wallet the app still works read-only (live fields + swap quotes) — only "Build swap order" needs a connected wallet, and even then it builds calldata rather than broadcasting.
- **Live-data tests are time-sensitive:** numbers (TVL, APRs, quote rates) change every snapshot (~minutes) and with BNB price, so assert on shape/ranges, not exact values.
