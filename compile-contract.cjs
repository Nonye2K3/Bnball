const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Read the contract source code
const contractPath = path.join(__dirname, 'contracts', 'PredictionMarket.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare the input for the compiler
const input = {
  language: 'Solidity',
  sources: {
    'PredictionMarket.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    }
  }
};

// Compile the contract
console.log('Compiling PredictionMarket.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  output.errors.forEach(error => {
    console.error(error.formattedMessage);
  });
  if (output.errors.some(e => e.severity === 'error')) {
    console.error('\nCompilation failed!');
    process.exit(1);
  }
}

// Get the compiled contract
const contract = output.contracts['PredictionMarket.sol']['PredictionMarket'];

if (!contract) {
  console.error('Contract not found in compilation output');
  process.exit(1);
}

// Create artifacts directory
const artifactsDir = path.join(__dirname, 'artifacts', 'contracts', 'PredictionMarket.sol');
fs.mkdirSync(artifactsDir, { recursive: true });

// Save the ABI and bytecode
const artifact = {
  _format: 'hh-sol-artifact-1',
  contractName: 'PredictionMarket',
  sourceName: 'contracts/PredictionMarket.sol',
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  deployedBytecode: '0x' + contract.evm.bytecode.object,
  linkReferences: {},
  deployedLinkReferences: {}
};

const artifactPath = path.join(artifactsDir, 'PredictionMarket.json');
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

// Also save to shared contracts folder
const sharedDir = path.join(__dirname, 'shared', 'contracts');
fs.mkdirSync(sharedDir, { recursive: true });
const sharedPath = path.join(sharedDir, 'PredictionMarket.json');
fs.writeFileSync(sharedPath, JSON.stringify(artifact, null, 2));

console.log('\n✅ Compilation successful!');
console.log(`   ABI saved to: ${artifactPath}`);
console.log(`   ABI saved to: ${sharedPath}`);
console.log(`   Bytecode size: ${contract.evm.bytecode.object.length / 2} bytes`);
