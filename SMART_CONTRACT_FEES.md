# Smart Contract Fee Structure - PRODUCTION DEPLOYMENT

## Current State (Production - BSC Mainnet)

**Contract Address**: `0xf914Fc75248DBB9DaA68b8Ecbc5F8D519b7A1182`  
**Chain**: Binance Smart Chain Mainnet (Chain ID: 56)  
**Deployment Date**: October 29, 2025  
**Status**: ✅ **DEPLOYED AND ACTIVE**  
**Transaction Hash**: `0x01e5c6fc11ebb013cf468c49a6a73d34584b8d4e12efb598db288b5e3c0cea1f`  
**BSCScan**: https://bscscan.com/address/0xf914Fc75248DBB9DaA68b8Ecbc5F8D519b7A1182

---

## Fee Structure Overview

**Total Fees**: 12% (all collected on-chain, hidden from users)
- **Platform Fee**: 10% → Sent immediately to platform fee recipient
- **Creator Fee**: 2% → Accrued during betting, paid to market creator on resolution
- **Pool Allocation**: 88% → Goes to betting pools for winners

### Fee Breakdown by Phase

| Phase | Fee | Amount | Recipient | When Collected |
|-------|-----|--------|-----------|----------------|
| **Bet Placement** | Platform Fee | 10% of bet | Platform wallet (0xC196...a01) | Immediately on `placeBet()` |
| **Bet Placement** | Creator Fee | 2% of bet | Accrued in contract | Immediately on `placeBet()` |
| **Bet Placement** | Pool Amount | 88% of bet | Betting pools (YES/NO) | Immediately on `placeBet()` |
| **Market Resolution** | Creator Payout | Stake + accrued 2% fees | Market creator | On `resolveMarket()` |
| **Claim Winnings** | Winner Share | Proportional share of 88% pool | Winning bettors | On `claimWinnings()` |

---

## Contract Configuration

### Core Parameters

```solidity
// Fee rates (in basis points, 10000 = 100%)
PLATFORM_FEE_BP = 1000    // 10%
CREATOR_FEE_BP = 200      // 2%
BASIS_POINTS = 10000

// Betting limits
minBetAmount = 0.01 ether              // Minimum bet: 0.01 BNB
createMarketStake = 0.1 ether          // Market creation stake: 0.1 BNB

// Registration
registrationFeeUSD = 2                  // $2 USD equivalent in BNB
```

### Immutable Addresses

```solidity
platformFeeRecipient = 0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01  // Escrow wallet
bnbUsdPriceFeed = 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE      // Chainlink BNB/USD Oracle
```

---

## Smart Contract Functions

### 1. User Registration

**Function**: `registerUser()`  
**Cost**: $2 USD equivalent in BNB (calculated via Chainlink oracle)  
**Purpose**: One-time registration required before creating markets or placing bets

```solidity
function registerUser() external payable {
    require(!registeredUsers[msg.sender], "Already registered");
    uint256 requiredBNB = getRegistrationFeeInBNB();
    require(msg.value >= requiredBNB, "Insufficient registration fee");
    
    // Send $2 USD worth of BNB to platform
    platformFeeRecipient.call{value: msg.value}("");
    registeredUsers[msg.sender] = true;
}
```

**Frontend Hooks**:
- `useIsRegistered()` - Check registration status
- `useRegistrationFee()` - Get current fee in BNB
- `useRegisterUser()` - Execute registration

---

### 2. Market Creation

**Function**: `createMarket(title, description, category, deadline)`  
**Stake Required**: 0.1 BNB (refunded on resolution)  
**Requirements**: User must be registered

```solidity
function createMarket(...) external payable requiresRegistration {
    require(msg.value == createMarketStake, "Must send exactly 0.1 BNB");
    // Store creator stake for later refund
    markets[marketId].creatorStake = msg.value;
}
```

**Creator Benefits**:
- Stake refunded on resolution: 0.1 BNB
- Earn 2% fee on all trading volume
- Build reputation as trusted market creator

---

### 3. Placing Bets

**Function**: `placeBet(marketId, prediction)`  
**Minimum Bet**: 0.01 BNB  
**Fee Deduction**: Automatic (12% total, hidden from users)

**On-Chain Fee Calculation**:
```solidity
function placeBet(uint256 marketId, bool prediction) external payable {
    // Calculate fees (12% total deducted automatically)
    uint256 platformFee = (msg.value * 1000) / 10000;  // 10%
    uint256 creatorFee = (msg.value * 200) / 10000;     // 2%
    uint256 betAmount = msg.value - platformFee - creatorFee;  // 88%
    
    // Send platform fee immediately
    platformFeeRecipient.call{value: platformFee}("");
    
    // Accrue creator fee (paid on resolution)
    market.creatorFeeAccrued += creatorFee;
    
    // Add bet to pools (88% of original amount)
    if (prediction) {
        market.yesPool += betAmount;
    } else {
        market.noPool += betAmount;
    }
}
```

