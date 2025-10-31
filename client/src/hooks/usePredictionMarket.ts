import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  PREDICTION_MARKET_ABI, 
  getContractAddress, 
  GAS_LIMITS,
  isContractDeployed,
  BET_CONFIG,
  FEE_CONFIG
} from '@/lib/contractConfig'
import { 
  validateBetAmount, 
  toBNBWei, 
  parseBlockchainError,
  estimateGasCost,
  checkSufficientBalance,
  formatBNB
} from '@/utils/blockchain'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { persistTransaction } from './useWeb3'
import type { Bet } from '@shared/schema'

/**
 * Hook for placing a bet on a prediction market
 * 
 * The smart contract automatically handles all fees on-chain:
 * - 10% platform fee (sent to PLATFORM_FEE_RECIPIENT immediately)
 * - 2% creator fee (accrued, paid on resolution)
 * - 88% goes to betting pools
 * 
 * Users only need to submit one transaction with the full bet amount.
 */
export function usePlaceBet() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const { data: balance } = useBalance({ address })
  
  // Single contract bet transaction
  const { 
    data: hash, 
    writeContract, 
    isPending,
    error,
    reset
  } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({ hash })

  const [gasEstimate, setGasEstimate] = useState<string>('0.002')
  
  const betDataRef = useRef<{ 
    marketId: string; 
    contractMarketId: number;
    prediction: string; 
    amount: string;
  } | null>(null)

  // After bet transaction succeeds, persist the bet
  useEffect(() => {
    const persistBet = async () => {
      if (isSuccess && hash && address && betDataRef.current) {
        try {
          const formattedAmount = formatBNB(betDataRef.current.amount)
          
          // Persist bet record
          await apiRequest('POST', '/api/bets', {
            marketId: betDataRef.current.marketId,
            userAddress: address,
            prediction: betDataRef.current.prediction,
            amount: betDataRef.current.amount,
            transactionHash: hash,
            chainId,
            claimed: false,
          })
          
          // Persist bet transaction record
          await persistTransaction({
            userAddress: address,
            type: 'bet',
            transactionHash: hash,
            status: 'success',
            chainId,
            value: betDataRef.current.amount,
            metadata: JSON.stringify({
              marketId: betDataRef.current.marketId,
              contractMarketId: betDataRef.current.contractMarketId,
              prediction: betDataRef.current.prediction,
              amount: betDataRef.current.amount,
            }),
          })
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: [`/api/bets/${address}`] })
          await queryClient.invalidateQueries({ queryKey: [`/api/transactions/${address}`] })
          await queryClient.invalidateQueries({ queryKey: ['/api/markets'] })
          
          toast({
            title: "Bet Placed Successfully!",
            description: `Your bet of ${formattedAmount} BNB has been placed. Fees are handled automatically on-chain.`,
          })
        } catch (error) {
          console.error('Failed to persist bet:', error)
          toast({
            title: "Bet Complete",
            description: "Bet placed successfully on blockchain.",
          })
        } finally {
          cleanup()
        }
      }
    }
    
    persistBet()
  }, [isSuccess, hash, address, chainId, toast])

  // Handle bet errors
  useEffect(() => {
    if (error) {
      const errorMsg = parseBlockchainError(error)
      toast({
        title: "Transaction Failed",
        description: errorMsg,
        variant: "destructive",
      })
      cleanup()
    }
  }, [error, toast])

  /**
   * Clean up state after transaction completes or fails
   */
  const cleanup = () => {
    betDataRef.current = null
    reset()
  }

  const placeBet = async (
    marketId: string,
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

    // Convert bet amount to Wei
    const betAmountWei = toBNBWei(amount)
    
    // Calculate total cost including gas (single transaction now)
    const gasEstimateWei = estimateGasCost(GAS_LIMITS.PLACE_BET).gasCostWei
    
    // Check sufficient balance for transaction + gas
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

    // Fetch market to get contractMarketId
    let contractMarketId: number
    try {
      const marketResponse = await fetch(`/api/markets/${marketId}`)
      if (marketResponse.ok) {
        const marketData = await marketResponse.json()
        contractMarketId = marketData.contractMarketId
      } else {
        throw new Error('Failed to fetch market data')
      }
    } catch (err) {
      console.error('Could not fetch market contractMarketId:', err)
      toast({
        title: "Market Error",
        description: "Unable to fetch market information. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Validate that market has been deployed on-chain
    if (!contractMarketId || contractMarketId === 0) {
      toast({
        title: "Market Not Deployed",
        description: "This market has not been deployed on the blockchain yet. Only deployed markets accept bets.",
        variant: "destructive",
      })
      return
    }

    // Store bet data for persistence after transaction succeeds
    betDataRef.current = {
      marketId: marketId,
      contractMarketId: contractMarketId,
      prediction: prediction ? 'yes' : 'no',
      amount: betAmountWei.toString(),
    }

    try {
      toast({
        title: "Placing Bet",
        description: `Submitting your bet of ${amount} BNB. Fees will be handled automatically on-chain.`,
      })

      // Place bet with single transaction - contract handles all fees
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(contractMarketId), prediction],
        value: betAmountWei,
      })
    } catch (error) {
      cleanup()
      toast({
        title: "Transaction Error",
        description: parseBlockchainError(error),
        variant: "destructive",
      })
    }
  }

  return {
    placeBet,
    isLoading: isPending || isConfirming,
    isSuccess,
    txHash: hash,
    gasEstimate,
    error,
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

  const marketDataRef = useRef<{ title: string; description: string; category: string; deadline: Date } | null>(null)

  useEffect(() => {
    const persistMarket = async () => {
      if (isSuccess && hash && address && marketDataRef.current) {
        try {
          // Persist market record
          await apiRequest('POST', '/api/markets', {
            title: marketDataRef.current.title,
            description: marketDataRef.current.description,
            category: marketDataRef.current.category,
            status: 'live',
            startTime: new Date(),
            deadline: marketDataRef.current.deadline,
            resolutionMethod: 'oracle',
            transactionHash: hash,
            chainId,
            creatorAddress: address,
          })
          
          // Persist transaction record
          await persistTransaction({
            userAddress: address,
            type: 'create_market',
            transactionHash: hash,
            status: 'success',
            chainId,
            value: BET_CONFIG.CREATE_MARKET_STAKE.toString(),
            metadata: JSON.stringify({
              title: marketDataRef.current.title,
              category: marketDataRef.current.category,
            }),
          })
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ['/api/markets'] })
          await queryClient.invalidateQueries({ queryKey: ['/api/transactions', address] })
          
          toast({
            title: "Market Created Successfully!",
            description: `Your prediction market is now live.`,
          })
        } catch (error) {
          console.error('Failed to persist market:', error)
          toast({
            title: "Market Created on Blockchain",
            description: "Your market is live on-chain but failed to save locally. It will sync automatically.",
            variant: "destructive",
          })
        } finally {
          marketDataRef.current = null
          reset()
        }
      }
    }
    
    persistMarket()
  }, [isSuccess, hash, address, chainId, toast, reset])

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

    // Store market data for persistence after transaction succeeds
    marketDataRef.current = {
      title,
      description,
      category,
      deadline,
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [title, description, category, deadlineTimestamp],
        value: stakeAmount,
      })
    } catch (error) {
      marketDataRef.current = null
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

  const marketIdRef = useRef<number | null>(null)

  useEffect(() => {
    const markClaimed = async () => {
      if (isSuccess && hash && address && marketIdRef.current !== null) {
        try {
          // Find the bet record
          const betsResponse = await fetch(`/api/bets/${address}`)
          const bets = await betsResponse.json()
          const bet = bets.find((b: any) => b.marketId === marketIdRef.current?.toString())
          
          if (bet) {
            // Mark bet as claimed
            await apiRequest('PATCH', `/api/bets/${bet.id}/claim`, {
              claimTransactionHash: hash,
            })
          }
          
          // Persist claim transaction
          await persistTransaction({
            userAddress: address,
            type: 'claim',
            transactionHash: hash,
            status: 'success',
            chainId,
            value: '0', // Claim doesn't send value, it receives
            metadata: JSON.stringify({
              marketId: marketIdRef.current,
            }),
          })
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: [`/api/bets/${address}`] })
          await queryClient.invalidateQueries({ queryKey: [`/api/transactions/${address}`] })
          
          toast({
            title: "Winnings Claimed!",
            description: "Your winnings have been transferred to your wallet.",
          })
        } catch (error) {
          console.error('Failed to mark bet as claimed:', error)
          toast({
            title: "Claim Successful",
            description: "Your winnings have been transferred.",
          })
        } finally {
          marketIdRef.current = null
          reset()
        }
      }
    }
    
    markClaimed()
  }, [isSuccess, hash, address, chainId, toast, reset])

  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = parseBlockchainError(writeError || confirmError)
      toast({
        title: "Claim Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }, [writeError, confirmError, toast])

  const claimWinnings = async (marketId: string) => {
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

    // Fetch market to get contractMarketId
    let contractMarketId: number;
    try {
      const response = await fetch(`/api/markets/${marketId}`);
      const market = await response.json();
      contractMarketId = market.contractMarketId || 0;
      
      if (!contractMarketId) {
        toast({
          title: "Invalid Market",
          description: "This market is not yet deployed on-chain",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch market details",
        variant: "destructive",
      });
      return;
    }

    marketIdRef.current = contractMarketId

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(contractMarketId)],
      })
    } catch (error) {
      marketIdRef.current = null
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
 * Hook for resolving a market (Oracle only)
 */
export function useResolveMarket() {
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

  const resolveDataRef = useRef<{ marketId: string; result: boolean } | null>(null)

  useEffect(() => {
    const persistResolution = async () => {
      if (isSuccess && hash && address && resolveDataRef.current) {
        try {
          // Update market with resolution
          await apiRequest('PATCH', `/api/markets/${resolveDataRef.current.marketId}`, {
            status: 'completed',
            result: resolveDataRef.current.result ? 'yes' : 'no',
            resolvedTransactionHash: hash,
            resolvedAt: new Date(),
          })
          
          // Persist transaction record
          await persistTransaction({
            userAddress: address,
            type: 'resolve_market',
            transactionHash: hash,
            status: 'success',
            chainId,
            value: '0',
            metadata: JSON.stringify({
              marketId: resolveDataRef.current.marketId,
              result: resolveDataRef.current.result ? 'yes' : 'no',
            }),
          })
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ['/api/markets'] })
          await queryClient.invalidateQueries({ queryKey: [`/api/transactions/${address}`] })
          
          toast({
            title: "Market Resolved!",
            description: `The market has been resolved to: ${resolveDataRef.current.result ? 'YES' : 'NO'}`,
          })
        } catch (error) {
          console.error('Failed to persist resolution:', error)
          toast({
            title: "Resolution Confirmed",
            description: "Market resolved on blockchain.",
          })
        } finally {
          resolveDataRef.current = null
          reset()
        }
      }
    }
    
    persistResolution()
  }, [isSuccess, hash, address, chainId, toast, reset])

  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = parseBlockchainError(writeError || confirmError)
      toast({
        title: "Resolution Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }, [writeError, confirmError, toast])

  const resolveMarket = async (marketId: string, result: boolean) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to resolve the market",
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

    resolveDataRef.current = { marketId, result }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), result],
      })
    } catch (error) {
      resolveDataRef.current = null
      toast({
        title: "Transaction Error",
        description: parseBlockchainError(error),
        variant: "destructive",
      })
    }
  }

  return {
    resolveMarket,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    txHash: hash,
    error: writeError || confirmError,
  }
}

