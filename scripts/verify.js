const { run } = require("hardhat");
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
