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
  mainnet: (import.meta.env.VITE_PREDICTION_MARKET_CONTRACT_MAINNET || 
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // BSC Testnet (Chain ID: 97)
  testnet: (import.meta.env.VITE_PREDICTION_MARKET_CONTRACT_TESTNET || 
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

// Escrow wallet configuration
// This wallet receives platform fee on all bets placed
export const ESCROW_WALLET_ADDRESS = '0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01' as `0x${string}`

// Tax configuration (fees automatically deducted from bet amount)
export const TAX_CONFIG = {
  // Platform fee rate as a percentage (8%)
  TAX_RATE_PERCENT: 8,
  // Platform fee rate as a decimal for calculations (0.08)
  TAX_RATE_DECIMAL: 0.08,
  // Percentage that goes to the bet pool after platform fee (92%)
  BET_POOL_PERCENT: 92,
  // Percentage that goes to the bet pool as decimal (0.92)
  BET_POOL_DECIMAL: 0.92,
} as const

// Betting configuration
export const BET_CONFIG = {
  // Minimum bet amount (0.01 BNB)
  MIN_BET_AMOUNT: parseEther('0.01'),
  MIN_BET_AMOUNT_DISPLAY: '0.01',
  
  // Market creation stake (amount required to create a new market)
  // This will be fetched from contract, but we set a default
  CREATE_MARKET_STAKE: parseEther('1.0'),
  CREATE_MARKET_STAKE_DISPLAY: '1.0',
} as const

// Gas limit configurations for different operations
export const GAS_LIMITS = {
  PLACE_BET: BigInt(150000),
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

// Validate escrow wallet address on module load
if (!isValidEthereumAddress(ESCROW_WALLET_ADDRESS)) {
  console.error(`Invalid escrow wallet address: ${ESCROW_WALLET_ADDRESS}`)
}
