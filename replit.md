# BNBall - Sports Prediction Market Platform

## Overview

BNBall is a decentralized sports prediction market platform built on Binance Smart Chain (BSC). It enables users to create and participate in prediction markets for sports events (NBA, FIFA, NFL, eSports, Boxing) with transparent on-chain settlements. The platform uses a dual-token economy (BNB for betting, BNBALL for governance/utility) and employs multiple verification methods including Chainlink oracles, AI verification, and community governance for result determination.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **Styling:** Tailwind CSS with custom design system (shadcn/ui components)
- **State Management:** TanStack Query (React Query) for server state
- **Form Handling:** React Hook Form with Zod validation
- **Build Tool:** Vite

**Design Approach:**
- **Brand Identity:** Black, yellow, green, and orange color scheme based on BNBall logo
- **Visual Style:** Gaming/DeFi hybrid aesthetic with bold colors and modern typography
- Dual-theme support (light/dark mode) with custom color system
- Mobile-first responsive design with breakpoints at 768px (tablet) and 1024px (desktop)
- Typography system using Inter/DM Sans for UI and Space Groto/JetBrains Mono for data
- Component library based on Radix UI primitives with custom variants
- No emoji usage per design guidelines (replaced with text and icons)

**Key Pages:**
- Home (Landing): Redesigned to match reference with Hero (3D soccer balls, feature cards), Live Markets preview (chart visualizations, YES/NO toggles), How It Works (left-aligned steps), and Footer
- Markets: Live prediction markets with betting interface
- How It Works: Platform explanation with parallax animations
- Tokenomics: Dual-token economy details
- Oracle: Multi-layer verification system explanation
- Profile: User wallet balance, betting history with X/Twitter sharing, and transaction history
- Leaderboard: User rankings and statistics (planned)
- Create Market: Form for creating new prediction markets (planned)

**Homepage Redesign (Latest):**
- **Navbar:** Simplified with Markets, How It Works, Whitepaper links + Connect Wallet button
- **Hero Section:** Green heading "Sports predictions, on-chain and transparent", exact subtitle, two CTAs (Start Predicting, How It Works), four feature cards (Non-custodial, Low fees, Real-time prices, On-chain payouts), 3D interactive soccer balls with Binance logo (gracefully degrades in headless browsers)
- **Live Markets Preview:** Three market cards with league badges, countdown timers, mini chart visualizations, exact labels (H142, Realtime prices, Pook time prices, H/H), YES/NO toggle buttons, Predict button
- **How It Works:** Left-aligned three steps (Pick a match, Predict YES or NO, Withdraw on-chain) with right-aligned bullet points (Price by oracles, Audited smart contracts, Secure treasury)
- **Footer:** Learn section (Whitepaper, FAQ), Community section (Twitter, Telegram), 3D social icons with official links, "Play responsibly" text
- **3D Elements:** Three.js integration with error handling for WebGL compatibility
- **3D Social Icons:** Framer Motion-powered icons with depth shadows, glow effects, and hover animations (BSCScan-green, Twitter/X-yellow, Telegram-orange)
- **Light/Dark Mode:** Full support with black background (dark) and white/light gray background (light), yellow/green/orange accents maintained across both themes

**Social Features:**
- **Official Social Links:**
  - Twitter/X: https://x.com/bn_ball_
  - Telegram: https://t.me/BNBALL_Portal
  - BSCScan: https://bscscan.com
- **Win Sharing:** Users can share winning bets to X/Twitter with auto-generated branded images
- **Image Generation:** HTML5 Canvas-based image generator creates 1:1 or 9:16 format images
- **Image Branding:** Generated images include BNBall logo watermark, market details, stake, winnings, and multiplier
- **Custom Tweets:** Users can edit tweet text before posting
- **Download Option:** Users can download win images for manual sharing

**State Management Philosophy:**
- Server state managed through React Query with optimistic updates
- Local UI state managed through React hooks
- No global state management library (Redux/Zustand) - keeping it simple with component state and context

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ES modules
- **Database ORM:** Drizzle ORM
- **Session Management:** express-session with connect-pg-simple

**Current Implementation:**
- In-memory storage implementation (MemStorage) for development
- RESTful API routes for bets, transactions, and markets
- Prepared for PostgreSQL migration (Drizzle config present)

