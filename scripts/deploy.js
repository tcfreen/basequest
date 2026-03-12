const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Core   = await ethers.getContractFactory("BaseQuestCore");
  const core   = await Core.deploy();
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log("BaseQuestCore:", coreAddress);

  const Game   = await ethers.getContractFactory("BaseQuestGame");
  const game   = await Game.deploy();
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("BaseQuestGame:", gameAddress);

  const Bridge = await ethers.getContractFactory("BaseQuestBridge");
  const bridge = await Bridge.deploy();
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log("BaseQuestBridge:", bridgeAddress);

  const artifact = {
    network: "base-mainnet", chainId: 8453,
    deployer: deployer.address, timestamp: new Date().toISOString(),
    contracts: { BaseQuestCore: coreAddress, BaseQuestGame: gameAddress, BaseQuestBridge: bridgeAddress },
  };
  fs.writeFileSync(path.join(__dirname, "..", "deployments.json"), JSON.stringify(artifact, null, 2));

  console.log("\nAdd to .env:");
  console.log("VITE_CORE_CONTRACT=" + coreAddress);
  console.log("VITE_GAME_CONTRACT=" + gameAddress);
  console.log("VITE_BRIDGE_CONTRACT=" + bridgeAddress);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
