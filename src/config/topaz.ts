import { getAddress } from 'viem'

// Topaz is a ve(3,3) DEX on BNB Chain Mainnet (chain id 56).
// Canonical addresses from the official Topaz skill (https://www.topazdex.com/skill.md).
// Single source of truth for protocol facts.
export const BSC_CHAIN_ID = 56

export const TOPAZ_ADDRESSES = {
  TOPAZ: getAddress('0xdf002282C1474C9592780618Adda7EaA99998Abd'),
  WBNB: getAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
  Voter: getAddress('0x2F80F810a114223AC69E34E84E735CaD515dAD67'),
  VotingEscrow: getAddress('0xe951aC65EFE86682311ab0d8995E7A58750c5eB3'),
  Minter: getAddress('0x606794d37991A426a189fD9FA8664D339A77f8ae'),
  RewardsDistributor: getAddress('0x85e15e7Ad4f20d5ca3A1104B1c2CcE72f5F683dB'),
  PoolFactory: getAddress('0x65E6cD0eF5D3467030103cf3d433034E570b5784'),
  Router: getAddress('0x1E98c8226e7d452e1888e3d3d2F929346321c6c3'),
  CLFactory: getAddress('0x73DC984D9490286E735548f61dfCCec67Af82ed9'),
  SwapRouter: getAddress('0x9B63CA87919617d042A89663492dB3c8686e0CaE'),
  QuoterV2: getAddress('0x7CCB89bB9BdEF68688F39a2c22d249fD1D9759f1'),
  NonfungiblePositionManager: getAddress('0xf8c30c3C362941C23025f2eA30B066A73C982f63'),
} as const

export const TOPAZ_LINKS = {
  app: 'https://app.topazdex.com',
  docs: 'https://www.topazdex.com/docs',
  x: 'https://x.com/TopazDex',
  telegram: 'https://t.me/TopazDex',
} as const

// In dev these are proxied by Next rewrites (see next.config.ts) to dodge CORS.
export const STATS_API_BASE = '/api/stats'
export const RPC_URL = '/rpc'

export const DEFAULT_V2_SWAP_SLIPPAGE_BPS = 50 // 0.5% per skill defaults
export const DEFAULT_DEADLINE_SECONDS = 20 * 60
