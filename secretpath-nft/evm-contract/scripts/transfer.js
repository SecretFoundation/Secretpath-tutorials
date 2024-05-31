const { ethers } = require("hardhat");
require("dotenv").config();

const nftAddress = process.env.CONTRACT_ADDRESS;

async function transferNFT(tokenId, fromAddress, toAddress) {
    const SecretNFT = await hre.ethers.getContractFactory("SecretNFT");
    const secretNFT = await SecretNFT.attach(nftAddress);

    console.log(`Transferring token ${tokenId} from ${fromAddress} to ${toAddress}...`);

    const tx = await secretNFT["safeTransferFrom(address,address,uint256)"](
        fromAddress,
        toAddress,
        tokenId
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();

    console.log(`Token ${tokenId} transferred successfully from ${fromAddress} to ${toAddress}!`);
}

// Example usage:
const tokenId = 1; // Set the token ID you want to transfer
const fromAddress = "0x49e01eb08bBF0696Ed0df8cD894906f7Da635929"; // Sender's address
const toAddress = "0x4B808ec5A5d53871e0b7bf53bC2A4Ee89dd1ddB1"; // Receiver's address

transferNFT(tokenId, fromAddress, toAddress);
