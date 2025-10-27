import { parseEther, formatEther } from 'viem'
import { BET_CONFIG } from '@/lib/contractConfig'

/**
 * Validates that a bet amount meets the minimum requirement
 * @param amount - The bet amount in BNB as a string
 * @returns Object with isValid flag and optional error message
 */
export function validateBetAmount(amount: string): {
  isValid: boolean
  error?: string
} {
  if (!amount || amount.trim() === '') {
    return {
      isValid: false,
      error: 'Please enter a bet amount'
    }
  }

  const numAmount = parseFloat(amount)
  
  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Invalid bet amount'
    }
  }

  if (numAmount <= 0) {
    return {
      isValid: false,
      error: 'Bet amount must be greater than 0'
    }
  }

  const minBet = parseFloat(BET_CONFIG.MIN_BET_AMOUNT_DISPLAY)
  if (numAmount < minBet) {
    return {
      isValid: false,
      error: `Minimum bet amount is ${minBet} BNB`
    }
  }

  return { isValid: true }
}

/**
 * Formats BNB amount from Wei to human-readable format
 * @param amountWei - Amount in Wei (bigint)
 * @param decimals - Number of decimal places to show (default: 4)
 * @returns Formatted BNB string
 */
export function formatBNB(amountWei: bigint | string, decimals: number = 4): string {
  const amount = typeof amountWei === 'string' ? BigInt(amountWei) : amountWei
  const formatted = formatEther(amount)
  const num = parseFloat(formatted)
  return num.toFixed(decimals)
}

/**
 * Formats BNB amount with symbol
 * @param amountWei - Amount in Wei (bigint)
 * @param decimals - Number of decimal places to show (default: 4)
 * @returns Formatted string with BNB symbol
 */
export function formatBNBWithSymbol(amountWei: bigint | string, decimals: number = 4): string {
  return `${formatBNB(amountWei, decimals)} BNB`
}

/**
 * Converts BNB amount string to Wei (bigint)
 * @param amount - Amount in BNB as string
 * @returns Amount in Wei as bigint
 */
export function toBNBWei(amount: string): bigint {
  return parseEther(amount)
}

/**
 * Calculates betting odds based on pool sizes
 * @param yesPool - Total BNB in YES pool (in Wei)
 * @param noPool - Total BNB in NO pool (in Wei)
 * @returns Object with yes and no odds as percentages
 */
export function calculateOdds(yesPool: bigint, noPool: bigint): {
  yesOdds: number
  noOdds: number
} {
  const totalPool = yesPool + noPool
  
  // If no bets placed yet, return 50/50
  if (totalPool === BigInt(0)) {
    return {
      yesOdds: 50.0,
      noOdds: 50.0
    }
  }

  const yesPoolNum = Number(formatEther(yesPool))
  const noPoolNum = Number(formatEther(noPool))
  const totalPoolNum = yesPoolNum + noPoolNum

  return {
    yesOdds: (yesPoolNum / totalPoolNum) * 100,
    noOdds: (noPoolNum / totalPoolNum) * 100
  }
}

/**
 * Calculates potential return for a bet
 * @param betAmount - Amount being bet (in Wei)
 * @param currentPool - Current pool for the selected side (in Wei)
 * @param oppositePool - Pool for the opposite side (in Wei)
 * @returns Potential return in Wei (including original bet)
 */
export function calculatePotentialReturn(
  betAmount: bigint,
  currentPool: bigint,
  oppositePool: bigint
): bigint {
  const totalPool = currentPool + oppositePool + betAmount
  const newCurrentPool = currentPool + betAmount
  
  // If betting on winning side, share of total pool proportional to contribution
  // Return = (betAmount / newCurrentPool) * totalPool
  if (totalPool === BigInt(0) || newCurrentPool === BigInt(0)) {
    return betAmount
  }

  // Use BigInt arithmetic to avoid precision loss
  const potentialReturn = (betAmount * totalPool) / newCurrentPool
  
  return potentialReturn
}

/**
 * Estimates gas cost for a transaction
 * @param gasLimit - Estimated gas limit
 * @param gasPrice - Current gas price in Wei (optional, uses estimate if not provided)
 * @returns Estimated cost in BNB
 */
export function estimateGasCost(
  gasLimit: bigint,
  gasPrice?: bigint
): {
  gasCostWei: bigint
  gasCostBNB: string
} {
  // Default gas price for BSC (typically 3-5 Gwei, we use 5 for safety)
  const defaultGasPrice = parseEther('0.000000005') // 5 Gwei in Wei
  const price = gasPrice || defaultGasPrice
  
  const gasCostWei = gasLimit * price
  const gasCostBNB = formatBNB(gasCostWei, 6)
  
  return {
    gasCostWei,
    gasCostBNB
  }
}

/**
 * Formats large numbers with K, M suffixes
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

/**
 * Truncates wallet address for display
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Checks if user has sufficient balance for a transaction
 * @param userBalance - User's current balance in Wei
 * @param requiredAmount - Required amount in Wei
 * @param estimatedGas - Estimated gas cost in Wei
 * @returns Object with hasBalance flag and optional error message
 */
export function checkSufficientBalance(
  userBalance: bigint,
  requiredAmount: bigint,
  estimatedGas: bigint
): {
  hasBalance: boolean
  error?: string
} {
  const totalRequired = requiredAmount + estimatedGas
  
  if (userBalance < totalRequired) {
    const shortfall = totalRequired - userBalance
    return {
      hasBalance: false,
      error: `Insufficient balance. Need ${formatBNBWithSymbol(shortfall)} more (including gas)`
    }
  }
  
  return { hasBalance: true }
}

/**
 * Parses blockchain error messages into user-friendly text
 * @param error - Error object from blockchain transaction
 * @returns User-friendly error message
 */
export function parseBlockchainError(error: unknown): string {
  if (!error) return 'An unknown error occurred'
  
  const errorStr = String(error)
  
  // Common error patterns
  if (errorStr.includes('user rejected')) {
    return 'Transaction was rejected by user'
  }
  if (errorStr.includes('insufficient funds')) {
    return 'Insufficient BNB balance for this transaction'
  }
  if (errorStr.includes('nonce')) {
    return 'Transaction nonce error. Please try again.'
  }
  if (errorStr.includes('gas')) {
    return 'Gas estimation failed. The transaction may fail.'
  }
  if (errorStr.includes('deadline')) {
    return 'Market deadline has passed'
  }
  if (errorStr.includes('already placed')) {
    return 'You have already placed a bet in this market'
  }
  if (errorStr.includes('minimum bet')) {
    return `Bet amount is below minimum (${BET_CONFIG.MIN_BET_AMOUNT_DISPLAY} BNB)`
  }
  if (errorStr.includes('market resolved')) {
    return 'This market has already been resolved'
  }
  if (errorStr.includes('not resolved')) {
    return 'Market is not yet resolved'
  }
  if (errorStr.includes('no winnings')) {
    return 'No winnings to claim for this market'
  }
  
  // Return original error if no pattern matches
  return errorStr.length > 100 
    ? 'Transaction failed. Please check your wallet and try again.'
    : errorStr
}
