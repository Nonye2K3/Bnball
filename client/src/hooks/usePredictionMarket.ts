import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useBalance, useSendTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  PREDICTION_MARKET_ABI, 
  getContractAddress, 
  GAS_LIMITS,
  isContractDeployed,
  BET_CONFIG,
  ESCROW_WALLET_ADDRESS,
  TAX_CONFIG
} from '@/lib/contractConfig'
import { 
  validateBetAmount, 
  toBNBWei, 
  parseBlockchainError,
  estimateGasCost,
  checkSufficientBalance,
  calculateBetSplit,
  formatBetSplit,
  calculateTotalBetCost
} from '@/utils/blockchain'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { persistTransaction } from './useWeb3'

/**
 * Hook for placing a bet on a prediction market with 1% escrow tax
 * 
 * CRITICAL: Tax is collected FIRST, then the bet is placed.
 * This ensures users cannot bypass the tax by rejecting the second transaction.
 */
export function usePlaceBet() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const { data: balance } = useBalance({ address })
  
  // Escrow tax transfer transaction (FIRST TRANSACTION)
  const {
    data: escrowHash,
    sendTransaction,
    isPending: isEscrowPending,
    error: escrowError,
    reset: resetEscrow
  } = useSendTransaction()

  const {
    isLoading: isEscrowConfirming,
    isSuccess: isEscrowSuccess
  } = useWaitForTransactionReceipt({ hash: escrowHash })

  // Contract bet transaction (SECOND TRANSACTION - only after tax is confirmed)
  const { 
    data: betHash, 
    writeContract, 
    isPending: isBetPending,
    error: betError,
    reset: resetBet
  } = useWriteContract()
  
  const { 
    isLoading: isBetConfirming, 
    isSuccess: isBetSuccess 
  } = useWaitForTransactionReceipt({ hash: betHash })

  const [gasEstimate, setGasEstimate] = useState<string>('0.002')
  const [betSplit, setBetSplit] = useState<{ pool: string; tax: string; total: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<'idle' | 'tax' | 'bet' | 'complete'>('idle')
  
  const betDataRef = useRef<{ 
    marketId: string; 
    prediction: string; 
    totalAmount: string;
    poolAmount: string;
    taxAmount: string;
  } | null>(null)

  // STEP 1: After escrow tax transaction is confirmed, proceed to bet placement
  useEffect(() => {
    const handleTaxSuccess = async () => {
      if (isEscrowSuccess && escrowHash && address && betDataRef.current && currentStep === 'tax') {
        try {
          // Persist escrow tax transaction record
          await persistTransaction({
            userAddress: address,
            type: 'escrow_tax',
            transactionHash: escrowHash,
            status: 'success',
            chainId,
            value: betDataRef.current.taxAmount,
            metadata: JSON.stringify({
              marketId: betDataRef.current.marketId,
              escrowWallet: ESCROW_WALLET_ADDRESS,
              taxRate: TAX_CONFIG.TAX_RATE_PERCENT,
            }),
          })
          
          toast({
            title: "Tax Payment Confirmed",
            description: `Step 2/2: Placing your bet on the contract...`,
          })

          setCurrentStep('bet')

          // Now place the bet on the contract
          const marketId = parseInt(betDataRef.current.marketId)
          const prediction = betDataRef.current.prediction === 'yes'
          
          writeContract({
            address: getContractAddress(chainId),
            abi: PREDICTION_MARKET_ABI,
            functionName: 'placeBet',
            args: [BigInt(marketId), prediction],
            value: BigInt(betDataRef.current.poolAmount), // 99% goes to the betting pool
          })
        } catch (error) {
          console.error('Failed to persist tax or place bet:', error)
          // Still try to place the bet even if persistence failed
          try {
            const marketId = parseInt(betDataRef.current.marketId)
            const prediction = betDataRef.current.prediction === 'yes'
            
            writeContract({
              address: getContractAddress(chainId),
              abi: PREDICTION_MARKET_ABI,
              functionName: 'placeBet',
              args: [BigInt(marketId), prediction],
              value: BigInt(betDataRef.current.poolAmount),
            })
          } catch (betErr) {
            console.error('Failed to place bet after tax payment:', betErr)
            toast({
              title: "Error Placing Bet",
              description: "Tax was paid but bet placement failed. Please contact support for a refund.",
              variant: "destructive",
            })
            // Mark for refund
            await markForRefund(escrowHash, betDataRef.current.marketId)
            cleanup()
          }
        }
      }
    }
    
    handleTaxSuccess()
  }, [isEscrowSuccess, escrowHash, address, chainId, toast, writeContract, currentStep])

  // STEP 2: After bet transaction succeeds, persist the bet
  useEffect(() => {
    const persistBet = async () => {
      if (isBetSuccess && betHash && address && betDataRef.current && currentStep === 'bet') {
        try {
          // Persist bet record with tax transaction hash
          await apiRequest('POST', '/api/bets', {
            marketId: betDataRef.current.marketId,
            userAddress: address,
            prediction: betDataRef.current.prediction,
            amount: betDataRef.current.poolAmount,
            transactionHash: betHash,
            taxTransactionHash: escrowHash, // Link to the tax transaction
            taxStatus: 'confirmed',
            chainId,
            claimed: false,
          })
          
          // Persist bet transaction record
          await persistTransaction({
            userAddress: address,
            type: 'bet',
            transactionHash: betHash,
            status: 'success',
            chainId,
            value: betDataRef.current.poolAmount,
            metadata: JSON.stringify({
              marketId: betDataRef.current.marketId,
              prediction: betDataRef.current.prediction,
              totalBetAmount: betDataRef.current.totalAmount,
              poolAmount: betDataRef.current.poolAmount,
              taxAmount: betDataRef.current.taxAmount,
              taxTransactionHash: escrowHash,
              escrowWallet: ESCROW_WALLET_ADDRESS,
            }),
          })
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: [`/api/bets/${address}`] })
          await queryClient.invalidateQueries({ queryKey: [`/api/transactions/${address}`] })
          
          toast({
            title: "Bet Placed Successfully!",
            description: `Your bet of ${betSplit?.pool} BNB has been placed. Tax of ${betSplit?.tax} BNB was collected.`,
          })

          setCurrentStep('complete')
        } catch (error) {
          console.error('Failed to persist bet:', error)
          toast({
            title: "Bet Complete",
            description: "Bet placed successfully on blockchain.",
          })
          setCurrentStep('complete')
        } finally {
          cleanup()
        }
      }
    }
    
    persistBet()
  }, [isBetSuccess, betHash, escrowHash, address, chainId, toast, currentStep, betSplit])

  // Handle escrow tax error (STEP 1 fails)
  useEffect(() => {
    if (escrowError && currentStep === 'tax') {
      const errorMsg = parseBlockchainError(escrowError)
      toast({
        title: "Tax Payment Failed",
        description: `Unable to collect platform tax: ${errorMsg}. Your bet was not placed.`,
        variant: "destructive",
      })
      cleanup()
    }
  }, [escrowError, toast, currentStep])

  // Handle bet error (STEP 2 fails - tax already paid!)
  useEffect(() => {
    const handleBetError = async () => {
      if (betError && currentStep === 'bet' && escrowHash && betDataRef.current) {
        const errorMsg = parseBlockchainError(betError)
        toast({
          title: "Bet Transaction Failed",
          description: `Tax was paid but bet failed: ${errorMsg}. You will be refunded. Please contact support.`,
          variant: "destructive",
        })
        
        // Mark this transaction for refund since tax was paid but bet failed
        await markForRefund(escrowHash, betDataRef.current.marketId)
        cleanup()
      }
    }
    
    handleBetError()
  }, [betError, toast, currentStep, escrowHash])

  /**
   * Helper function to mark a failed bet for refund
   */
  const markForRefund = async (taxHash: string, marketId: string) => {
    try {
      if (!address) return
      
      // Create a bet record marked as refund-eligible
      await apiRequest('POST', '/api/bets', {
        marketId: marketId,
        userAddress: address,
        prediction: betDataRef.current?.prediction || 'yes',
        amount: '0', // No bet was actually placed
        transactionHash: taxHash, // Use tax transaction hash as reference
        taxTransactionHash: taxHash,
        taxStatus: 'confirmed',
        chainId,
        claimed: false,
        refundEligible: true,
      })
    } catch (error) {
      console.error('Failed to mark for refund:', error)
    }
  }

  /**
   * Clean up state after transaction sequence completes or fails
   */
  const cleanup = () => {
    betDataRef.current = null
    setBetSplit(null)
    setCurrentStep('idle')
    resetBet()
    resetEscrow()
  }

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

    // Calculate bet split (99% to pool, 1% to escrow)
    const totalBetWei = toBNBWei(amount)
    const split = calculateBetSplit(totalBetWei)
    const formatted = formatBetSplit(totalBetWei)
    setBetSplit({
      total: formatted.total,
      pool: formatted.pool,
      tax: formatted.tax,
    })

    // Calculate total cost including gas for both transactions
    const costBreakdown = calculateTotalBetCost(
      totalBetWei,
      GAS_LIMITS.PLACE_BET,
      BigInt(21000) // Standard transfer gas
    )
    
    // Check sufficient balance for both transactions + gas
    if (balance) {
      const balanceCheck = checkSufficientBalance(
        balance.value,
        totalBetWei,
        costBreakdown.totalGas
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

    // Estimate gas cost for display (both transactions)
    const totalGasCost = estimateGasCost(costBreakdown.totalGas)
    setGasEstimate(totalGasCost.gasCostBNB)

    // Store bet data for persistence after transactions succeed
    betDataRef.current = {
      marketId: marketId.toString(),
      prediction: prediction ? 'yes' : 'no',
      totalAmount: totalBetWei.toString(),
      poolAmount: split.poolAmount.toString(),
      taxAmount: split.taxAmount.toString(),
    }

    try {
      setCurrentStep('tax')
      
      toast({
        title: "Step 1/2: Paying Platform Tax",
        description: `Sending ${formatted.tax} BNB (${TAX_CONFIG.TAX_RATE_PERCENT}%) to escrow wallet...`,
      })

      // CRITICAL: Send tax FIRST
      sendTransaction({
        to: ESCROW_WALLET_ADDRESS,
        value: split.taxAmount, // 1% goes to escrow
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
    isLoading: isEscrowPending || isEscrowConfirming || isBetPending || isBetConfirming,
    isSuccess: isBetSuccess && isEscrowSuccess,
    txHash: betHash,
    escrowTxHash: escrowHash,
    gasEstimate,
    betSplit,
    currentStep,
    error: betError || escrowError,
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

    marketIdRef.current = marketId

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
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