**Example Bet**:
- User bets: 1.0 BNB
- Platform fee (10%): 0.1 BNB → Sent to 0xC196...a01
- Creator fee (2%): 0.02 BNB → Accrued in contract
- Pool amount (88%): 0.88 BNB → Added to YES/NO pool
- **User sees**: "Place 1.0 BNB bet" (fees hidden)

---

### 4. Market Resolution

**Function**: `resolveMarket(marketId, outcome)`  
**Access**: Owner only  
**Creator Payout**: Stake refund + accrued 2% fees

```solidity
function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
    market.resolved = true;
    market.outcome = outcome;
    
    // Pay creator: stake refund + all accrued 2% fees
    uint256 totalPayout = market.creatorStake + market.creatorFeeAccrued;
    market.creator.call{value: totalPayout}("");
}
```

**Example Creator Payout**:
- Market stake: 0.1 BNB (refunded)
- Total bets placed: 100 BNB
- Creator fee accrued: 100 × 0.02 = 2 BNB
- **Total creator receives**: 0.1 + 2 = 2.1 BNB

---

### 5. Claiming Winnings

**Function**: `claimWinnings(marketId)`  
**Payout Pool**: 88% of total bets (after fees)

```solidity
function claimWinnings(uint256 marketId) external {
    // Calculate user's share of 88% pool
    uint256 platformFee = (userBet.amount * 1000) / 10000;
    uint256 creatorFee = (userBet.amount * 200) / 10000;
    uint256 userBetInPool = userBet.amount - platformFee - creatorFee;
    
    // Winners split entire pool proportionally
    uint256 winnings = (userBetInPool * market.totalPool) / winningPool;
    
    msg.sender.call{value: winnings}("");
}
```

**Example Winning Calculation**:
```
Market Pool:
- Total bets: 100 BNB
- Platform fees collected: 10 BNB (already sent to platform)
- Creator fees accrued: 2 BNB (already paid to creator)
- Pool available: 88 BNB
- YES pool: 44 BNB
- NO pool: 44 BNB
- Outcome: YES wins

User's Bet:
- Original bet: 10 BNB
- User's pool contribution: 8.8 BNB (after 12% fees)
- User's share: (8.8 / 44) × 88 = 17.6 BNB
- Profit: 17.6 - 10 = 7.6 BNB (76% return)
```

---

## Chainlink Oracle Integration

### BNB/USD Price Feed

**Contract**: Chainlink AggregatorV3Interface  
**Mainnet Address**: `0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE`  
**Price Format**: 8 decimals (e.g., 24650000000 = $246.50)  
**Staleness Check**: 1 hour maximum

```solidity
function getBNBUSDPrice() public view returns (uint256) {
    (, int256 price, , uint256 updatedAt, ) = bnbUsdPriceFeed.latestRoundData();
    require(price > 0, "Invalid price");
    require(block.timestamp - updatedAt <= 1 hours, "Price stale");
    return uint256(price);
}

function getRegistrationFeeInBNB() public view returns (uint256) {
    uint256 bnbUsdPrice = getBNBUSDPrice(); // 8 decimals
    // registrationFeeUSD = 2, price = 24650000000 (≈$246.50)
    // fee = (2 * 1e26) / 24650000000 = 0.0081 BNB ≈ $2 USD
    return (registrationFeeUSD * 1e26) / bnbUsdPrice;
}
```

**Dynamic Pricing**:
- If BNB = $250: Registration fee ≈ 0.008 BNB
- If BNB = $500: Registration fee ≈ 0.004 BNB
- If BNB = $125: Registration fee ≈ 0.016 BNB

---

## Frontend Implementation

### Single Transaction Flow

The frontend now uses a **single transaction** per bet (fees handled automatically on-chain):

```typescript
// Old (removed): Two-step transaction
// 1. Send 8% to escrow wallet
// 2. Send 92% to contract

// New (current): Single transaction
writeContract({
  address: getContractAddress(chainId),
  abi: PREDICTION_MARKET_ABI,
  functionName: 'placeBet',
  args: [marketId, prediction],
  value: betAmount,  // Full bet amount (1.0 BNB)
  gas: GAS_LIMITS.PLACE_BET,
})
// Contract automatically:
// - Sends 10% (0.1 BNB) to platform
// - Accrues 2% (0.02 BNB) for creator
// - Adds 88% (0.88 BNB) to pools
```

### Configuration (client/src/lib/contractConfig.ts)

```typescript
export const FEE_CONFIG = {
  PLATFORM_FEE_PERCENT: 10,
  CREATOR_FEE_PERCENT: 2,
  TOTAL_FEE_PERCENT: 12,
  BET_POOL_PERCENT: 88,
  REGISTRATION_FEE_USD: 2,
}

export const BET_CONFIG = {
  MIN_BET_AMOUNT: parseEther('0.01'),
  MIN_BET_AMOUNT_DISPLAY: '0.01',
  CREATE_MARKET_STAKE: parseEther('0.1'),
  CREATE_MARKET_STAKE_DISPLAY: '0.1',
}
```

### Registration Flow

