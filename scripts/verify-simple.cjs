const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

async function verifyContract() {
  const contractAddress = "0x32da022636403bb1345610538e6b59739c800fe5";
  const apiKey = process.env.BSCSCAN_API_KEY;
  
  if (!apiKey) {
    console.error("ERROR: BSCSCAN_API_KEY not found");
    process.exit(1);
  }

  console.log("API Key found:", apiKey.substring(0, 8) + "...");

  // Read contract source
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "../contracts/PredictionMarket.sol"),
    "utf8"
  );

  // Constructor arguments
  const constructorArgs = "000000000000000000000000c196dc762fbc2ab044aaeac05e27cd10c4982a010000000000000000000000000567f2323251f0aab15c8dfb1967e4e8a7d42aee";

  // Simple verification payload (without viaIR first)
  const params = {
    chainid: "56",
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: "solidity-single-file",
    contractname: "PredictionMarket",
    compilerversion: "v0.8.20+commit.a1b79de6",
    optimizationUsed: "1",
    runs: "200",
    constructorArguments: constructorArgs,
    licenseType: "3"
  };

  const postData = new URLSearchParams(params).toString();

  console.log("\nSubmitting to BSCScan API V2...");
  console.log("Chain ID: 56");
  console.log("Contract:", contractAddress);
  console.log("Compiler: v0.8.20");
  console.log("Optimization: Yes (200 runs)");
  console.log();

  const options = {
    hostname: "api.etherscan.io",
    path: "/v2/api",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        console.log("Response status:", res.statusCode);
        console.log("Raw response:", data);
        
        try {
          const response = JSON.parse(data);
          if (response.status === "1") {
            console.log("\n✅ Verification submitted!");
            console.log("GUID:", response.result);
            resolve(response.result);
          } else {
            console.log("\n❌ Verification failed:");
            console.log(response);
            reject(new Error(response.result || JSON.stringify(response)));
          }
        } catch (error) {
          console.error("Parse error:", error);
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

verifyContract().catch(console.error);
