import { ethers } from "hardhat";

async function main() {
  console.log("Deploying FightClub contract...");

  // 1. Get the contract factory
  const FightClub = await ethers.getContractFactory("FightClub");

  // 2. Deploy the contract
  const fightClub = await FightClub.deploy();

  // 3. Wait for it to finish
  await fightClub.waitForDeployment();

  // 4. Print the address
  console.log(`FightClub deployed to: ${await fightClub.getAddress()}`);
}

// Standard error handling pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});