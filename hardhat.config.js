require("@nomicfoundation/hardhat-toolbox");
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
