import { ethers } from "ethers";
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
import abi from "../abi.js";

const publicClientAddress = "0x3879E146140b627a5C858a08e507B171D9E43139";
const iface = new ethers.utils.Interface(abi);
const routing_contract = process.env.REACT_APP_SECRET_ADDRESS;
const routing_code_hash = process.env.REACT_APP_CODE_HASH;

const provider = new ethers.providers.Web3Provider(window.ethereum);
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
const callbackAddress = publicClientAddress.toLowerCase();
const callbackSelector = iface.getSighash(iface.getFunction("upgradeHandler"));
const callbackGasLimit = 300000;

export default function BidOnAuctionItem() {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState({});
  const [queriedBids, setQueriedBids] = useState({});

  const handleBidChange = (index, value) => {
    setBids({ ...bids, [index]: value });
  };

  const queryAuctionItem = async (key) => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });

    try {
      const query_tx = await secretjs.query.compute.queryContract({
        contract_address: process.env.REACT_APP_SECRET_ADDRESS,
        code_hash: process.env.REACT_APP_CODE_HASH,
        query: { retrieve_auction_item: { key } },
      });

      // Directly return the response assuming it needs to be filtered later
      return query_tx;
    } catch (error) {
      console.error(`Failed to fetch item with key ${key}:`, error);
      return "Error: Fetching item failed"; // Return a string to indicate error
    }
  };

  // New function to query bids
  const queryBids = async (key) => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });
    try {
      const query_tx = await secretjs.query.compute.queryContract({
        contract_address: process.env.REACT_APP_SECRET_ADDRESS,
        code_hash: process.env.REACT_APP_CODE_HASH,
        query: { retrieve_bids: { key } },
      });

      // Extracting the message from the query response
      return query_tx.message || "No bids information available";
    } catch (error) {
      console.error(`Failed to query bids for item with key ${key}:`, error);
      return "Error: Fetching bids failed";
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      const keys = Array.from({ length: 20 }, (_, i) => i + 1); // Example for 10 items
      const promises = keys.map((key) => queryAuctionItem(key));

      const results = await Promise.all(promises);

      // Filter out string responses, indicating errors
      const validItems = results.filter((item) => typeof item !== "string");

      setItems(validItems);
    };

    fetchItems();

    // Also fetch bids for items
    const fetchBids = async () => {
      const keys = Array.from({ length: 10 }, (_, i) => i + 1); // Example for 10 items
      const bidPromises = keys.map((key) => queryBids(key));
      const bidResults = await Promise.all(bidPromises);

      // Create a map of item index to bid messages
      const bidsMap = bidResults.reduce((acc, message, index) => {
        acc[index] = message; // Map item index to the bid message
        return acc;
      }, {});

      setQueriedBids(bidsMap);
    };
    fetchBids();
  }, []);

  const submitBid = async (index, bidValue) => {
    const adjustedIndex = index + 1;

    // Create the data object from form state
    const data = JSON.stringify({
      amount: bidValue,
      bidder_address: myAddress,
      index: adjustedIndex.toString(),
    });

    console.log(data);

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

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-white">
      {items.map((item, index) => (
        <div className="border-4 rounded-lg p-4 m-4" key={index}>
          <h3 className="text-2xl font-semibold">{item.name}</h3>
          <p className="text-base italic">{item.description}</p>
          {/* Displaying the bid message */}
          <p className="text-base">{queriedBids[index]}</p>

          <input
            type="string"
            value={bids[index] || ""}
            onChange={(e) => handleBidChange(index, e.target.value)}
            className="text-black"
            placeholder="Enter your bid"
          />
          <button
            onClick={() => submitBid(index, bids[index])}
            className="mt-4 ml-2 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Place Bid
          </button>
        </div>
      ))}
    </div>
  );
}
