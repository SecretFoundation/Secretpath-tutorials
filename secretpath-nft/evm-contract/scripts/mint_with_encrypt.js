const { ethers } = require("hardhat");
const { encrypt_tx } = require("./encrypt");
require("dotenv").config();

const nftAddress = process.env.CONTRACT_ADDRESS;

async function mint_with_encrypt() {
  const SecretNFT = await hre.ethers.getContractFactory("SecretNFT");
  const secretNFT = await SecretNFT.attach(nftAddress);

  const uri =
    "1oMSt6FtEqb6tsbbymvXYjxbqbDijtBA9";

  const tx = await secretNFT.safeMint(
    "0x49e01eb08bBF0696Ed0df8cD894906f7Da635929",
    uri
  );
  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  console.log("mint function executed successfully!");

  const secretpath_metadata = await encrypt_tx(uri, 1, "this is my private metadata")
  console.log("secretpath_metadata: " , secretpath_metadata)
}

mint_with_encrypt();