**API Endpoints:**
- `POST /api/bets` - Create new bet record after on-chain confirmation
- `GET /api/bets/:userAddress` - Get betting history for a wallet
- `POST /api/transactions` - Create transaction record
- `GET /api/transactions/:userAddress` - Get transaction history for a wallet
- `GET /api/markets` - Get all prediction markets
- `GET /api/markets/:id` - Get specific market details
- `POST /api/markets/sync` - Sync live sports data from TheOddsAPI
- `POST /api/markets/sync-football` - Sync live football data from API-Football
- `GET /api/football/live` - Get live football fixtures
- `GET /api/football/upcoming?days=7` - Get upcoming football fixtures
- `GET /api/football/standings/:leagueId?season=2024` - Get league standings
- `GET /api/social/win-data/:betId` - Get win data for sharing (market, stake, winnings, multiplier)
- `POST /api/social/share-to-x` - Post win to X/Twitter with image (requires X API credentials)

**API Design:**
- RESTful API with `/api` prefix
- JSON request/response format
- Request validation using Zod schemas
- Request logging middleware for debugging
- Raw body capture for webhook verification
- Duplicate transaction prevention using transaction hash checks

**Architecture Decisions:**
1. **Problem:** Need flexible data persistence strategy
   - **Solution:** Storage interface pattern (IStorage) allowing easy switching between implementations
   - **Rationale:** Enables development with in-memory storage, production with PostgreSQL, and future database migrations

2. **Problem:** Session management for Web3 wallet connections
   - **Solution:** PostgreSQL-backed sessions via connect-pg-simple
   - **Rationale:** Persistent sessions across server restarts, scalable for production

### Database Schema

**ORM Choice:** Drizzle ORM
- **Rationale:** Type-safe, lightweight, SQL-like query builder with excellent TypeScript integration
- **Dialect:** PostgreSQL (via @neondatabase/serverless for Neon DB support)

**Core Tables:**

1. **users**
   - Authentication and user identity
   - Fields: id (UUID), username (unique), password (hashed)

2. **prediction_markets**
   - Sports prediction market definitions
   - Fields: id, title, description, category, status (live/upcoming/completed)
   - Betting data: totalPool, yesOdds, noOdds, participants
   - Timeline: startTime, deadline
   - Resolution: resolutionMethod, result, resolutionData
   - Sports data: oddsApiEventId (TheOddsAPI), apiFootballFixtureId (API-Football), homeTeam, awayTeam, sport, league

3. **bets**
   - User betting records linked to blockchain transactions
   - Fields: id, userAddress (wallet), marketId, prediction (true/false), amount (wei as string), transactionHash, timestamp

4. **transactions**
   - Blockchain transaction history
   - Fields: id, userAddress, type (place_bet/claim_winnings/create_market), transactionHash, value (wei as string), status, timestamp, metadata

**Schema Philosophy:**
- UUID primary keys for distributed system compatibility
- Wei amounts stored as strings to preserve precision (converted with BigInt + formatEther for display)
- Transaction hashes for blockchain verification and BSCScan links
- Text fields for flexible resolution data (JSON storage for oracle responses)
- Status tracking for market lifecycle and transaction states

### Authentication & Authorization

**Current State:** Web3 wallet authentication fully implemented

**Implementation:**
- Web3 wallet-based authentication using wagmi v2 and @web3modal/wagmi
- Support for MetaMask, WalletConnect, Coinbase Wallet, and other injected wallets
- Session-based state management for connected wallets
- Binance Smart Chain Mainnet (Chain ID: 56) and Testnet (Chain ID: 97) support
- No traditional password authentication - purely wallet-based

### Smart Contract Integration

**Blockchain:** Binance Smart Chain
- **Tokens:** BNB (native), BNBALL (custom token)
- **Resolution Methods:** 
  - Chainlink Sports Oracle for real-time sports data
  - AI verification for complex scenarios
  - Community governance voting for disputes

