import os

files = {
"contracts/BaseQuestBridge.sol": """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseQuestBridge {
    address public contractOwner;

    struct BridgeRecord {
        address user;
        uint256 timestamp;
        string  bridgeProtocol;
        string  note;
    }

    BridgeRecord[] public records;
    mapping(address => uint256[]) public userRecordIndexes;
    mapping(address => uint256)   public userBridgeCount;

    event BridgeRecorded(address indexed user, string bridgeProtocol, uint256 timestamp, uint256 userBridgeCount);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "BaseQuestBridge: not owner");
        _;
    }

    constructor() { contractOwner = msg.sender; }

    function recordBridge(string calldata bridgeProtocol, string calldata note) external {
        require(bytes(bridgeProtocol).length > 0,   "BaseQuestBridge: empty protocol");
        require(bytes(bridgeProtocol).length <= 64, "BaseQuestBridge: protocol name too long");
        require(bytes(note).length <= 128,          "BaseQuestBridge: note too long");
        uint256 idx = records.length;
        records.push(BridgeRecord({ user: msg.sender, timestamp: block.timestamp, bridgeProtocol: bridgeProtocol, note: note }));
        userRecordIndexes[msg.sender].push(idx);
        userBridgeCount[msg.sender] += 1;
        emit BridgeRecorded(msg.sender, bridgeProtocol, block.timestamp, userBridgeCount[msg.sender]);
    }

    function getUserRecordIndexes(address user) external view returns (uint256[] memory) { return userRecordIndexes[user]; }
    function getTotalRecords() external view returns (uint256) { return records.length; }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseQuestBridge: zero address");
        contractOwner = newOwner;
    }
}
""",

"scripts/deploy.js": """const { ethers } = require("hardhat");
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

  console.log("\\nAdd to .env:");
  console.log("VITE_CORE_CONTRACT=" + coreAddress);
  console.log("VITE_GAME_CONTRACT=" + gameAddress);
  console.log("VITE_BRIDGE_CONTRACT=" + bridgeAddress);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
""",

"scripts/verify.js": """const { run } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function verify(name, address) {
  console.log("Verifying", name, "at", address);
  try {
    await run("verify:verify", { address, constructorArguments: [] });
    console.log(name, "verified!");
  } catch (err) {
    if (err.message.includes("Already Verified")) console.log(name, "already verified");
    else console.error(name, "failed:", err.message);
  }
}

async function main() {
  const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "deployments.json"), "utf-8"));
  await verify("BaseQuestCore",   artifact.contracts.BaseQuestCore);
  await verify("BaseQuestGame",   artifact.contracts.BaseQuestGame);
  await verify("BaseQuestBridge", artifact.contracts.BaseQuestBridge);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
""",

"test/BaseQuest.test.js": """const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { time }    = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("BaseQuestCore", function () {
  let core, owner, user1, user2, user3;
  const GM_FEE       = ethers.parseEther("0.0001");
  const DEPLOY_FEE   = ethers.parseEther("0.0002");
  const SWAP_FEE     = ethers.parseEther("0.0001");
  const BRIDGE_FEE   = ethers.parseEther("0.0002");
  const REFERRAL_FEE = ethers.parseEther("0.0001");
  const PROFILE_FEE  = ethers.parseEther("0.0001");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BaseQuestCore");
    core = await Factory.deploy();
    await core.waitForDeployment();
  });

  it("sets deployer as owner", async function () {
    expect(await core.contractOwner()).to.equal(owner.address);
  });

  it("GM task awards 50 XP", async function () {
    await core.connect(user1).completeGMTask({ value: GM_FEE });
    expect(await core.getUserXP(user1.address)).to.equal(50);
  });

  it("rejects duplicate GM same day", async function () {
    await core.connect(user1).completeGMTask({ value: GM_FEE });
    await expect(core.connect(user1).completeGMTask({ value: GM_FEE }))
      .to.be.revertedWith("BaseQuestCore: GM task already done today");
  });

  it("allows GM again after 24h", async function () {
    await core.connect(user1).completeGMTask({ value: GM_FEE });
    await time.increase(86401);
    await core.connect(user1).completeGMTask({ value: GM_FEE });
    expect(await core.getUserXP(user1.address)).to.equal(100);
  });

  it("referral awards 150 XP", async function () {
    await core.connect(user1).completeReferralTask(user2.address, { value: REFERRAL_FEE });
    expect(await core.getUserXP(user1.address)).to.equal(150);
  });

  it("rejects self-referral", async function () {
    await expect(core.connect(user1).completeReferralTask(user1.address, { value: REFERRAL_FEE }))
      .to.be.revertedWith("BaseQuestCore: cannot refer yourself");
  });
});
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 2 done!")