```typescript
// Check if user is registered
const { isRegistered } = useIsRegistered();

// Get current registration fee
const { feeInBNB } = useRegistrationFee(); // e.g., "0.008"

// Register user
const { registerUser, isLoading } = useRegisterUser();
await registerUser();
```

---

## Security Features

### Access Controls

1. **Only Owner**: Can resolve markets (`onlyOwner` modifier)
2. **Only Registered**: Can create markets or place bets (`requiresRegistration` modifier)
3. **Immutable Addresses**: Platform fee recipient and oracle address set at deployment

### Reentrancy Protection

All external calls use the Checks-Effects-Interactions pattern:
```solidity
// 1. Check conditions
require(market.resolved, "Not resolved");

// 2. Update state
userBet.claimed = true;

// 3. External interaction (last)
msg.sender.call{value: winnings}("");
```

### Oracle Security

- Price staleness check (1 hour maximum)
- Positive price requirement
- Failed oracle calls revert registration

---

## Gas Costs (Estimated)

| Operation | Gas Limit | Cost @ 3 Gwei | Notes |
|-----------|-----------|---------------|-------|
| Register User | 200,000 | ~$0.15 | One-time + $2 USD fee |
| Create Market | 300,000 | ~$0.23 | + 0.1 BNB stake |
| Place Bet | 200,000 | ~$0.15 | Includes fee transfers |
| Resolve Market | 200,000 | ~$0.15 | Owner only |
| Claim Winnings | 150,000 | ~$0.11 | Per winner |

---

## Comparison: Old vs New Contract

| Feature | Old Contract | New Contract |
|---------|--------------|--------------|
| **Market Stake** | 1.0 BNB | 0.1 BNB ✅ |
| **Platform Fee** | 0% (off-chain 8%) | 10% on-chain ✅ |
| **Creator Fee** | 0.5% | 2% ✅ |
| **Total Fees** | ~8.5% | 12% ✅ |
| **Fee Collection** | Two transactions | Single transaction ✅ |
| **Registration** | None | $2 USD required ✅ |
| **Oracle** | None | Chainlink BNB/USD ✅ |
| **Pool Share** | 99.5% | 88% ✅ |

---

## Testing Checklist

### Pre-Production Testing

- [x] Contract compiles with viaIR enabled
- [x] Deploy to BSC Mainnet
- [x] Verify constructor arguments
- [x] Test user registration with Chainlink oracle
- [x] Test market creation with 0.1 BNB
- [x] Test bet placement with fee deduction
- [x] Test market resolution with creator payout
- [x] Test winner claims from 88% pool
- [ ] End-to-end test on mainnet
- [ ] Monitor platform fee recipient balance
- [ ] Verify BSCScan contract verification

### User Acceptance Testing

1. **Registration Flow**:
   - Connect wallet → Check if registered → Pay $2 USD → Verify registration

2. **Market Creation**:
   - Send 0.1 BNB → Create market → Verify market appears → Verify stake locked

3. **Betting Flow**:
   - Place 1.0 BNB bet → Single transaction → Verify bet recorded → Check pool update

4. **Resolution & Claims**:
   - Resolve market → Creator receives 0.1 BNB + 2% fees → Winners claim from 88% pool

---

## Deployment Info

### Environment Variables

```bash
# Required for deployment
DEPLOYER_PRIVATE_KEY=0x...
BSC_MAINNET_RPC_URL=https://bsc-dataseed1.binance.org
BSCSCAN_API_KEY=...

# Frontend environment
VITE_PREDICTION_MARKET_CONTRACT_MAINNET=0xf914Fc75248DBB9DaA68b8Ecbc5F8D519b7A1182
VITE_PREDICTION_MARKET_CONTRACT_TESTNET=0x...
VITE_WALLETCONNECT_PROJECT_ID=...
```

### Deployment Command

```bash
# Compile contract
node compile-simple.mjs

# Deploy to mainnet
node scripts/deploy-direct.cjs mainnet

# Verify on BSCScan (optional)
npx hardhat verify --network bscMainnet --config hardhat.config.cjs \
  0xf914Fc75248DBB9DaA68b8Ecbc5F8D519b7A1182 \
  "0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01" \
  "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
```

---

## Related Files

### Smart Contract
- `contracts/PredictionMarket.sol` - Main contract
- `compile-simple.mjs` - Compilation script with viaIR
- `scripts/deploy-direct.cjs` - Deployment script

### Frontend
- `client/src/lib/contractConfig.ts` - Configuration
- `client/src/hooks/usePredictionMarket.ts` - Contract interaction hooks
- `client/src/pages/CreateMarket.tsx` - Market creation UI
- `client/src/components/PlaceBetModal.tsx` - Betting interface
- `client/src/components/MarketDetailsModal.tsx` - Market details

### Utilities
- `client/src/utils/blockchain.ts` - Helper functions
- `shared/contracts/PredictionMarket.json` - Contract ABI

---

**Last Updated**: October 29, 2025  
**Contract Version**: 2.0  
**Status**: ✅ PRODUCTION READY  
**Maintainer**: BNBall Team
