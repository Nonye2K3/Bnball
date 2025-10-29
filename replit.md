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
- **Contracts:** Production-ready `PredictionMarket.sol` deployed, developed with Hardhat.
- **Security:** Audited and enhanced to prevent common vulnerabilities (reentrancy, owner drain, zero-winner edge cases).
- **Features:** `createMarket` (1.0 BNB stake), `placeBet` (minimum 0.5 BNB), `resolveMarket`, `claimWinnings`.
- **Fee Structure:** 0.5% creator fee (on-chain), 1% platform tax (off-chain, to escrow wallet) resulting in 1.5% total fees.
- **Integration:** wagmi hooks for all contract interactions, gas estimation, transaction confirmation, BSCScan integration.

## External Dependencies

### Third-Party Services
- **Blockchain:** Binance Smart Chain RPC nodes, WalletConnect.
- **Database:** Neon Database (PostgreSQL via @neondatabase/serverless).
- **Sports Data:** TheOddsAPI (live sports data), API-Football (football data including live fixtures, standings).
- **Oracles:** Chainlink Sports Oracle (planned).

### UI Component Libraries
- Radix UI primitives, shadcn/ui design system, Tailwind CSS, class-variance-authority.
- date-fns, embla-carousel-react, lucide-react, cmdk.

### Build & Development
- **Package Manager:** npm.
- **TypeScript:** Strict mode, ESNext modules, path aliases.
- **Tools:** Vite (frontend), esbuild (backend), Drizzle-kit (schema migration).