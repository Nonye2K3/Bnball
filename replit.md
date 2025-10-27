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
- Reference-based design inspired by BNBet, Uniswap/Aave, and modern sports platforms
- Dual-theme support (light/dark mode) with custom color system
- Mobile-first responsive design with breakpoints at 768px (tablet) and 1024px (desktop)
- Typography system using Inter/DM Sans for UI and Space Groto/JetBrains Mono for data
- Component library based on Radix UI primitives with custom variants

**Key Pages:**
- Home: Market listings with category filters and statistics
- Create Market: Form for creating new prediction markets
- Leaderboard: User rankings and statistics
- FAQ: Platform documentation

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
- Minimal backend setup with placeholder routes
- In-memory storage implementation (MemStorage) for development
- Prepared for PostgreSQL migration (Drizzle config present)

**API Design:**
- RESTful API with `/api` prefix
- JSON request/response format
- Request logging middleware for debugging
- Raw body capture for webhook verification

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

**Schema Philosophy:**
- UUID primary keys for distributed system compatibility
- Decimal types for financial precision (18 decimals, 8 scale for crypto amounts)
- Text fields for flexible resolution data (JSON storage for oracle responses)
- Status tracking for market lifecycle management

### Authentication & Authorization

**Current State:** Basic user schema prepared, no auth implementation yet

**Planned Approach:**
- Web3 wallet-based authentication (MetaMask, Trust Wallet, WalletConnect)
- Signature-based login (message signing for wallet verification)
- Session-based state management for connected wallets
- No traditional password authentication for end users

### Smart Contract Integration (Planned)

**Blockchain:** Binance Smart Chain
- **Tokens:** BNB (native), BNBALL (custom token)
- **Resolution Methods:** 
  - Chainlink Sports Oracle for real-time sports data
  - AI verification for complex scenarios
  - Community governance voting for disputes

**Integration Points:**
- Escrow vault contract for holding betting funds
- Market creation contract (requires BNBALL staking)
- Automated settlement based on oracle data
- Dispute resolution mechanism

## External Dependencies

### Third-Party Services

**Blockchain Infrastructure:**
- Binance Smart Chain RPC nodes
- WalletConnect for wallet connections
- Neon Database (PostgreSQL provider via @neondatabase/serverless)

**Oracle Services (Planned):**
- Chainlink Sports Data Feeds
- Custom AI verification system
- Community governance contracts

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