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

  // Read contract source
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "../contracts/PredictionMarket.sol"),
    "utf8"
  );

  // Constructor arguments
  const constructorArgs = "000000000000000000000000c196dc762fbc2ab044aaeac05e27cd10c4982a010000000000000000000000000567f2323251f0aab15c8dfb1967e4e8a7d42aee";

  // Verification payload using BSCScan's direct API
  const params = {
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
    constructorArguements: constructorArgs,
    evmversion: "",  // Use compiler default
    licenseType: "3"
  };

  const postData = new URLSearchParams(params).toString();

  console.log("\nSubmitting to BSCScan (Legacy API)...");
  console.log("Contract:", contractAddress);
  console.log("Compiler: v0.8.20");
  console.log("Optimization: Yes (200 runs)");
  console.log();

  const options = {
    hostname: "api.bscscan.com",
    path: "/api",
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
        console.log("Response:", data);
        
        try {
          const response = JSON.parse(data);
          
          if (response.status === "1") {
            console.log("\n✅ Verification submitted!");
            console.log("GUID:", response.result);
            setTimeout(() => checkStatus(response.result, apiKey), 5000);
          } else if (response.result && response.result.includes("already verified")) {
            console.log("\n✅ Contract is already verified!");
            console.log("View on BSCScan: https://bscscan.com/address/" + contractAddress + "#code");
          } else {
            console.log("\n❌ Verification failed:");
            console.log(response.result);
            reject(new Error(response.result));
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

function checkStatus(guid, apiKey) {
  const options = {
    hostname: "api.bscscan.com",
    path: `/api?module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`,
    method: "GET",
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log("Status:", response.result);
        
        if (response.result === "Pending in queue") {
          console.log("Checking again in 5 seconds...");
          setTimeout(() => checkStatus(guid, apiKey), 5000);
        } else if (response.result === "Pass - Verified") {
          console.log("\n✅ Contract verified successfully!");
          console.log("View on BSCScan: https://bscscan.com/address/0x32da022636403bb1345610538e6b59739c800fe5#code");
        } else {
          console.log("\n⚠️ Status:", response.result);
        }
      } catch (error) {
        console.error("Parse error:", error);
      }
    });
  });

  req.on("error", console.error);
  req.end();
}

verifyContract().catch(console.error);
