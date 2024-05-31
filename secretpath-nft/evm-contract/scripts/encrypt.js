// Import the ABI using require if it's a CommonJS module
const abi = require("../abi.js");

const { ethers } = require("ethers");
const {
  arrayify,
  hexlify,
  SigningKey,
  keccak256,
  recoverPublicKey,
  computeAddress,
} = require("ethers/lib/utils");
const env = require("hardhat");

// Dynamically import the ES Modules and return them
async function loadESModules() {
  try {
    const neutrino = await import("@solar-republic/neutrino");
    const belt = await import("@blake.regalia/belt");
    return { neutrino, belt };
  } catch (error) {
    console.error("Failed to load ES modules:", error);
    return null;
  }
}

let encrypt_tx = async () => {
  const modules = await loadESModules();
  if (!modules) {
    console.log("Required modules could not be loaded.");
    return;
  }

  const { ecdh, chacha20_poly1305_seal } = modules.neutrino;
  const {
    bytes,
    bytes_to_base64,
    json_to_bytes,
    sha256,
    concat,
    text_to_bytes,
    base64_to_bytes,
  } = modules.belt;

  const publicClientAddress = "0x3879E146140b627a5C858a08e507B171D9E43139";
  const routing_contract = process.env.SECRET_CONTRACT;
  const routing_code_hash =
  process.env.SECRET_CODE_HASH;
  const iface = new ethers.utils.Interface(abi);

  const privateKey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/7bb38f598ae5404ebc844325edec7c4e`
  );
  // Create a wallet instance from a private key
  const my_wallet = new ethers.Wallet(privateKey, provider);

  // Generating ephemeral keys
  const wallet = ethers.Wallet.createRandom();
  const userPrivateKeyBytes = arrayify(wallet.privateKey);
  const userPublicKey = new SigningKey(wallet.privateKey).compressedPublicKey;
  const userPublicKeyBytes = arrayify(userPublicKey);

  // Gateway Encryption key for ChaCha20-Poly1305 Payload encryption
  const gatewayPublicKey = "A20KrD7xDmkFXpNMqJn1CLpRaDLcdKpO1NdBBS7VpWh3";
  const gatewayPublicKeyBytes = base64_to_bytes(gatewayPublicKey);

  // create the sharedKey via ECDH
  const sharedKey = await sha256(
    ecdh(userPrivateKeyBytes, gatewayPublicKeyBytes)
  );

  const owner = my_wallet.address;
  const metadata = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-QnHKcPgTFMRerFbd1KiR9a7j/user-Kf3fm6UoibgNfaGMcqTXGocw/img-jHnPGR4tvsVQ4i1iEhYjHF2i.png?st=2024-05-17T10%3A47%3A33Z&se=2024-05-17T12%3A47%3A33Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-05-16T21%3A18%3A51Z&ske=2024-05-17T21%3A18%3A51Z&sks=b&skv=2021-08-06&sig=NzBG2kBsjNjw9n9vu9Tz/2qKw4gSvgfEYiU%2BY9IeLN8%3D";
  const token_id = "1";
  const private_metadata = "i love best buy";
  const myAddress = my_wallet.address;
  const callback_gas_limit = 300000;

  //the function name of the function that is called on the private contract
  const handle = "execute_store_confidential_metadata";

  const data = JSON.stringify({
   owner: owner,
    metadata: metadata,
    token_id: token_id,
    private_metadata: private_metadata, 

  });

  const callbackAddress = publicClientAddress.toLowerCase();
  //This is an empty callback for the sake of having a callback in the sample code.
  //Here, you would put your callback selector for you contract in.
  const callbackSelector = iface.getSighash(
    iface.getFunction("upgradeHandler")
  );
  const callbackGasLimit = Number(callback_gas_limit);

  //payload data that are going to be encrypted
  const payload = {
    data: data,
    routing_info: routing_contract,
    routing_code_hash: routing_code_hash,
    user_address: myAddress,
    user_key: bytes_to_base64(userPublicKeyBytes),
    callback_address: bytes_to_base64(arrayify(callbackAddress)),
    callback_selector: bytes_to_base64(arrayify(callbackSelector)),
    callback_gas_limit: callbackGasLimit,
  };

  //build a Json of the payload
  const payloadJson = JSON.stringify(payload);
  const plaintext = json_to_bytes(payload);

  //generate a nonce for ChaCha20-Poly1305 encryption
  //DO NOT skip this, stream cipher encryptions are only secure with a random nonce!
  const nonce = crypto.getRandomValues(bytes(12));

  //Encrypt the payload using ChachaPoly1305 and concat the ciphertext+tag to fit the Rust ChaChaPoly1305 requirements
  const [ciphertextClient, tagClient] = chacha20_poly1305_seal(
    sharedKey,
    nonce,
    plaintext
  );
  const ciphertext = concat([ciphertextClient, tagClient]);

  //get Metamask to sign the payloadhash with personal_sign
  const ciphertextHash = keccak256(ciphertext);

  //this is what metamask really signs with personal_sign, it prepends the ethereum signed message here
  const payloadHash = keccak256(
    concat([
      text_to_bytes("\x19Ethereum Signed Message:\n32"),
      arrayify(ciphertextHash),
    ])
  );

  //this is what we provide to metamask
  const msgParams = ciphertextHash;
  const from = myAddress;
  const params = [from, msgParams];
  const method = "personal_sign";
  console.log(`Payload Hash: ${payloadHash}`);

  //

  const messageArrayified = ethers.utils.arrayify(ciphertextHash); // Convert the hash to a Uint8Array
  const payloadSignature = await my_wallet.signMessage(messageArrayified); // Sign the message directly with the wallet
  console.log(`Payload Signature: ${payloadSignature}`);

  // Continue with the rest of your original code for public key recovery and address computation
  const user_pubkey = recoverPublicKey(payloadHash, payloadSignature);
  console.log(`Recovered public key: ${user_pubkey}`);
  console.log(
    `Verify this matches the user address: ${computeAddress(user_pubkey)}`
  );

  // function data to be abi encoded
  const _userAddress = myAddress;
  const _routingInfo = routing_contract;
  const _payloadHash = payloadHash;
  const _info = {
    user_key: hexlify(userPublicKeyBytes),
    user_pubkey: user_pubkey,
    routing_code_hash: routing_code_hash,
    task_destination_network: "pulsar-3", //Destination for the task, here: pulsar-3 testnet
    handle: handle,
    nonce: hexlify(nonce),
    payload: hexlify(ciphertext),
    payload_signature: payloadSignature,
    callback_gas_limit: Number(callbackGasLimit),
  };

  console.log(`_userAddress: ${_userAddress}
  _routingInfo: ${_routingInfo} 
  _payloadHash: ${_payloadHash} 
  _info: ${JSON.stringify(_info)}
  _callbackAddress: ${callbackAddress},
  _callbackSelector: ${callbackSelector} ,
  _callbackGasLimit: ${callbackGasLimit}`);

  const functionData = iface.encodeFunctionData("send", [
    _payloadHash,
    _userAddress,
    _routingInfo,
    _info,
  ]);

  const gasFee = await provider.getGasPrice();
  const amountOfGas = gasFee.mul(callbackGasLimit).mul(3).div(2);

  // Define the transaction object
  const tx = {
    gasLimit: ethers.utils.hexlify(150000), // Use hexlify to ensure the gas limit is correctly formatted
    to: publicClientAddress,
    // from: myAddress, // This is not needed because the wallet knows the 'from' address
    value: ethers.utils.hexlify(amountOfGas), // Make sure to hexlify the amount
    data: functionData,
  };

  // Send the transaction using the wallet's sendTransaction method
  try {
    const txResponse = await my_wallet.sendTransaction(tx);
    console.log(`Transaction sent! Hash: ${txResponse.hash}`);

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();
    console.log(`Transaction confirmed! Block Number: ${receipt.blockNumber}`);
  } catch (error) {
    console.error(`Error sending transaction: ${error}`);
  }
};

encrypt_tx();


module.exports = { encrypt_tx };