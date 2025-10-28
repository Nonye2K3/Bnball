# Overview

This is a Next.js 16 web application built with React and TypeScript, utilizing a comprehensive UI component library based on Radix UI primitives. The project appears to be a modern web application with a focus on user interface components and accessibility. Based on the vercel.json configuration, there are indications of blockchain/Web3 integration with WalletConnect and prediction market smart contracts.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js 16.0.0 with React
- **Rationale**: Next.js provides server-side rendering, static site generation, and API routes in a single framework
- **Benefits**: Improved SEO, faster initial page loads, and simplified full-stack development

**UI Component System**: Radix UI + Custom Component Library
- **Component primitives**: Extensive use of Radix UI components (accordion, dialog, dropdown, select, toast, etc.)
- **Styling approach**: Tailwind CSS (via autoprefixer) with class-variance-authority for component variants
- **Theming**: next-themes for dark/light mode support
- **Icons**: lucide-react for consistent iconography
- **Rationale**: Radix UI provides unstyled, accessible components that can be customized while maintaining WCAG compliance
- **Benefits**: Accessibility built-in, full design control, reduced development time

**Form Management**: React Hook Form with resolvers
- **Rationale**: Performant form handling with minimal re-renders
- **Benefits**: Built-in validation, TypeScript support, smaller bundle size

**Additional UI Libraries**:
- cmdk for command palette/search functionality
- embla-carousel-react for carousel components
- input-otp for one-time password inputs
- date-fns for date manipulation

## Deployment & Hosting

**Platform**: Vercel
- **Build configuration**: Custom build command with static output to `dist/public`
- **Routing strategy**: API routes proxied to `/api`, all other routes serve static content
- **Framework mode**: Configured as "other" (non-standard Next.js deployment)

## Environment Configuration

**Session Management**: Uses SESSION_SECRET environment variable for secure session handling

**Web3 Integration**:
- WalletConnect Project ID configured for wallet connectivity
- Prediction Market smart contract deployed on testnet at `0xc771cB065CF393a9Bde512714dCBD20C69Af59Ac`
- **Rationale**: Enables decentralized application features with wallet-based authentication

## Development Workflow

**Analytics**: Vercel Analytics integration for tracking user behavior and performance metrics

**Code Quality**: ESLint configuration with Semgrep security rules
- Includes security scanning for sensitive parameter handling (particularly for Bicep/Azure deployments)
- Focus on preventing credential leakage in logs and configuration files

# External Dependencies

## UI & Component Libraries
- **Radix UI**: Complete suite of accessible UI primitives (26+ component packages)
- **Tailwind CSS**: Utility-first CSS framework via autoprefixer
- **Lucide React**: Icon library
- **next-themes**: Theme management system

## Web3/Blockchain
- **WalletConnect**: Web3 wallet connection protocol (Project ID: d2d2839b983c4f6d3f6cb0c1ac366e08)
- **Smart Contracts**: Prediction market contract on testnet (Ethereum-compatible chain)

## Analytics & Monitoring
- **Vercel Analytics**: Performance and user behavior tracking

## Development Tools
- **ESLint**: Code linting and quality enforcement
- **Semgrep**: Security scanning with custom rules for Azure/Bicep deployments

## Utility Libraries
- **clsx & class-variance-authority**: Conditional CSS class management
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command menu implementation
- **embla-carousel-react**: Carousel functionality
- **input-otp**: OTP input handling