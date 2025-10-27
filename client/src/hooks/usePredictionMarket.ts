import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useBalance } from 'wagmi'
import { parseEther } from 'viem'
import { 
  PREDICTION_MARKET_ABI, 
  getContractAddress, 
  GAS_LIMITS,
  isContractDeployed,
  BET_CONFIG
} from '@/lib/contractConfig'
import { 
  validateBetAmount, 
  toBNBWei, 
  parseBlockchainError,
  estimateGasCost,
  checkSufficientBalance
} from '@/utils/blockchain'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook for placing a bet on a prediction market
 */
export function usePlaceBet() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const { data: balance } = useBalance({ address })
  
  const { 
    data: hash, 
    writeContract, 
    isPending: isWritePending,
    error: writeError,
    reset
  } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess,
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash })

  const [gasEstimate, setGasEstimate] = useState<string>('0.001')

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Bet Placed Successfully!",
        description: `Your bet has been confirmed on the blockchain.`,
      })
      reset()
    }
  }, [isSuccess, toast, reset])

  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = parseBlockchainError(writeError || confirmError)
      toast({
        title: "Transaction Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }, [writeError, confirmError, toast])

  const placeBet = async (
    marketId: number,
    prediction: boolean,
    amount: string
  ) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      })
      return
    }

    if (!isContractDeployed(chainId)) {
      toast({
        title: "Contract Not Deployed",
        description: "Please deploy the contract or switch to a supported network",
        variant: "destructive",
      })
      return
    }

    // Validate bet amount
    const validation = validateBetAmount(amount)
    if (!validation.isValid) {
      toast({
        title: "Invalid Bet Amount",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    // Check sufficient balance
    const betAmountWei = toBNBWei(amount)
    const gasEstimateWei = estimateGasCost(GAS_LIMITS.PLACE_BET).gasCostWei
    
    if (balance) {
      const balanceCheck = checkSufficientBalance(
        balance.value,
        betAmountWei,
        gasEstimateWei
      )
      
      if (!balanceCheck.hasBalance) {
        toast({
          title: "Insufficient Balance",
          description: balanceCheck.error,
          variant: "destructive",
        })
        return
      }
    }

    // Estimate gas cost for display
    const gasCost = estimateGasCost(GAS_LIMITS.PLACE_BET)
    setGasEstimate(gasCost.gasCostBNB)

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), prediction],
        value: betAmountWei,
      })
    } catch (error) {
      toast({
        title: "Transaction Error",
        description: parseBlockchainError(error),
        variant: "destructive",
      })
    }
  }

  return {
    placeBet,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    txHash: hash,
    gasEstimate,
    error: writeError || confirmError,
  }
}

/**
 * Hook for creating a new prediction market
 */
export function useCreateMarket() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const { data: balance } = useBalance({ address })
  
  const { 
    data: hash, 
    writeContract, 
    isPending: isWritePending,
    error: writeError,
    reset
  } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess,
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Market Created Successfully!",
        description: `Your prediction market is now live on the blockchain.`,
      })
      reset()
    }
  }, [isSuccess, toast, reset])

  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = parseBlockchainError(writeError || confirmError)
      toast({
        title: "Transaction Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }, [writeError, confirmError, toast])

  const createMarket = async (
    title: string,
    description: string,
    category: string,
    deadline: Date
  ) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a market",
        variant: "destructive",
      })
      return
    }

    if (!isContractDeployed(chainId)) {
      toast({
        title: "Contract Not Deployed",
        description: "Please deploy the contract or switch to a supported network",
        variant: "destructive",
      })
      return
    }

    // Check sufficient balance for stake
    const stakeAmount = BET_CONFIG.CREATE_MARKET_STAKE
    const gasEstimateWei = estimateGasCost(GAS_LIMITS.CREATE_MARKET).gasCostWei
    
    if (balance) {
      const balanceCheck = checkSufficientBalance(
        balance.value,
        stakeAmount,
        gasEstimateWei
      )
      
      if (!balanceCheck.hasBalance) {
        toast({
          title: "Insufficient Balance",
          description: balanceCheck.error,
          variant: "destructive",
        })
        return
      }
    }

    const deadlineTimestamp = BigInt(Math.floor(deadline.getTime() / 1000))

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [title, description, category, deadlineTimestamp],
        value: stakeAmount,
      })
    } catch (error) {
      toast({
        title: "Transaction Error",
        description: parseBlockchainError(error),
        variant: "destructive",
      })
    }
  }

  return {
    createMarket,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    txHash: hash,
    error: writeError || confirmError,
  }
}

