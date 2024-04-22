import { ethers } from "ethers";
import { testnet, mainnet } from "../config/secretpath";
import { SecretNetworkClient } from "secretjs";
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

const callbackSelector = iface.getSighash(iface.getFunction("upgradeHandler"));
const callbackGasLimit = 300000;

export default function BidOnAuctionItem() {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState({});
  const [chainId, setChainId] = useState("");
  const [bidValues, setBidValues] = useState({});

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

  useEffect(() => {
    const fetchItemsAndBids = async () => {
      const fetchedItems = await queryAllAuctionItems(); // Fetch all auction items first
      setItems(fetchedItems);
      const fetchedBids = await queryBidsForItems(fetchedItems); // Fetch bids based on the fetched items
      setBids(fetchedBids);
    };

    fetchItemsAndBids();
  }, []);

  const handleBidChange = (itemKey, value) => {
    setBids((prev) => ({ ...prev, [itemKey]: value }));
    setBidValues((prev) => ({ ...prev, [itemKey]: value }));
  };

  const handleSubmit = async (e, itemKey, amount, index) => {
    e.preventDefault();
    const bidAmount = bids[itemKey];

    console.log(
      `Submitting bid of ${bidAmount} for item ${
        items.find((x) => x.key === itemKey).name
      }`
    );

    // let updatedIndex = itemKey - 1;
    // Create the data object from form state
    const data = JSON.stringify({
      amount: bidAmount,
      bidder_address: myAddress,
      index: itemKey.toString(),
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
    if (chainId === "534352") {
      publicClientAddress = mainnet.publicClientAddressScrollMainnet;
    }
    if (chainId === "59144") {
      publicClientAddress = mainnet.publicClientAddressLineaMainnet;
    }

    if (chainId === "11155111") {
      publicClientAddress = testnet.publicClientAddressSepoliaTestnet;
    }
    if (chainId === "534351") {
      publicClientAddress = testnet.publicClientAddressScrollTestnet;
    }
    if (chainId === "80001") {
      publicClientAddress = testnet.publicClientAddressPolygonMumbaiTestnet;
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
    if (chainId === "59901") {
      publicClientAddress = testnet.publicClientAddressMetisSepoliaTestnet;
    }
    if (chainId === "1313161555") {
      publicClientAddress = testnet.publicClientAddressNearAuroraTestnet;
    }
    if (chainId === "59141") {
      publicClientAddress = testnet.publicClientAddressLineaSepoliaTestnet;
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
      handle: "create_bid",
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
    const amountOfGas = gasFee.mul(callbackGasLimit).mul(3).div(2);

    const tx_params = {
      gas: hexlify(150000),
      to: publicClientAddress,
      from: myAddress,
      value: hexlify(amountOfGas),
      data: functionData,
    };

    const txHash = await provider.send("eth_sendTransaction", [tx_params]);
    console.log(`Transaction Hash: ${txHash}`);
  };

  useEffect(() => {
    const fetchItemsAndBids = async () => {
      const fetchedItems = await queryAllAuctionItems(); // Fetch all auction items first
      setItems(fetchedItems);
      const fetchedBids = await queryBidsForItems(fetchedItems); // Fetch bids based on the fetched items
      setBids(fetchedBids);
    };

    fetchItemsAndBids();
  }, []);

  const queryAllAuctionItems = async () => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });

    let items = [];
    let key = 1;
    let continueFetching = true;

    while (continueFetching) {
      try {
        const response = await secretjs.query.compute.queryContract({
          contract_address: process.env.REACT_APP_SECRET_ADDRESS,
          code_hash: process.env.REACT_APP_CODE_HASH,
          query: { retrieve_auction_item: { key } },
        });

        if (response && response !== "Generic error: Value not found") {
          items.push({ key, ...response });
          key++;
        } else {
          continueFetching = false;
        }
      } catch (error) {
        console.error(`Failed to fetch item with key ${key}:`, error);
        continueFetching = false;
      }
    }

    return items;
  };

  const queryBidsForItems = async (items) => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });

    let bids = [];
    for (let item of items) {
      try {
        const query_tx = await secretjs.query.compute.queryContract({
          contract_address: process.env.REACT_APP_SECRET_ADDRESS,
          code_hash: process.env.REACT_APP_CODE_HASH,
          query: { retrieve_bids: { key: item.key } },
        });

        if (query_tx && query_tx.message) {
          bids.push(query_tx.message);
        } else {
          bids.push("No bids available for this item");
        }
      } catch (error) {
        console.error(
          `Failed to query bids for item with key ${item.key}:`,
          error
        );
        bids.push("Error fetching bids");
      }
    }
    console.log(bids);
    return bids;
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-white">
      <h1 className="text-xl font-bold ml-6">Auction Items</h1>

      {[...items].reverse().map(
        (
          item,
          index // Reverse the copy of items for rendering
        ) => (
          <form
            key={item.key}
            onSubmit={(e) => handleSubmit(e, item.key)}
            className="border-4 rounded-lg p-4 m-4"
          >
            <h3 className="text-2xl font-semibold">{item.name}</h3>
            <p className="text-base italic">{item.description}</p>
            <p>{bids[items.length - 1 - index]}</p>{" "}
            {/* Adjust index for bids */}
            <input
              type="text"
              value={bidValues[item.key] || ""}
              onChange={(e) => handleBidChange(item.key, e.target.value)}
              placeholder="Enter your bid"
              className="text-black"
            />
            <button
              type="submit"
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Bid
            </button>
          </form>
        )
      )}
    </div>
  );
}
