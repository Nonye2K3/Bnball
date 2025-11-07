# BNBall Smart Contract Deployment Guide

This guide will help you deploy the PredictionMarket smart contract to Binance Smart Chain (BSC) Mainnet or Testnet.

## 🎉 Deployed Contracts

### BSC Testnet
- **Contract Address**: `0x6772872862AED3e7156ec3bAABD5CFB7aEd2b0c8`
- **Deployer**: `0xC6963c9f7D23212d22b08610773C555aCaD144D2`
- **Transaction**: `0x6fe1a5acb09dacb9d7293342de649a83719762368ddb086c949018d16075d72c`
- **Verified**: ✅ [View on BSCScan](https://testnet.bscscan.com/address/0x6772872862AED3e7156ec3bAABD5CFB7aEd2b0c8#code)
- **Deployed**: November 7, 2025

#### Contract Configuration
- Minimum Bet Amount: 0.01 BNB
- Create Market Stake: 0.1 BNB
- Platform Fee: 10% (PLATFORM_FEE_BP = 1000)
- Creator Fee: 2% (CREATOR_FEE_BP = 200)
- Registration Fee: $2 USD (converted to BNB via Chainlink oracle)
- BNB/USD Price Feed: `0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526`

### BSC Mainnet
- **Contract Address**: `0x0f0D0a8AD191899F91bF52806cE4530f36bba860`
- **Status**: Production deployment

---

## Prerequisites

Before deploying, ensure you have:

1. **BNB for Gas Fees**
   - **Testnet**: Get free testnet BNB from [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
   - **Mainnet**: You'll need real BNB (minimum ~0.1 BNB for deployment + testing)

2. **Wallet Private Key**
   - Export your private key from MetaMask: Account Details → Export Private Key
   - ⚠️ **SECURITY WARNING**: Never share or commit your private key!

3. **BSCScan API Key** (optional, for contract verification)
   - Get a free API key at [BSCScan](https://bscscan.com/myapikey)

## Deployment Steps

### Step 1: Configure Environment Variables

Add these secrets to your Replit Secrets (Tools → Secrets):

```bash
# Required: Your wallet's private key (with 0x prefix)
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Optional: BSCScan API key for contract verification
BSCSCAN_API_KEY=YOUR_BSCSCAN_API_KEY
```

### Step 2: Choose Network and Deploy

#### Deploy to BSC Testnet (Recommended First)

```bash
npx hardhat run scripts/deploy.ts --network bscTestnet
```

#### Deploy to BSC Mainnet

```bash
npx hardhat run scripts/deploy.ts --network bscMainnet
```

### Step 3: Save the Contract Address

After successful deployment, you'll see output like:

```
✅ PredictionMarket deployed successfully!
Contract address: 0x1234567890abcdef1234567890abcdef12345678
Transaction hash: 0xabcdef...
```

**Copy the contract address** - you'll need it next!

### Step 4: Add Contract Address to Replit Secrets

Add the deployed contract address to your Replit Secrets:

**For Testnet deployment:**
```
VITE_PREDICTION_MARKET_CONTRACT_TESTNET=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

**For Mainnet deployment:**
```
VITE_PREDICTION_MARKET_CONTRACT_MAINNET=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### Step 5: Verify Contract on BSCScan (Optional but Recommended)

Verify your contract to make the source code publicly visible:

**For Testnet:**
```bash
npx hardhat verify --network bscTestnet YOUR_CONTRACT_ADDRESS
```

**For Mainnet:**
```bash
npx hardhat verify --network bscMainnet YOUR_CONTRACT_ADDRESS
```

### Step 6: Test Your Deployment

1. Restart your application
2. Connect your wallet (make sure you're on BSC Mainnet or Testnet)
3. Try creating a market or placing a bet
4. Check transactions on [BSCScan](https://bscscan.com) (Mainnet) or [Testnet BSCScan](https://testnet.bscscan.com)

## Contract Configuration

The deployed contract has these initial settings:

- **Minimum Bet Amount**: 0.5 BNB
- **Create Market Stake**: 1.0 BNB (refunded when market resolves)
- **Market Creator Fee**: 0.5% of total pool
- **Platform Fee**: Handled by frontend (1% sent to escrow wallet)

## Troubleshooting

### Error: "Insufficient balance"
- Make sure your deployer wallet has at least 0.1 BNB for gas fees
- For testnet, get free BNB from the faucet

### Error: "Invalid address"
- Check that your private key starts with `0x`
- Verify the private key is correct (do NOT share it!)

### Error: "Cannot find module 'hardhat/config'"
- Run `npm install` to ensure all dependencies are installed

### Contract not working after deployment
- Verify you added the contract address to Replit Secrets
- Make sure the secret name matches exactly:
  - `VITE_PREDICTION_MARKET_CONTRACT_MAINNET` for mainnet
  - `VITE_PREDICTION_MARKET_CONTRACT_TESTNET` for testnet
- Restart the application after adding secrets

## Network Information

### BSC Mainnet
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed1.binance.org
- **Explorer**: https://bscscan.com
- **Symbol**: BNB

### BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart
- **Symbol**: tBNB

## Security Best Practices

1. ✅ **Always test on testnet first** before deploying to mainnet
2. ✅ **Never commit private keys** to git or share them publicly
3. ✅ **Use a dedicated deployment wallet** with minimal funds
4. ✅ **Verify contract on BSCScan** to ensure transparency
5. ✅ **Keep deployment wallet private key secure** - it controls the contract!

## Contract Functions

The deployed contract includes:

- `createMarket()` - Create new prediction market (requires 1 BNB stake)
- `placeBet()` - Place a bet on a market (minimum 0.5 BNB)
- `resolveMarket()` - Resolve market outcome (owner only)
- `claimWinnings()` - Claim winnings from won bets
- `getMarketDetails()` - Get market information
- `getUserBets()` - Get user's betting history

## Need Help?

If you encounter issues:

1. Check the deployment logs for error messages
2. Verify all environment variables are set correctly
3. Ensure you have enough BNB for gas fees
4. Try deploying to testnet first to test the process

## Next Steps After Deployment

1. ✅ Create a test market on testnet
2. ✅ Place test bets to verify functionality
3. ✅ Verify contract on BSCScan
4. ✅ Deploy to mainnet when ready
5. ✅ Announce your contract address to users
