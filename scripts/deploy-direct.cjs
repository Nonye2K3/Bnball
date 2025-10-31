const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("Starting PredictionMarket deployment to BSC...\n");

  // Read the compiled contract
  const artifactPath = path.join(__dirname, "../artifacts/contracts/PredictionMarket.sol/PredictionMarket.json");
  
  if (!fs.existsSync(artifactPath)) {
    console.error("Contract artifact not found. Please compile first with:");
    console.error("npx hardhat compile --config hardhat.config.cjs");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Determine network
  const network = process.argv[2] || "testnet";
  const isMainnet = network === "mainnet";
  
  const rpcUrl = isMainnet 
    ? process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed1.binance.org"
    : process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
    
  const chainId = isMainnet ? 56 : 97;
  const networkName = isMainnet ? "BSC Mainnet" : "BSC Testnet";
  
  console.log(`Deploying to: ${networkName} (Chain ID: ${chainId})`);
  console.log(`RPC URL: ${rpcUrl}\n`);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("ERROR: DEPLOYER_PRIVATE_KEY not found in environment variables");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from address:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB\n");
  
  const minBalance = ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.error(`ERROR: Insufficient balance. Need at least 0.01 BNB for deployment.`);
    console.error(`Current balance: ${ethers.formatEther(balance)} BNB`);
    process.exit(1);
  }

  // Constructor arguments
  const platformFeeRecipient = "0xC196dc762FbC2AB044AAEAc05E27CD10c4982a01"; // Escrow wallet
  const bnbUsdPriceFeed = isMainnet
    ? "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" // Chainlink BNB/USD Mainnet
    : "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // Chainlink BNB/USD Testnet
  
  console.log("Constructor Arguments:");
  console.log("- Platform Fee Recipient:", platformFeeRecipient);
  console.log("- BNB/USD Price Feed:", bnbUsdPriceFeed);
  console.log();
  
  // Deploy contract
  console.log("Deploying PredictionMarket contract...");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(platformFeeRecipient, bnbUsdPriceFeed);
  
  console.log("Deployment transaction sent:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation...\n");
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ PredictionMarket deployed successfully!\n");
  console.log("═".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Transaction Hash:", contract.deploymentTransaction().hash);
  console.log("═".repeat(60));
  
  // Read contract configuration
  const minBetAmount = await contract.minBetAmount();
  const createMarketStake = await contract.createMarketStake();
  const owner = await contract.owner();
  const registrationFeeUSD = await contract.registrationFeeUSD();
  const platformFeeRecipientRead = await contract.platformFeeRecipient();
  
  console.log("\nContract Configuration:");
  console.log("- Owner:", owner);
  console.log("- Platform Fee Recipient:", platformFeeRecipientRead);
  console.log("- Minimum Bet Amount:", ethers.formatEther(minBetAmount), "BNB");
  console.log("- Create Market Stake:", ethers.formatEther(createMarketStake), "BNB");
  console.log("- Registration Fee: $" + registrationFeeUSD.toString() + " USD");
  console.log("- Platform Fee: 10%");
  console.log("- Creator Fee: 2%");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to your Replit Secrets:");
  if (isMainnet) {
    console.log("   VITE_PREDICTION_MARKET_CONTRACT_MAINNET=" + contractAddress);
  } else {
    console.log("   VITE_PREDICTION_MARKET_CONTRACT_TESTNET=" + contractAddress);
  }
  console.log("\n3. View on BSCScan:");
  const explorerUrl = isMainnet 
    ? `https://bscscan.com/address/${contractAddress}`
    : `https://testnet.bscscan.com/address/${contractAddress}`;
  console.log("   " + explorerUrl);
  
  console.log("\n4. Verify the contract (optional):");
  console.log(`   npx hardhat verify --network ${isMainnet ? 'bscMainnet' : 'bscTestnet'} --config hardhat.config.cjs ${contractAddress}`);
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