/**
 * Hook for claiming winnings from a resolved market
 */
export function useClaimWinnings() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  
  const { 
    data: hash, 
    writeContract, 
    isPending: isWritePending,
    error: writeError,
    reset
  } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess,
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Winnings Claimed!",
        description: `Your winnings have been transferred to your wallet.`,
      })
      reset()
    }
  }, [isSuccess, toast, reset])

  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = parseBlockchainError(writeError || confirmError)
      toast({
        title: "Transaction Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }, [writeError, confirmError, toast])

  const claimWinnings = async (marketId: number) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim winnings",
        variant: "destructive",
      })
      return
    }

    if (!isContractDeployed(chainId)) {
      toast({
        title: "Contract Not Deployed",
        description: "Please deploy the contract or switch to a supported network",
        variant: "destructive",
      })
      return
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
      })
    } catch (error) {
      toast({
        title: "Transaction Error",
        description: parseBlockchainError(error),
        variant: "destructive",
      })
    }
  }

  return {
    claimWinnings,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    txHash: hash,
    error: writeError || confirmError,
  }
}

/**
 * Hook for fetching market details from the blockchain
 */
export function useMarketDetails(marketId: number) {
  const chainId = useChainId()
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: isContractDeployed(chainId) ? getContractAddress(chainId) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarketDetails',
    args: [BigInt(marketId)],
    query: {
      enabled: isContractDeployed(chainId) && marketId > 0,
      refetchInterval: 10000, // Refetch every 10 seconds for live updates
    }
  })

  return {
    marketDetails: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching user's betting history
 */
export function useUserBets(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount()
  const chainId = useChainId()
  const addressToUse = userAddress || connectedAddress
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: isContractDeployed(chainId) ? getContractAddress(chainId) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getUserBets',
    args: addressToUse ? [addressToUse] : undefined,
    query: {
      enabled: isContractDeployed(chainId) && !!addressToUse,
      refetchInterval: 15000, // Refetch every 15 seconds
    }
  })

  return {
    bets: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching user's bet in a specific market
 */
export function useUserBetInMarket(marketId: number, userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount()
  const chainId = useChainId()
  const addressToUse = userAddress || connectedAddress
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: isContractDeployed(chainId) ? getContractAddress(chainId) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getUserBetInMarket',
    args: addressToUse ? [BigInt(marketId), addressToUse] : undefined,
    query: {
      enabled: isContractDeployed(chainId) && marketId > 0 && !!addressToUse,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  return {
    userBet: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching minimum bet amount from contract
 */
export function useMinBetAmount() {
  const chainId = useChainId()
  
  const { data, isLoading, error } = useReadContract({
    address: isContractDeployed(chainId) ? getContractAddress(chainId) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'minBetAmount',
    query: {
      enabled: isContractDeployed(chainId),
    }
  })

  return {
    minBetAmount: data,
    isLoading,
    error,
  }
}

/**
 * Hook for fetching create market stake amount from contract
 */
export function useCreateMarketStake() {
  const chainId = useChainId()
  
  const { data, isLoading, error } = useReadContract({
    address: isContractDeployed(chainId) ? getContractAddress(chainId) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'createMarketStake',
    query: {
      enabled: isContractDeployed(chainId),
    }
  })

  return {
    createMarketStake: data,
    isLoading,
    error,
  }
}