/**
 * Hook for reading market data from the blockchain
 */
export function useMarketData(marketId: number) {
  const chainId = useChainId()
  
  const { data, isLoading, error } = useReadContract({
    address: getContractAddress(chainId),
    abi: PREDICTION_MARKET_ABI,
    functionName: 'markets',
    args: [BigInt(marketId)],
  })

  return {
    marketData: data as any,
    isLoading,
    error,
  }
}

/**
 * Hook for reading user's bet data from the blockchain
 */
export function useUserBet(marketId: number, userAddress: string) {
  const chainId = useChainId()
  
  const { data, isLoading, error } = useReadContract({
    address: getContractAddress(chainId),
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getUserBet',
    args: [BigInt(marketId), userAddress as `0x${string}`],
  })

  return {
    betData: data as any,
    isLoading,
    error,
  }
}

/**
 * Hook for fetching all bets for the connected user
 */
export function useUserBets() {
  const { address } = useAccount()
  
  const { data: bets, isLoading, error, refetch } = useQuery<Bet[]>({
    queryKey: [`/api/bets/${address}`],
    enabled: !!address,
  })

  return {
    bets,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to check if a user is registered
 */
export function useIsRegistered(userAddress?: string) {
  const { address } = useAccount()
  const chainId = useChainId()
  const checkAddress = userAddress || address
  
  const { data: isRegistered, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId),
    abi: PREDICTION_MARKET_ABI,
    functionName: 'isUserRegistered',
    args: checkAddress ? [checkAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!checkAddress,
    }
  })

  return {
    isRegistered: isRegistered as boolean,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get the registration fee in BNB
 */
export function useRegistrationFee() {
  const chainId = useChainId()
  
  const { data: feeInWei, isLoading, error } = useReadContract({
    address: getContractAddress(chainId),
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getRegistrationFeeInBNB',
  })

  return {
    feeInWei: feeInWei as bigint,
    feeInBNB: feeInWei ? formatEther(feeInWei as bigint) : '0',
    isLoading,
    error,
  }
}

/**
 * Hook to register a user (pay $2 USD equivalent in BNB)
 */
export function useRegisterUser() {
	const { address } = useAccount()
	const chainId = useChainId()
	const { toast } = useToast()
	const { feeInWei } = useRegistrationFee()
	
	const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	
	const registerUser = async () => {
		if (!address) {
			toast({ title: "Wallet Not Connected", description: "Please connect your wallet first.", variant: "destructive" })
			return
		}
		
		if (!feeInWei) {
			toast({ title: "Registration Fee Not Available", description: "Unable to fetch registration fee. Please try again.", variant: "destructive" })
			return
		}
		
		// Add 1% buffer to avoid reverts from price change
		const bufferedFee = (feeInWei * BigInt('101')) / BigInt(100)
		
		try {
			writeContract({
				address: getContractAddress(chainId),
				abi: PREDICTION_MARKET_ABI,
				functionName: 'registerUser',
				value: bufferedFee,
				gas: GAS_LIMITS.REGISTER_USER,
			})
		} catch (err: any) {
			const errorMessage = parseBlockchainError(err)
			toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" })
		}
	}
	
	return {
		registerUser,
		isLoading: isPending || isConfirming,
		isSuccess,
		txHash: hash,
		error,
		reset,
	}
}