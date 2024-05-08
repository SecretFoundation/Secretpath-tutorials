import { ethers } from "ethers";
import { testnet, mainnet } from "../config/secretpath.js";
import React, { useState, useEffect } from "react";
import {
  arrayify,
  hexlify,
  SigningKey,
  keccak256,
  recoverPublicKey,
  computeAddress,
} from "ethers/lib/utils";
import { ecdh, chacha20_poly1305_seal } from "@solar-republic/neutrino";
import {
  bytes,
  bytes_to_base64,
  json_to_bytes,
  sha256,
  concat,
  text_to_bytes,
  base64_to_bytes,
} from "@blake.regalia/belt";
import abi from "../config/abi.js";

function CreateProposal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState("");
  const [chainId, setChainId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const handleChainChanged = (_chainId) => {
      // Convert _chainId to a number since it's usually hexadecimal
      const numericChainId = parseInt(_chainId, 16);
      setChainId(numericChainId.toString());
      console.log("Network changed to chain ID:", numericChainId);
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    // Fetch initial chain ID
    const fetchChainId = async () => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const { chainId } = await provider.getNetwork();
      setChainId(chainId.toString());
      console.log("Current Chain ID:", chainId);
    };

    fetchChainId();

    // Cleanup function to remove listener
    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const iface = new ethers.utils.Interface(abi);
    const routing_contract = process.env.REACT_APP_SECRET_ADDRESS;
    const routing_code_hash = process.env.REACT_APP_CODE_HASH;

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const [myAddress] = await provider.send("eth_requestAccounts", []);

    const wallet = ethers.Wallet.createRandom();
    const userPrivateKeyBytes = arrayify(wallet.privateKey);
    const userPublicKey = new SigningKey(wallet.privateKey).compressedPublicKey;
    const userPublicKeyBytes = arrayify(userPublicKey);
    const gatewayPublicKey = "A20KrD7xDmkFXpNMqJn1CLpRaDLcdKpO1NdBBS7VpWh3";
    const gatewayPublicKeyBytes = base64_to_bytes(gatewayPublicKey);

    const sharedKey = await sha256(
      ecdh(userPrivateKeyBytes, gatewayPublicKeyBytes)
    );

    const callbackSelector = iface.getSighash(
      iface.getFunction("upgradeHandler")
    );
    const callbackGasLimit = 300000;

    // Create the data object from form state
    const data = JSON.stringify({
      name: name,
      description: description,
      end_time: minutes,
    });

    let publicClientAddress;

    if (chainId === "1") {
      publicClientAddress = mainnet.publicClientAddressEthereumMainnet;
    }
    if (chainId === "56") {
      publicClientAddress = mainnet.publicClientAddressBinanceSmartChainMainnet;
    }
    if (chainId === "137") {
      publicClientAddress = mainnet.publicClientAddressPolygonMainnet;
    }
    if (chainId === "10") {
      publicClientAddress = mainnet.publicClientAddressOptimismMainnet;
    }
    if (chainId === "42161") {
      publicClientAddress = mainnet.publicClientAddressArbitrumOneMainnet;
    }
    if (chainId === "43114") {
      publicClientAddress = mainnet.publicClientAddressAvalanceCChainMainnet;
    }
    if (chainId === "8453") {
      publicClientAddress = mainnet.publicClientAddressBaseMainnet;
    }

    if (chainId === "59144") {
      publicClientAddress = mainnet.publicClientAddressLineaMainnet;
    }

    if (chainId === "534352") {
      publicClientAddress = mainnet.publicClientAddressScrollMainnet;
    }

    if (chainId === "1088") {
      publicClientAddress = mainnet.publicClientAddressMetisMainnet;
    }

    if (chainId === "11155111") {
      publicClientAddress = testnet.publicClientAddressSepoliaTestnet;
    }
    if (chainId === "534351") {
      publicClientAddress = testnet.publicClientAddressScrollTestnet;
    }
    if (chainId === "80002") {
      publicClientAddress = testnet.publicClientAddressPolygonAmoyTestnet;
    }
    if (chainId === "11155420") {
      publicClientAddress = testnet.publicClientAddressOptimismSepoliaTestnet;
    }
    if (chainId === "421614") {
      publicClientAddress = testnet.publicClientAddressArbitrumSepoliaTestnet;
    }
    if (chainId === "84532") {
      publicClientAddress = testnet.publicClientAddressBaseSepoliaTestnet;
    }

    if (chainId === "80085") {
      publicClientAddress = testnet.publicClientAddressBerachainTestnet;
    }

    if (chainId === "128123") {
      publicClientAddress = testnet.publicClientAddressEtherlinkTestnet;
    }
    if (chainId === "59902") {
      publicClientAddress = testnet.publicClientAddressMetisSepoliaTestnet;
    }
    if (chainId === "1313161555") {
      publicClientAddress = testnet.publicClientAddressNearAuroraTestnet;
    }
    if (chainId === "59141") {
      publicClientAddress = testnet.publicClientAddressLineaSepoliaTestnet;
    }
    if (chainId === "51") {
      publicClientAddress = testnet.publicClientAddressXDCApothemTestnet;
    }
    if (chainId === "4202") {
      publicClientAddress = testnet.publicClientAddressLiskSepoliaTestnet;
    }

    const callbackAddress = publicClientAddress.toLowerCase();
    console.log("callback address: ", callbackAddress);
    console.log(data);
    console.log(callbackAddress);

    // Payload construction
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

    const payloadJson = JSON.stringify(payload);
    const plaintext = json_to_bytes(payload);
    const nonce = crypto.getRandomValues(bytes(12));

    const [ciphertextClient, tagClient] = chacha20_poly1305_seal(
      sharedKey,
      nonce,
      plaintext
    );
    const ciphertext = concat([ciphertextClient, tagClient]);
    const ciphertextHash = keccak256(ciphertext);
    const payloadHash = keccak256(
      concat([
        text_to_bytes("\x19Ethereum Signed Message:\n32"),
        arrayify(ciphertextHash),
      ])
    );
    const msgParams = ciphertextHash;

    const params = [myAddress, msgParams];
    const method = "personal_sign";
    const payloadSignature = await provider.send(method, params);
    const user_pubkey = recoverPublicKey(payloadHash, payloadSignature);

    const _info = {
      user_key: hexlify(userPublicKeyBytes),
      user_pubkey: user_pubkey,
      routing_code_hash: routing_code_hash,
      task_destination_network: "pulsar-3",
      handle: "create_proposal",
      nonce: hexlify(nonce),
      payload: hexlify(ciphertext),
      payload_signature: payloadSignature,
      callback_gas_limit: callbackGasLimit,
    };

    const functionData = iface.encodeFunctionData("send", [
      payloadHash,
      myAddress,
      routing_contract,
      _info,
    ]);

    const gasFee = await provider.getGasPrice();
    let amountOfGas;
    if (chainId === "4202") {
      amountOfGas = gasFee.mul(callbackGasLimit).mul(100000).div(2);
    } else {
      amountOfGas = gasFee.mul(callbackGasLimit).mul(3).div(2);
    }

    const tx_params = {
      gas: hexlify(150000),
      to: publicClientAddress,
      from: myAddress,
      value: hexlify(amountOfGas),
      data: functionData,
    };

    try {
      const txHash = await provider.send("eth_sendTransaction", [tx_params]);
      console.log(`Transaction Hash: ${txHash}`);

      setIsModalVisible(true); // Show the modal on success
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Function to close modal
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md mb-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-white">Create Proposal</div>
        <div className="border-4 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-white">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Proposal Name"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium leading-6 text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Create a yes or no proposal"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              rows="4"
            ></textarea>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium leading-6 text-white">
              Minutes
            </label>
            <input
              type="text"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Proposal duration in minutes"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Proposal
        </button>
      </form>
      {isModalVisible && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-4 rounded">
            <h2 className="text-lg">Proposal Created Successfully!</h2>

            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
            <a
              href={`/vote`}
              className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-green-700"
            >
              View Proposal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateProposal;
