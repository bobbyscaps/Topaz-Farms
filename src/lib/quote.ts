import {
  createPublicClient,
  http,
  encodeFunctionData,
  parseUnits,
  formatUnits,
  type Address,
} from 'viem'
import { bsc } from 'viem/chains'
import { routerV2Abi, erc20Abi } from './abis'
import {
  RPC_URL,
  TOPAZ_ADDRESSES,
  DEFAULT_V2_SWAP_SLIPPAGE_BPS,
  DEFAULT_DEADLINE_SECONDS,
} from '../config/topaz'
import type { TokenInfo } from '../config/tokens'

export const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RPC_URL),
})

interface Route {
  from: Address
  to: Address
  stable: boolean
  factory: Address
}

export interface SwapQuote {
  amountIn: bigint
  amountOut: bigint
  amountOutFormatted: string
  routes: Route[]
  routeLabel: string
  /** human readable price: 1 tokenIn = X tokenOut */
  rate: number
}

const F = TOPAZ_ADDRESSES.PoolFactory

// Per skill: verify a route actually produces output before using it. We probe a
// few candidate Solidly routes and keep whichever returns the most output.
function candidateRoutes(from: Address, to: Address): { routes: Route[]; label: string }[] {
  const wbnb = TOPAZ_ADDRESSES.WBNB
  const direct = (stable: boolean): Route[] => [{ from, to, stable, factory: F }]
  const candidates: { routes: Route[]; label: string }[] = [
    { routes: direct(false), label: 'direct · volatile' },
    { routes: direct(true), label: 'direct · stable' },
  ]
  if (from.toLowerCase() !== wbnb.toLowerCase() && to.toLowerCase() !== wbnb.toLowerCase()) {
    candidates.push({
      routes: [
        { from, to: wbnb, stable: false, factory: F },
        { from: wbnb, to, stable: false, factory: F },
      ],
      label: 'via WBNB · volatile',
    })
  }
  return candidates
}

export async function quoteSwap(
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amountInHuman: string,
): Promise<SwapQuote> {
  const amountIn = parseUnits(amountInHuman, tokenIn.decimals)
  if (amountIn <= 0n) throw new Error('Enter an amount greater than 0')

  const results = await Promise.allSettled(
    candidateRoutes(tokenIn.address, tokenOut.address).map(async ({ routes, label }) => {
      const amounts = (await publicClient.readContract({
        address: TOPAZ_ADDRESSES.Router,
        abi: routerV2Abi,
        functionName: 'getAmountsOut',
        args: [amountIn, routes],
      })) as bigint[]
      return { amounts, routes, label }
    }),
  )

  let best: { amountOut: bigint; routes: Route[]; label: string } | null = null
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const out = r.value.amounts[r.value.amounts.length - 1]
    if (out > 0n && (!best || out > best.amountOut)) {
      best = { amountOut: out, routes: r.value.routes, label: r.value.label }
    }
  }

  if (!best) {
    throw new Error('No Topaz v2 route found for this pair. Try a different pair or amount.')
  }

  const amountOutFormatted = formatUnits(best.amountOut, tokenOut.decimals)
  const rate = Number(amountOutFormatted) / Number(amountInHuman)
  return {
    amountIn,
    amountOut: best.amountOut,
    amountOutFormatted,
    routes: best.routes,
    routeLabel: best.label,
    rate,
  }
}

export interface BuiltSwapTx {
  to: Address
  data: `0x${string}`
  value: string
  amountOutMin: bigint
  amountOutMinFormatted: string
  slippageBps: number
  deadline: number
  approval: {
    to: Address
    data: `0x${string}`
    spender: Address
  }
}

// Build (never broadcast) calldata for the swap, including the ERC20 approval the
// player must sign first. Slippage + deadline are applied per skill defaults.
export function buildSwapTx(
  quote: SwapQuote,
  tokenOut: TokenInfo,
  recipient: Address,
  slippageBps: number = DEFAULT_V2_SWAP_SLIPPAGE_BPS,
): BuiltSwapTx {
  const amountOutMin =
    (quote.amountOut * BigInt(10_000 - slippageBps)) / 10_000n
  const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_SECONDS

  const data = encodeFunctionData({
    abi: routerV2Abi,
    functionName: 'swapExactTokensForTokens',
    args: [
      quote.amountIn,
      amountOutMin,
      quote.routes,
      recipient,
      BigInt(deadline),
    ],
  })

  const approvalData = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [TOPAZ_ADDRESSES.Router, quote.amountIn],
  })

  return {
    to: TOPAZ_ADDRESSES.Router,
    data,
    value: '0',
    amountOutMin,
    amountOutMinFormatted: formatUnits(amountOutMin, tokenOut.decimals),
    slippageBps,
    deadline,
    approval: {
      to: quote.routes[0].from,
      data: approvalData,
      spender: TOPAZ_ADDRESSES.Router,
    },
  }
}
