import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
// 1. Get projectId
const projectId = "6e58f7c259de8fd44a4b237465fe9956";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const polygon = {
  chainId: 137,
  name: "Polygon Mainnet",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com/",
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://secretpath-connect.vercel.app", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

function App() {
  const [web3Modal, setWeb3Modal] = useState(null);

  useEffect(() => {
    setWeb3Modal(
      createWeb3Modal({
        ethersConfig,
        chains: [mainnet, polygon],
        projectId,
        enableAnalytics: true,
      })
    );

    async function getChainId() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          console.log(`The current chain ID is: ${network.chainId}`);
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.log("MetaMask is not installed!");
      }
    }

    getChainId();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <w3m-button />
    </div>
  );
}

export default App;
