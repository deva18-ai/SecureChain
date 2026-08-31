import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Deploying SecureChain contract...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    const SecureChain = await ethers.getContractFactory("SecureChain");
    const secureChain = await SecureChain.deploy();

    await secureChain.waitForDeployment();
    const contractAddress = await secureChain.getAddress();

    console.log("\n✅ SecureChain deployed to:", contractAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);

    const deploymentInfo = {
        contractAddress,
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: (await ethers.provider.getBlockNumber()),
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, `deployment-${deploymentInfo.chainId}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentPath);

    console.log("\n📋 Next steps:");
    console.log("1. Copy the contract address to your backend .env file:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    console.log("2. Copy the contract address to your frontend .env file:");
    console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("3. Update RPC URL in both .env files if needed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });