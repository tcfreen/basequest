const { expect } = require("chai");
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
