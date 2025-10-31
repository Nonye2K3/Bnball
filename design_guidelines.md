# BNBall.app Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based with Gaming/DeFi Hybrid

Drawing inspiration from:
- **Stake.com/Rollbit** for bold gaming platform aesthetics
- **Uniswap V3** for clean DeFi interface patterns
- **Modern Esports Platforms** (FACEIT, HLTV) for high-energy sports design
- **Trading Dashboards** (TradingView) for data-dense displays

**Core Principle**: Create an electrifying, premium sports prediction platform with gaming-grade polish, futuristic DeFi credibility, and bold high-contrast visuals that command attention.

---

## Color System

### Primary Palette
- **Black (#000000)**: Primary backgrounds, cards, containers
- **Yellow/Gold (#FFD700 to #FFC107)**: Logo, primary CTAs, active states, key highlights
- **Green (#00FF41 to #10B981)**: Success indicators, winning outcomes, positive metrics, Binance branding
- **Orange (#FF6B35 to #F97316)**: Accents, live indicators, urgency elements, hover states

### Dark Mode (Primary)
- **Background**: Pure black (#000000) for main areas, #0A0A0A for raised surfaces
- **Card surfaces**: #111111 to #1A1A1A with subtle yellow/green glow effects on hover
- **Text**: White (#FFFFFF) for primary, #A0A0A0 for secondary, #666666 for tertiary
- **Borders**: #222222 default, yellow/green for active/hover states

### Light Mode (Secondary)
- **Background**: #FAFAFA to #F5F5F5
- **Card surfaces**: White (#FFFFFF) with subtle shadows
- **Text**: #0A0A0A primary, #666666 secondary
- **Accents**: Slightly desaturated yellow (#F4B000), green (#059669), orange (#EA580C)

---

## Typography System

### Font Families
- **Primary**: Inter (headings, UI, navigation) - clean, modern, technical
- **Monospace**: JetBrains Mono (odds, statistics, blockchain data, timers)

### Hierarchy
- **Hero Headlines**: 700 weight, text-6xl to text-8xl, tight line-height
- **Section Headers**: 700 weight, text-4xl to text-5xl
- **Card Titles**: 600 weight, text-xl to text-2xl
- **Odds/Numbers**: 700 weight, monospace, text-2xl to text-5xl with yellow/green highlights
- **Body**: 400-500 weight, text-base to text-lg
- **Labels**: 600 weight, text-xs uppercase, tracking-wide, yellow for categories

---

## Layout System

### Spacing Primitives
**Tailwind units**: 2, 4, 6, 8, 12, 16, 24
- Micro: 2, 4 (component internals)
- Standard: 6, 8 (card padding, gaps)
- Sections: 12, 16, 24 (vertical rhythm)

### Grid Structure
- **Container**: max-w-7xl, px-6 to px-8
- **Prediction Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Dashboard Stats**: grid-cols-2 md:grid-cols-4 gap-4

---

## Component Library

### 1. Hero Section
**Full-width dramatic hero with image background**:
- **Hero Image**: High-energy stadium night scene with floodlights, packed crowd, or dramatic sports action moment. Dark vignette overlay with yellow/green light accents bleeding through. Dimensions: 1920x1200, optimized for web
- Centered golden BNBall logo (soccer ball with green Binance symbol)
- Bold headline: "Decentralized Sports Prediction Market on BNB Chain"
- Dual CTA buttons with blurred glass backgrounds (yellow primary "Launch App", green secondary "Learn More")
- Live stats ticker below CTAs: animated horizontal scroll showing Total Volume (green), Active Markets (yellow), Total Bets (white), Prize Pool (orange) with monospace numbers
- Subtle animated particles/grid pattern overlay for futuristic feel

### 2. Market Category Navigation
Sticky filter bar below header:
- Horizontal pill buttons: All Sports, Football, Basketball, Tennis, Esports, MMA
- Active state: yellow background, black text
- Inactive: transparent with yellow border, white text
- Hover: orange glow effect
- Mobile: horizontal scroll with fade edges

### 3. Prediction Market Cards
**High-impact card design**:
- Black background (#111111) with subtle yellow glow on hover
- Top badge: Sport icon + category (yellow text, uppercase, small)
- Match/event title: Bold white, text-xl
- Dual prediction options layout:
  - Side-by-side panels (Team A vs Team B or YES/NO)
  - Each panel: Team logo/icon, current odds (huge monospace yellow numbers), percentage distribution bar (green/orange gradient), potential return calculation
- Visual separator: thin yellow line between options
- Metadata row: Countdown timer (orange), deadline (white), pool size (green glow effect), participant count
- Status badge: "LIVE" (pulsing orange), "UPCOMING" (yellow), "ENDED" (gray)
- Bottom CTA: Full-width yellow button "PLACE BET" or green "VIEW RESULTS"

### 4. Top Navigation
Sticky header with dark blur background:
- Logo left (golden soccer ball)
- Center links: Markets, Create, Leaderboard, Learn
- Right side: Wallet Connect button (yellow), theme toggle
- Active link: yellow underline
- Mobile: slide-in menu from right with yellow close icon

### 5. Stats Dashboard Section
**Grid of metric cards**:
- 2x2 grid on mobile, 1x4 on desktop
- Each card: Icon (yellow), label (gray), large monospace value (white), 24h change indicator (green up, orange down)
- Cards: Total TVL, Active Markets, Winners This Week, Platform Volume
- Subtle animated counting effect for values
- Black card backgrounds with colored top border (yellow/green/orange)

### 6. How It Works Section
**Numbered step cards**:
- 4-step horizontal timeline on desktop, vertical stack on mobile
- Each step: Large yellow circle number, icon (green), title (white), description (gray)
- Connecting lines between steps (yellow dotted)
- Visual flow from left to right with subtle scroll animation
- Final step has green glow "Start Now" CTA

### 7. Leaderboard Widget
**Top performers showcase**:
- Podium-style top 3 display with gold/silver/bronze treatments
- Rank list below showing: Avatar, username, win rate (green), total profit (yellow numbers)
- Trophy icon for top positions
- Subtle green glow for positive metrics
- "View Full Leaderboard" link (yellow)

### 8. Completed Markets Display
**Results feed**:
- Dimmed cards (50% opacity on black)
- Resolved outcome badge (green "RESOLVED" with checkmark)
- Winner/loser visual treatment: Green highlight for winning side, red-orange tint for losing
- Resolution method badge: "Oracle Verified", "AI Confirmed", or "Community Voted"
- Payout distribution chart (green bars)

### 9. Trust & Security Section
**Multi-element footer area**:
- Contract address display with copy button (yellow hover)
- Audit badges: CertiK, PeckShield (logos with green verified checkmarks)
- Smart contract stats: Verified badge, TVL, transaction count
- 3-column footer: About/Legal, Quick Links, Social/Community
- Newsletter signup: Yellow submit button, black input with yellow focus state
- Binance Chain logo with green verified badge

### 10. Educational Modal/Page
**"How Prediction Markets Work"**:
- Dark modal overlay with yellow close button
- Accordion sections: What Are Prediction Markets, How Escrow Works, Resolution Process, Fees & Rewards
- Each section: Icon, expandable content, green checkmarks for key points
- Inline warning cards (orange border) for risk disclaimers
- "Got It" yellow CTA at bottom

---

## Images

### Required Images:
1. **Hero Background**: Dramatic stadium night scene, 1920x1200, with yellow/green lighting effects, crowd energy
2. **Category Icons**: Sports equipment graphics for each sport type (use Font Awesome or custom minimal line icons in yellow)
3. **Trophy/Achievement Graphics**: For leaderboard section, golden trophy with green accents
4. **Trust Badges**: Binance Chain logo, audit company logos, security certification badges

---

## Animations & Interactions

**Gaming-Grade Polish**:
- Card hover: Lift + yellow glow (translateY(-4px) + box-shadow)
- Live indicators: Pulsing orange dot animation
- Odds updates: Flash yellow, smooth number transitions
- Countdown timers: Red-orange urgency pulse when <1hr
- Scroll reveals: Subtle fade-up (disable-on-reduce-motion)
- Button presses: Scale down (0.98) with haptic feel
- NO scroll-jacking, NO distracting parallax

---

## Special Design Elements

### Glassmorphism for Overlays
- Buttons on hero: backdrop-blur with semi-transparent black + yellow borders
- Modals: dark blur background with yellow/green edge glow

### Data Visualization
- Percentage bars: Horizontal fills with green/orange gradients
- Win/loss charts: Vertical bars with smooth animations
- Pool distribution: Donut charts with yellow/green segments

### Status Indicators
- Live pulse: Orange ring animation
- Verified checkmarks: Green with glow
- Warning states: Orange border + icon
- Success confirmations: Green flash animation

### Blockchain Integration UI
- Transaction pending: Yellow spinner
- Confirmed: Green checkmark with confetti micro-animation
- Failed: Orange alert with retry button
- Gas fee display: Small gray text with ETH icon

---

## Accessibility & Polish

- 7:1 contrast ratios for white text on black (WCAG AAA)
- Yellow/green color-blind safe combinations
- Keyboard navigation: Yellow focus rings
- Screen reader labels for all data
- Loading skeletons: Dark with yellow shimmer
- Error states: Orange borders + clear messaging
- Success states: Green glow + checkmark
- Disable animations respect prefers-reduced-motion

---

**Design Philosophy**: Create a premium, high-energy gaming platform that merges Vegas-style excitement with DeFi transparency. Every interaction should feel polished, responsive, and electric. The black-yellow-green color system creates unmistakable brand identity while maintaining readability and trust. This is where Web3 meets sports entertainment with uncompromising visual impact.