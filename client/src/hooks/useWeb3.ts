import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { bsc, bscTestnet } from 'wagmi/chains'
import { apiRequest, queryClient } from '@/lib/queryClient'

/**
 * Utility to persist blockchain transaction to database
 */
export async function persistTransaction(params: {
  userAddress: string
  type: 'bet' | 'claim' | 'create_market' | 'resolve_market'
  transactionHash: string
  status: 'pending' | 'success' | 'failed'
  chainId: number
  value: string
  gasUsed?: string
  metadata?: string
}) {
  try {
    await apiRequest('POST', '/api/transactions', {
      userAddress: params.userAddress,
      type: params.type,
      transactionHash: params.transactionHash,
      status: params.status,
      chainId: params.chainId,
      value: params.value,
      gasUsed: params.gasUsed,
      metadata: params.metadata,
    })
    
    // Invalidate transaction queries
    await queryClient.invalidateQueries({ queryKey: ['/api/transactions', params.userAddress] })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to persist transaction:', error)
    return { success: false, error }
  }
}

export function useWeb3() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Helper to get current chain info
  const getCurrentChain = () => {
    if (chainId === bsc.id) return bsc
    if (chainId === bscTestnet.id) return bscTestnet
    return null
  }

  // Helper to check if on BSC network
  const isOnBSC = chainId === bsc.id || chainId === bscTestnet.id

  // Helper to switch to BSC mainnet
  const switchToBSC = () => {
    if (switchChain) {
      switchChain({ chainId: bsc.id })
    }
  }

  // Helper to switch to BSC testnet
  const switchToBSCTestnet = () => {
    if (switchChain) {
      switchChain({ chainId: bscTestnet.id })
    }
  }

  // Format address for display
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : null

  // Format balance for display
  const formattedBalance = balance 
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : null

  return {
    // Connection state
    address,
    formattedAddress,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    
    // Balance
    balance,
    formattedBalance,
    
    // Chain info
    chainId,
    chain: getCurrentChain(),
    isOnBSC,
    
    // Actions
    connect: () => open(),
    disconnect,
    switchToBSC,
    switchToBSCTestnet,
    switchChain,
  }
}
