import { createWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, projectId, metadata } from '@/lib/web3Config'
import { useEffect } from 'react'

// Create a separate QueryClient for wagmi to avoid conflicts
const wagmiQueryClient = new QueryClient()

// Create Web3Modal instance with auto theme detection
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeVariables: {
    '--w3m-accent': 'hsl(142 76% 36%)', // Match your primary color
    '--w3m-border-radius-master': '8px'
  }
})

interface Web3ProviderProps {
  children: React.ReactNode
}

function ThemeSyncWrapper({ children }: { children: React.ReactNode }) {
  const { setThemeMode } = useWeb3ModalTheme()
  
  useEffect(() => {
    // Sync Web3Modal theme with document theme
    const isDark = document.documentElement.classList.contains('dark')
    setThemeMode(isDark ? 'dark' : 'light')
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setThemeMode(isDark ? 'dark' : 'light')
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [setThemeMode])
  
  return <>{children}</>
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={wagmiQueryClient}>
        <ThemeSyncWrapper>
          {children}
        </ThemeSyncWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
