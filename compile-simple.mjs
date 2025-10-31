import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple compilation using hardhat's built-in compiler without plugins
const hardhatConfig = `
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};
`;

// Write a minimal hardhat config
fs.writeFileSync('hardhat.minimal.config.cjs', hardhatConfig);

console.log('Compiling PredictionMarket.sol with Hardhat...\n');

const compileProcess = spawn('npx', ['hardhat', 'compile', '--config', 'hardhat.minimal.config.cjs', '--force'], {
  stdio: 'inherit'
});

compileProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Compilation failed with code ${code}`);
    process.exit(1);
  }

  console.log('\n✅ Compilation successful!');

  // Copy ABI to shared folder
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'PredictionMarket.sol', 'PredictionMarket.json');
  const sharedDir = path.join(__dirname, 'shared', 'contracts');
  
  if (!fs.existsSync(artifactPath)) {
    console.error('❌ Artifact not found at:', artifactPath);
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Create shared directory if it doesn't exist
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  const sharedPath = path.join(sharedDir, 'PredictionMarket.json');
  fs.writeFileSync(sharedPath, JSON.stringify(artifact, null, 2));

  console.log(`\n📁 ABI Files:`);
  console.log(`   ✓ ${artifactPath}`);
  console.log(`   ✓ ${sharedPath}`);
  console.log(`\n🎉 Contract compiled and ABI saved successfully!`);
});
