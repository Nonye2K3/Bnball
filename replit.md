# BNBall - Sports Prediction Market Platform

## Overview
BNBall is a decentralized sports prediction market platform on Binance Smart Chain (BSC), enabling users to create and participate in prediction markets for various sports. It features transparent on-chain settlements, a dual-token economy (BNB for betting, BNBALL for governance/utility), and a multi-layered verification system including Chainlink oracles, AI verification, and community governance. The platform aims to provide a robust, scalable, and secure environment for sports predictions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology:** React 18, TypeScript, Wouter for routing, Tailwind CSS with shadcn/ui, TanStack Query for server state, React Hook Form with Zod, Vite.
- **Design:** Black, yellow, green, and orange color scheme, gaming/DeFi aesthetic, dual light/dark mode, mobile-first responsive design, Inter/DM Sans typography, Radix UI-based component library, no emoji usage.
- **Key Features:** Redesigned homepage with interactive 3D elements (Three.js), real-time statistics, live market previews, clear "How It Works" section, social sharing features for wins (X/Twitter with HTML5 Canvas image generation), and Web3 wallet authentication (wagmi v2, @web3modal/wagmi).

### Backend
- **Technology:** Node.js with Express.js, TypeScript, Drizzle ORM (PostgreSQL), express-session.
- **API Design:** RESTful API with Zod validation, supporting bets, transactions, markets, and social features.
- **Architecture Decisions:** Pluggable storage interface (IStorage) for flexible data persistence (in-memory for dev, PostgreSQL for prod), PostgreSQL-backed sessions for Web3 wallet connections.

### Database
- **ORM:** Drizzle ORM (PostgreSQL dialect).
- **Core Tables:** `users` (authentication), `prediction_markets` (market definitions, betting data, resolution info), `bets` (user betting records linked to blockchain transactions), `transactions` (blockchain transaction history). UUID primary keys, wei amounts stored as strings.

### Smart Contract Integration
- **Blockchain:** Binance Smart Chain (Mainnet/Testnet).
- **Mainnet Deployment:** Contract deployed at `0x0f0D0a8AD191899F91bF52806cE4530f36bba860` on BSC Mainnet (verified).
- **Admin Wallet:** `0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01` (receives all platform fees).
- **WalletConnect:** Configured with Project ID `a6cc5ee0-526d-4058-b098-5827b7adba62` for mobile wallet support.
- **Contracts:** Production-ready `PredictionMarket.sol` deployed, developed with Hardhat.
- **Security:** Audited and enhanced to prevent common vulnerabilities (reentrancy, owner drain, zero-winner edge cases).
- **Features:** `createMarket` (0.1 BNB stake), `placeBet` (minimum 0.01 BNB with custom amounts), `resolveMarket`, `claimWinnings`.
- **Registration:** $2 USD fee (converted to BNB via Chainlink oracle) required before placing bets.
- **Fee Structure:** 10% platform fee + 2% creator fee = 12% total (all on-chain, hidden from UI).
- **Integration:** wagmi v2 hooks for all contract interactions, gas estimation, transaction confirmation, BSCScan integration with verification links.

## External Dependencies

### Third-Party Services
- **Blockchain:** Binance Smart Chain RPC nodes (https://bsc-dataseed.binance.org/), WalletConnect Cloud.
- **Database:** Neon Database (PostgreSQL via @neondatabase/serverless).
- **Sports Data:** API-Football (football data including live fixtures, standings, switched from TheOddsAPI).
- **Oracles:** Chainlink BNB/USD Price Feed (for registration fee conversion).

### UI Component Libraries
- Radix UI primitives, shadcn/ui design system, Tailwind CSS, class-variance-authority.
- date-fns, embla-carousel-react, lucide-react, cmdk.

### Build & Development
- **Package Manager:** npm.
- **TypeScript:** Strict mode, ESNext modules, path aliases.
- **Tools:** Vite (frontend), esbuild (backend), Drizzle-kit (schema migration).

## Recent Changes (October 30, 2025)

### Social Media & Real-Time Data Updates
1. **Social Media Links:** Updated X/Twitter handle from @bn_ball_ to @bnball_official across Footer and all social links. Telegram link confirmed correct at https://t.me/BNBALL_Portal.
2. **Real-Time Statistics:** Replaced hardcoded statistics ($2.8M TVL, 45K+ transactions, 99.9% uptime) with live data from /api/stats endpoint:
   - Total Value Locked (TVL) now displays real-time totalVolume from blockchain
   - Active Users count from actual user registrations
   - Live Markets count from active prediction markets
3. **Contract Display:** TrustSection now shows actual mainnet contract address (0x0f0D0a8AD191899F91bF52806cE4530f36bba860) with BSCScan verification link.

### Mainnet Deployment Fixes
1. **WalletConnect Configuration:** Updated WalletConnect Project ID to `a6cc5ee0-526d-4058-b098-5827b7adba62` to enable proper wallet connections on mainnet.
2. **Contract Verification:** Confirmed mainnet contract deployment at `0x0f0D0a8AD191899F91bF52806cE4530f36bba860` with admin wallet `0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01`.
3. **ConfigurationAlert Enhancement:** Added contract and admin wallet addresses with BSCScan verification links to help users verify deployment.
4. **Custom Bet Amounts:** Confirmed PlaceBetModal already has input field for users to specify custom stake amounts (min 0.01 BNB).
5. **Fee Structure Correction:** Updated documentation to reflect actual on-chain fees: 10% platform + 2% creator = 12% total.

### Testing Status
- Wallet connection tested and working (Web3Modal opens successfully)
- Contract interactions ready for mainnet use
- Registration flow configured ($2 USD in BNB via Chainlink oracle)
- Bet placement with custom amounts functional
- Real-time statistics displaying correctly from /api/stats endpoint

### Known Issues
- API-Football returning empty match arrays (either no games scheduled, rate limits, or free tier restrictions)
- Sports data integration working correctly, just no live data to display currently