**Smart Contract Deployment (Latest):**
- ✅ **PredictionMarket.sol** - Production-ready Solidity contract deployed
- ✅ **Hardhat Infrastructure** - Full deployment toolchain configured for BSC Mainnet/Testnet
- ✅ **Security Audited** - All critical vulnerabilities fixed:
  - Removed owner drain function
  - Tracks actual stake amounts per market
  - Uses call() instead of transfer() for smart contract wallet compatibility
  - Handles zero-winner edge case with proportional refunds
  - Follows checks-effects-interactions pattern to prevent reentrancy
- ✅ **Contract Features:**
  - createMarket: Requires 1.0 BNB stake (refunded after resolution)
  - placeBet: Minimum 0.5 BNB, prevents double-betting
  - resolveMarket: Owner-only, pays 0.5% creator fee + refunds stake
  - claimWinnings: Proportional payouts, handles zero-winner scenarios
  - View functions: getMarketDetails, getUserBets, getUserBetInMarket

**Deployment Infrastructure:**
- **Hardhat** - Solidity compilation and deployment framework
- **Scripts:** Automated deployment script with balance checks and verification
- **Configuration:** BSC Mainnet (Chain ID 56) and Testnet (Chain ID 97)
- **Verification:** BSCScan integration for contract source code verification
- **Documentation:** Comprehensive DEPLOYMENT.md guide with step-by-step instructions

**Implementation:**
- Complete smart contract interaction layer with wagmi hooks
- PredictionMarket contract ABI with functions: placeBet, claimWinnings, createMarket, resolveMarket
- 0.5 BNB minimum bet enforcement (validated before transaction)
- Gas estimation with 20% buffer for transaction reliability
- Transaction confirmation with real-time status updates
- BSCScan integration for transaction viewing
- Bet and transaction persistence to database after on-chain confirmation

**Integration Points:**
- Escrow wallet for 1% platform tax collection (off-chain, frontend-enforced)
- Market creation requires exact stake payment (1.0 BNB)
- Creator fee distribution (0.5% of total pool, on-chain)
- Dispute resolution mechanism (centralized owner control - future: DAO governance)

**⚠️ Fee Structure (CRITICAL - See SMART_CONTRACT_FEES.md):**
- **On-Chain (Smart Contract)**: 0.5% creator fee only (deducted at resolution, paid to market creator)
- **Off-Chain (Frontend)**: 1% platform tax sent to escrow wallet (separate transaction before bet)
- **User Experience**: Two transactions per bet (1% to escrow + 99% to contract pools)
- **Total Fees**: 1% platform + 0.5% creator = 1.5% total (split between off-chain and on-chain)
- **Winner Payouts**: From 99.5% of pool (after 0.5% creator fee)
- **Documentation**: See `SMART_CONTRACT_FEES.md` for full analysis and options

## External Dependencies

### Third-Party Services

**Blockchain Infrastructure:**
- Binance Smart Chain RPC nodes
- WalletConnect for wallet connections
- Neon Database (PostgreSQL provider via @neondatabase/serverless)

**Sports Data Services:**
- **TheOddsAPI** - Live sports data and odds for NBA, NFL, MLB, Soccer, and more
- **API-Football** - Comprehensive football/soccer data including live fixtures, standings, and statistics
  - Supported leagues: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, UEFA Champions League
  - Features: Live match data, upcoming fixtures, league standings, head-to-head stats
- **Chainlink Sports Oracle** (planned) - Decentralized oracle for result verification
- **Custom AI verification system** (planned)
- **Community governance contracts** (planned)

**Development Tools:**
- Replit-specific plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- Vite for development server and bundling

### UI Component Libraries

**Core:**
- Radix UI primitives (17+ component packages for accessible, unstyled components)
- shadcn/ui design system (custom-configured with "new-york" style)
- Tailwind CSS for utility-first styling
- class-variance-authority for component variants

**Additional:**
- date-fns for date formatting
- embla-carousel-react for carousels
- lucide-react for icons
- cmdk for command palette

### Build & Development

**Package Manager:** npm
**TypeScript Configuration:**
- Strict mode enabled
- ESNext module system
- Path aliases: @/ for client, @shared/ for shared code

**Scripts:**
- `dev`: Development server with tsx watch mode
- `build`: Vite build + esbuild for server bundling
- `start`: Production server
- `db:push`: Drizzle schema migration

**Deployment Strategy:**
- Client: Vite builds to dist/public
- Server: esbuild bundles to dist/index.js
- Single-server deployment with static file serving