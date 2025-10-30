import { parseEther } from 'viem'
import PredictionMarketABI from '../../../shared/contracts/PredictionMarket.json'

// ============================================================================
// IMPORTANT: DEPLOYMENT INSTRUCTIONS
// ============================================================================
// 
// These contract addresses are PLACEHOLDERS and need to be replaced with actual
// deployed contract addresses before going to production.
//
// To deploy the PredictionMarket smart contract:
// 1. Compile and deploy the contract to BSC Testnet first for testing
// 2. Update VITE_PREDICTION_MARKET_CONTRACT_TESTNET in your .env file
// 3. Test thoroughly on testnet
// 4. Deploy to BSC Mainnet after successful testing
// 5. Update VITE_PREDICTION_MARKET_CONTRACT_MAINNET in your .env file
//
// Environment variables needed:
// - VITE_PREDICTION_MARKET_CONTRACT_MAINNET=0x...
// - VITE_PREDICTION_MARKET_CONTRACT_TESTNET=0x...
//
// ============================================================================

// Contract addresses from environment variables
export const PREDICTION_MARKET_ADDRESSES = {
  // BSC Mainnet (Chain ID: 56)
  mainnet: (process.env.VITE_PREDICTION_MARKET_CONTRACT_MAINNET || 
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // BSC Testnet (Chain ID: 97)
  testnet: (process.env.VITE_PREDICTION_MARKET_CONTRACT_TESTNET || 
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const

// Get contract address based on chain ID
export function getContractAddress(chainId: number): `0x${string}` {
  switch (chainId) {
    case 56: // BSC Mainnet
      return PREDICTION_MARKET_ADDRESSES.mainnet
    case 97: // BSC Testnet
      return PREDICTION_MARKET_ADDRESSES.testnet
    default:
      throw new Error(`Unsupported chain ID: ${chainId}. Please switch to BSC Mainnet or Testnet.`)
  }
}

// Contract ABI
export const PREDICTION_MARKET_ABI = PredictionMarketABI.abi

// Platform fee recipient (receives 10% platform fee on-chain)
export const PLATFORM_FEE_RECIPIENT = '0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01' as `0x${string}`

// Fee configuration (all fees collected on-chain, hidden from users)
export const FEE_CONFIG = {
  // Platform fee: 10% (collected on-chain during placeBet)
  PLATFORM_FEE_PERCENT: 10,
  PLATFORM_FEE_DECIMAL: 0.10,
  
  // Creator fee: 2% (accrued on-chain, paid on resolution)
  CREATOR_FEE_PERCENT: 2,
  CREATOR_FEE_DECIMAL: 0.02,
  
  // Total fees: 12%
  TOTAL_FEE_PERCENT: 12,
  TOTAL_FEE_DECIMAL: 0.12,
  
  // Percentage that goes to betting pools: 88%
  BET_POOL_PERCENT: 88,
  BET_POOL_DECIMAL: 0.88,
  
  // Registration fee in USD
  REGISTRATION_FEE_USD: 2,
} as const

// Betting configuration
export const BET_CONFIG = {
  // Minimum bet amount (0.01 BNB)
  MIN_BET_AMOUNT: parseEther('0.01'),
  MIN_BET_AMOUNT_DISPLAY: '0.01',
  
  // Market creation stake (amount required to create a new market)
  CREATE_MARKET_STAKE: parseEther('0.1'),
  CREATE_MARKET_STAKE_DISPLAY: '0.1',
} as const

// Gas limit configurations for different operations
export const GAS_LIMITS = {
  REGISTER_USER: BigInt(200000),
  PLACE_BET: BigInt(200000),
  CREATE_MARKET: BigInt(300000),
  RESOLVE_MARKET: BigInt(200000),
  CLAIM_WINNINGS: BigInt(150000),
} as const

// Transaction confirmation settings
export const TX_CONFIG = {
  // Number of block confirmations to wait
  CONFIRMATIONS: 2,
  
  // Polling interval for transaction status (ms)
  POLLING_INTERVAL: 2000,
} as const

// Helper to check if contract is deployed
export function isContractDeployed(chainId: number): boolean {
  const address = getContractAddress(chainId)
  return address !== '0x0000000000000000000000000000000000000000'
}

// Helper to get explorer URL for transaction
export function getExplorerUrl(chainId: number, txHash: string): string {
  const baseUrl = chainId === 56 
    ? 'https://bscscan.com' 
    : 'https://testnet.bscscan.com'
  return `${baseUrl}/tx/${txHash}`
}

// Helper to get explorer URL for address
export function getAddressExplorerUrl(chainId: number, address: string): string {
  const baseUrl = chainId === 56 
    ? 'https://bscscan.com' 
    : 'https://testnet.bscscan.com'
  return `${baseUrl}/address/${address}`
}

// Helper to validate Ethereum address format
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Validate platform fee recipient address on module load
if (!isValidEthereumAddress(PLATFORM_FEE_RECIPIENT)) {
  console.error(`Invalid platform fee recipient address: ${PLATFORM_FEE_RECIPIENT}`)
}
