# BNBall.app Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based with DeFi/Crypto Focus

Drawing inspiration from:
- **BNBet** for core prediction market UX patterns
- **Uniswap/Aave** for clean DeFi interface design
- **Modern Sports Platforms** (ESPN, TheScore) for sports-centric visual language
- **Crypto Dashboards** for data-dense information architecture

**Core Principle**: Create a futuristic, high-energy sports prediction platform that balances the excitement of sports betting with the trust and clarity required for DeFi applications.

---

## Typography System

### Font Families
- **Primary (Headings/UI)**: Inter or DM Sans - clean, modern, technical feel
- **Secondary (Body/Data)**: Space Groto or JetBrains Mono for numerical data, odds, and technical information

### Hierarchy
- **Hero Headlines**: Font weight 700, extremely large (text-6xl to text-8xl)
- **Section Headers**: Font weight 700, large (text-4xl to text-5xl)
- **Card Titles**: Font weight 600, medium-large (text-xl to text-2xl)
- **Body Text**: Font weight 400-500, standard (text-base to text-lg)
- **Data/Numbers**: Font weight 600-700, monospace for odds and statistics (text-lg to text-3xl)
- **Labels/Meta**: Font weight 500, small (text-sm to text-xs), uppercase with letter spacing for categories

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Micro spacing: 2, 3, 4 (gaps, padding within components)
- Component spacing: 6, 8, 12 (card padding, button spacing)
- Section spacing: 16, 20, 24 (vertical section separation)

### Grid Structure
- **Container**: max-w-7xl with px-4 to px-8 responsive padding
- **Prediction Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- **Info Sections**: Flexible column layouts (1-2 columns on desktop, stack on mobile)

### Responsive Breakpoints
- Mobile-first approach
- Tablet: md (768px) - 2-column grids
- Desktop: lg (1024px) - 3-column grids, full navigation

---

## Component Library

### 1. Hero Section
**Layout**: Full-width with contained content, min-h-screen approach with natural flow
- Large hero image showing sports action (stadium, athletes mid-action) with gradient overlay
- Centered headline emphasizing "First Sports Prediction Market on Binance Chain"
- Dual CTA buttons (primary: "Start Predicting", secondary: "Learn How It Works") with blurred backgrounds when overlaying image
- Live statistics ticker below hero: total bets, active markets, total volume (scrolling animation)

### 2. Prediction Market Cards
**Structure**: Prominent card-based design with clear information hierarchy
- Card container: rounded-2xl, distinct elevation/border treatment
- Header section: Sport category badge, match/event title (bold, large)
- Prediction options: Side-by-side YES/NO or Team A/Team B layout
- Each option shows: current odds, percentage split, potential return (in large monospace numerals)
- Metadata footer: Start time, deadline, total pool size, number of participants
- Status badge: "Live", "Upcoming", "Completed" with icon indicators
- CTA button: "Place Bet" or "View Results" depending on status

### 3. Navigation
**Top Navigation**: 
- Sticky header with logo (left), main navigation links (center), wallet connect button (right)
- Links: Active Markets, Create Bet, How It Works, Leaderboard
- Mobile: Hamburger menu that slides in from right

### 4. Information Sections (How to Play)
**Layout**: Numbered step cards in horizontal scrolling row (mobile) or 3-column grid (desktop)
- Each step: Large number indicator, icon, title, concise description
- Progressive disclosure: Can expand for more details
- Visual flow indicators connecting steps

### 5. Stats Dashboard Widget
**Escrow Vault Display**:
- Total value locked prominently displayed
- Breakdown by token type (BNB, platform token)
- Real-time ticker effect for updating values
- Contract address with copy function

### 6. Category Filters
**Filter Bar**: Sticky below header when scrolling
- Pill-style buttons for categories (All Sports, Football, Basketball, E-Sports, etc.)
- Active state with distinct visual treatment
- Horizontal scroll on mobile, full display on desktop

### 7. Results Display (Completed Bets)
- Dimmed card treatment to differentiate from active bets
- Clear resolution method indicator: "Oracle Data" or "AI Verified" or "Community Vote"
- Final result prominently displayed with supporting data
- Distribution breakdown showing winning/losing amounts

### 8. Footer
- Multi-column layout: About/Info, Quick Links, Social, Contract Info
- Newsletter signup for market updates
- Security badges and audit information
- Social proof: "Verified Smart Contracts" badges

---

## Animations & Interactions

**Minimal, Purposeful Motion**:
- Card hover: Subtle lift effect (transform translateY(-2px))
- Live market indicators: Gentle pulse animation
- Data updates: Smooth number transitions when odds change
- Scroll reveals: Fade-in for sections (very subtle)
- NO complex scroll-jacking or distracting effects

---

## Images

### Hero Section
**Primary Hero Image**: 
- High-energy sports action shot (stadium atmosphere, dramatic moment, crowd excitement)
- Futuristic treatment with gradient overlay (dark to transparent top-to-bottom)
- Suggested dimensions: 1920x1080 minimum, optimized for web
- Position: Background cover, center focus

### Additional Visual Elements
- **Category Icons**: Use Heroicons or Font Awesome sports icons (basketball, football, gaming controller)
- **Illustration Assets**: Consider abstract geometric patterns for backgrounds in info sections
- **Trophy/Leaderboard**: Achievement imagery for leaderboard section
- **Trust Indicators**: Binance Chain logo, security badges (use official brand assets)

---

## Special Considerations

### DeFi Trust Elements
- Transparent contract address display with verification badge
- Real-time on-chain data indicators
- Clear explanation of fund custody (escrow vault)
- Audit certification badges prominently placed

### Sports-Specific Features
- Live score integration display for active markets
- Team logos and colors (when applicable)
- Game/match countdown timers with urgency indicators
- Recent results feed showing resolved predictions

### Educational Content
**"How It Works" Page**:
- Hero section explaining the concept
- 4-6 step process breakdown with visual flow
- FAQ accordion section
- Risk disclaimer and responsible gaming information
- Smart contract explanation for transparency

### Platform Token Integration
- Dual display showing both BNB and platform token options
- Token utility explanation section
- Staking/rewards information (if applicable)
- Conversion calculator widget

---

## Accessibility & Polish

- Maintain 4.5:1 contrast ratios for all text
- Keyboard navigation for all interactive elements
- Screen reader friendly labels for data visualization
- Loading states for blockchain interactions
- Error states with clear messaging and recovery options
- Confirmation modals before bet placement

---

**Design Philosophy**: Create a high-octane, visually striking sports prediction platform that feels cutting-edge and trustworthy. Balance the excitement of sports with the professionalism required for handling real financial transactions on the blockchain. Every element should reinforce the futuristic DeFi sports betting experience while maintaining clarity and usability.