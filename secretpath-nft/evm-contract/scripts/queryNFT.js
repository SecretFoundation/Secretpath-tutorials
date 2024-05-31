const fs = require("fs");
const { ethers } = require("hardhat");
require("dotenv").config();

async function queryTokenURI(tokenId) {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractName = "SecretNFT"; 

  const ContractJson = require("../artifacts/contracts/SecretNFT.sol/SecretNFT.json");
  const abi = ContractJson.abi;

  // Setup provider and contract
  const provider = ethers.provider;
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`Token URI for token ${tokenId}:`, tokenURI);
    return tokenURI;
  } catch (error) {
    console.error(`Error fetching token URI for token ${tokenId}:`, error);
    return null;
  }
}

// Example usage:
const tokenId = 0; // Replace with the tokenId you want to query
queryTokenURI(tokenId).catch(console.error);
