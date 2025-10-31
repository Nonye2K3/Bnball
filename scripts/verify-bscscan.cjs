const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

async function verifyContract() {
  const contractAddress = "0x32da022636403bb1345610538e6b59739c800fe5";
  const apiKey = process.env.BSCSCAN_API_KEY;
  
  if (!apiKey) {
    console.error("ERROR: BSCSCAN_API_KEY not found in environment variables");
    process.exit(1);
  }

  // Read the contract source code
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "../contracts/PredictionMarket.sol"),
    "utf8"
  );

  // Constructor arguments (ABI-encoded)
  const constructorArgs = "000000000000000000000000c196dc762fbc2ab044aaeac05e27cd10c4982a010000000000000000000000000567f2323251f0aab15c8dfb1967e4e8a7d42aee";

  // Build standard JSON input with viaIR enabled
  const standardJsonInput = JSON.stringify({
    language: "Solidity",
    sources: {
      "contracts/PredictionMarket.sol": {
        content: sourceCode
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
      evmVersion: "paris",
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "evm.methodIdentifiers"],
          "": ["ast"]
        }
      }
    }
  });

  // Build the verification payload for API V2 using standard JSON
  const postData = new URLSearchParams({
    chainid: "56", // BSC Mainnet
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: standardJsonInput,
    codeformat: "solidity-standard-json-input",
    contractname: "contracts/PredictionMarket.sol:PredictionMarket",
    compilerversion: "v0.8.20+commit.a1b79de6",
    constructorArguments: constructorArgs,
    licenseType: "3"
  }).toString();

  const options = {
    hostname: "api.etherscan.io", // V2 uses etherscan.io for all chains
    path: "/v2/api",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };

  console.log("Submitting contract verification to BSCScan...");
  console.log("Contract Address:", contractAddress);
  console.log("Compiler Version: v0.8.20+commit.a1b79de6");
  console.log("Optimization: Enabled (200 runs)");
  console.log("viaIR: Enabled");
  console.log();

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          
          if (response.status === "1") {
            console.log("✅ Verification submitted successfully!");
            console.log("GUID:", response.result);
            console.log("\nChecking verification status...\n");
            
            // Check status after a delay
            setTimeout(() => checkStatus(response.result, apiKey), 5000);
          } else {
            console.error("❌ Verification failed:");
            console.error("Message:", response.result);
            reject(new Error(response.result));
          }
        } catch (error) {
          console.error("Error parsing response:", error);
          console.error("Raw response:", data);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function checkStatus(guid, apiKey) {
  const options = {
    hostname: "api.etherscan.io",
    path: `/v2/api?chainid=56&module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`,
    method: "GET",
  };

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log("Status:", response.result);
        
        if (response.result === "Pending in queue") {
          console.log("Verification is pending... checking again in 5 seconds");
          setTimeout(() => checkStatus(guid, apiKey), 5000);
        } else if (response.result === "Pass - Verified") {
          console.log("\n✅ Contract verified successfully!");
          console.log("View on BSCScan: https://bscscan.com/address/0x32da022636403bb1345610538e6b59739c800fe5#code");
        } else {
          console.log("\n⚠️ Verification status:", response.result);
        }
      } catch (error) {
        console.error("Error parsing status response:", error);
        console.error("Raw response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("Status check error:", error);
  });

  req.end();
}

verifyContract().catch((error) => {
  console.error("\n❌ Verification process failed:");
  console.error(error.message);
  process.exit(1);
});
