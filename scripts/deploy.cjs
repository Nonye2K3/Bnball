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

  console.log("\nDeploying PredictionMarket contract...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy();

  await predictionMarket.waitForDeployment();
  const contractAddress = await predictionMarket.getAddress();

  console.log("\n✅ PredictionMarket deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", predictionMarket.deploymentTransaction()?.hash);
  
  const minBetAmount = await predictionMarket.minBetAmount();
  const createMarketStake = await predictionMarket.createMarketStake();
  
  console.log("\nContract Configuration:");
  console.log("- Minimum Bet Amount:", hre.ethers.formatEther(minBetAmount), "BNB");
  console.log("- Create Market Stake:", hre.ethers.formatEther(createMarketStake), "BNB");
  console.log("- Owner:", await predictionMarket.owner());

  console.log("\n📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to your Replit Secrets:");
  console.log("   - For BSC Mainnet: VITE_PREDICTION_MARKET_CONTRACT_MAINNET");
  console.log("   - For BSC Testnet: VITE_PREDICTION_MARKET_CONTRACT_TESTNET");
  console.log("3. Verify the contract on BSCScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} --config hardhat.config.cjs ${contractAddress}`);
  console.log("\n4. Update your frontend to use the deployed contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
