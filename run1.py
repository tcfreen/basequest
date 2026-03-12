import os

files = {
".gitignore": """node_modules/
.env
.env.local
artifacts/
cache/
frontend/dist/
frontend/node_modules/
deployments.json
coverage/
.DS_Store
""",

".env.example": """BASESCAN_API_KEY=your_basescan_api_key_here
VITE_BASESCAN_API_KEY=your_basescan_api_key_here
CDP_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY
VITE_CDP_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key_here
VITE_CORE_CONTRACT=0x0000000000000000000000000000000000000000
VITE_GAME_CONTRACT=0x0000000000000000000000000000000000000000
VITE_BRIDGE_CONTRACT=0x0000000000000000000000000000000000000000
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_COINGECKO_API_KEY=
REPORT_GAS=false
""",

"package.json": """{
  "name": "basequest",
  "version": "1.0.0",
  "description": "BaseQuest — Farm Base. Earn XP. Dominate the Chain.",
  "private": true,
  "scripts": {
    "compile": "npx hardhat compile",
    "test":    "npx hardhat test",
    "deploy":  "npx hardhat run scripts/deploy.js --network base",
    "verify":  "npx hardhat run scripts/verify.js --network base",
    "frontend":"cd frontend && npm run dev",
    "build":   "cd frontend && npm run build"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "dotenv":  "^16.4.5",
    "hardhat": "^2.22.2"
  }
}
""",

"hardhat.config.js": """require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const cdpRpcUrl   = process.env.CDP_RPC_URL || "https://mainnet.base.org";
const privateKey  = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const basescanKey = process.env.BASESCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: { chainId: 31337 },
    base: { url: cdpRpcUrl, accounts: [privateKey], chainId: 8453 },
    "base-sepolia": { url: "https://sepolia.base.org", accounts: [privateKey], chainId: 84532 },
  },
  etherscan: {
    apiKey: { base: basescanKey, "base-sepolia": basescanKey },
    customChains: [
      { network: "base", chainId: 8453,
        urls: { apiURL: "https://api.basescan.org/api", browserURL: "https://basescan.org" } },
      { network: "base-sepolia", chainId: 84532,
        urls: { apiURL: "https://api-sepolia.basescan.org/api", browserURL: "https://sepolia.basescan.org" } },
    ],
  },
};
""",
}

for path, content in files.items():
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 1 done!")
