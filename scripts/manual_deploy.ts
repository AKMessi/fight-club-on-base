const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // 1. Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
  );

  // 2. Create wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Deploying from:", wallet.address);

  // 3. Compile contract bytecode (you need to compile first)
  const FightClub = JSON.parse(
    fs.readFileSync("./artifacts/contracts/FightClub.sol/FightClub.json", "utf8")
  );

  // 4. Deploy
  const factory = new ethers.ContractFactory(
    FightClub.abi,
    FightClub.bytecode,
    wallet
  );

  console.log("Deploying contract...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("FightClub deployed to:", await contract.getAddress());
}

main().catch(console.error);