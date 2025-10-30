import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

// IMPORTANT: Get your own WalletConnect Project ID from https://cloud.walletconnect.com/
// Replace this placeholder with your actual project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

if (projectId === 'YOUR_WALLETCONNECT_PROJECT_ID') {
  console.warn(
    '⚠️ Please get a WalletConnect Project ID from https://cloud.walletconnect.com/ and add it to your .env file as VITE_WALLETCONNECT_PROJECT_ID'
  )
}

// Metadata for WalletConnect
const metadata = {
  name: 'BNBall',
  description: 'First Sports Prediction Market on Binance Smart Chain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://bnball.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    // MetaMask and other browser extension wallets
    injected({ target: 'metaMask' }),
    
    // WalletConnect for mobile wallets
    walletConnect({ 
      projectId,
      metadata,
      showQrModal: false // We'll use Web3Modal for the QR modal
    }),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org/'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
  }
})

// Export the projectId for Web3Modal
export { projectId, metadata }
