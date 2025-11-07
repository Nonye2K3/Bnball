const hre = require("hardhat");

async function main() {
  console.log("Starting PredictionMarket deployment to BSC...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");

  const minBalance = hre.ethers.parseEther("0.01");
  if (balance < minBalance) {
    throw new Error(
      `Insufficient balance. Need at least 0.01 BNB for deployment. Current balance: ${hre.ethers.formatEther(balance)} BNB`
    );
  }

  // Chainlink BNB/USD Price Feed addresses
  const priceFeedAddresses = {
    bscTestnet: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    bscMainnet: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
  };
  
  const networkName = hre.network.name;
  const priceFeedAddress = priceFeedAddresses[networkName];
  
  if (!priceFeedAddress) {
    throw new Error(`No price feed address configured for network: ${networkName}`);
  }
  
  console.log("\nDeploying PredictionMarket contract...");
  console.log("Platform Fee Recipient:", deployer.address);
  console.log("BNB/USD Price Feed:", priceFeedAddress);
  
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(deployer.address, priceFeedAddress);

  await predictionMarket.waitForDeployment();
  const contractAddress = await predictionMarket.getAddress();

  console.log("\n✅ PredictionMarket deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", predictionMarket.deploymentTransaction()?.hash);
  
  const minBetAmount = await predictionMarket.minBetAmount();
  const createMarketStake = await predictionMarket.createMarketStake();
  const platformFeeRecipient = await predictionMarket.platformFeeRecipient();
  
  console.log("\nContract Configuration:");
  console.log("- Minimum Bet Amount:", hre.ethers.formatEther(minBetAmount), "BNB");
  console.log("- Create Market Stake:", hre.ethers.formatEther(createMarketStake), "BNB");
  console.log("- Owner:", await predictionMarket.owner());
  console.log("- Platform Fee Recipient:", platformFeeRecipient);
  console.log("- BNB/USD Price Feed:", await predictionMarket.bnbUsdPriceFeed());

  console.log("\n📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to your Replit Secrets:");
  console.log("   - For BSC Mainnet: VITE_PREDICTION_MARKET_CONTRACT_MAINNET");
  console.log("   - For BSC Testnet: VITE_PREDICTION_MARKET_CONTRACT_TESTNET");
  console.log("3. Verify the contract on BSCScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} --config hardhat.config.cjs ${contractAddress} "${deployer.address}" "${priceFeedAddress}"`);
  console.log("\n4. Update your frontend to use the deployed contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
