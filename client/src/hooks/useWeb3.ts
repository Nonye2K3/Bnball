import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { bsc, bscTestnet } from 'wagmi/chains'

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
