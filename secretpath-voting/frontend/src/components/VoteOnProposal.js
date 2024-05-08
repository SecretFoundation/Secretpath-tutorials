import { ethers } from "ethers";
import { testnet, mainnet } from "../config/secretpath.js";
import { SecretNetworkClient } from "secretjs";
import ClipLoader from "react-spinners/ClipLoader";
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

export default function VoteOnProposal({ myAddress, setMyAddress }) {
  const [items, setItems] = useState([]);
  const [bids, setVotes] = useState({});
  const [chainId, setChainId] = useState("");
  const [voteValues, setVoteValues] = useState({});
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchItemsAndBids = async () => {
      const fetchedItems = await queryAllProposals();
      setItems(fetchedItems);
      const fetchedVotes = await queryVotesForItems(fetchedItems);
      setVotes(fetchedVotes);
    };

    fetchItemsAndBids();
  }, []);

  const handleVoteChange = (itemKey, value) => {
    setVotes((prev) => ({ ...prev, [itemKey]: value }));
    setVoteValues((prev) => ({ ...prev, [itemKey]: value }));
  };

  const handleSubmit = async (e, itemKey, amount, index) => {
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

    const myVote = bids[itemKey];

    console.log(
      `Submitting vote of ${myVote} for item ${
        items.find((x) => x.key === itemKey).name
      }`
    );

    // let updatedIndex = itemKey - 1;
    // Create the data object from form state
    const data = JSON.stringify({
      vote: myVote,
      bidder_address: myAddress,
      index: itemKey.toString(),
    });

    console.log(data);

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
      handle: "create_vote",
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

  useEffect(() => {
    const fetchItemsAndVotes = async () => {
      const fetchedItems = await queryAllProposals(); // Fetch all proposals first
      setItems(fetchedItems);
      const fetchedVotes = await queryVotesForItems(fetchedItems); // Fetch votes based on the fetched items
      setVotes(fetchedVotes);
      setLoading(false);
    };

    fetchItemsAndVotes();
  }, []);

  const queryAllProposals = async () => {
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
          query: { retrieve_proposal: { key } },
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

  const queryVotesForItems = async (items) => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });

    let votes = [];
    for (let item of items) {
      try {
        const query_tx = await secretjs.query.compute.queryContract({
          contract_address: process.env.REACT_APP_SECRET_ADDRESS,
          code_hash: process.env.REACT_APP_CODE_HASH,
          query: { retrieve_votes: { key: item.key } },
        });

        if (query_tx && query_tx.message) {
          votes.push(query_tx.message);
        } else {
          votes.push("No votes available for this item");
        }
      } catch (error) {
        console.error(
          `Failed to query votes for item with key ${item.key}:`,
          error
        );
        votes.push("Error fetching votes");
      }
    }
    console.log(votes);
    return votes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center ">
        <ClipLoader color="#ffffff" loading={loading} size={150} />
      </div>
    );
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-white">
      <h1 className="text-xl font-bold">Proposals</h1>

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
            <p>{bids[items.length - 1 - index]}</p>
            {/* Check each proposal's status individually before rendering the vote interface */}
            {!bids[items.length - 1 - index].includes("wins") &&
            !bids[items.length - 1 - index].includes("Tie!") ? (
              <>
                <select
                  value={voteValues[item.key] || ""}
                  onChange={(e) => handleVoteChange(item.key, e.target.value)}
                  className="text-black bg-white rounded-md p-2 min-w-[200px]"
                >
                  <option value="">Select your vote</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <button
                  type="submit"
                  className="mt-4 min-w-[200px] flex justify-center mx-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Vote
                </button>
              </>
            ) : null}
          </form>
        )
      )}
      {isModalVisible && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-4 rounded">
            <h2 className="text-lg">Vote Created Successfully!</h2>
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
