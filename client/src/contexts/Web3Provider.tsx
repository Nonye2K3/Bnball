import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, projectId, metadata } from '@/lib/web3Config'

// Create a separate QueryClient for wagmi to avoid conflicts
const wagmiQueryClient = new QueryClient()

// Create Web3Modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(142 76% 36%)', // Match your primary color
    '--w3m-border-radius-master': '8px'
  }
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={wagmiQueryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
