import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateAuctionItem from "./components/CreateAuctionItem";
import Navigation from "./components/Navigation";
import SecretToken from "./components/SecretToken";
import BidOnAuctionItem from "./components/BidOnAuctionItem";
// 1. Get projectId
const projectId = "6e58f7c259de8fd44a4b237465fe9956";

// 2. Set chains
// const mainnet = {
//   chainId: 1,
//   name: "Ethereum",
//   currency: "ETH",
//   explorerUrl: "https://etherscan.io",
//   rpcUrl: "https://cloudflare-eth.com",
// };

// const polygon = {
//   chainId: 137,
//   name: "Polygon Mainnet",
//   currency: "MATIC",
//   explorerUrl: "https://polygonscan.com",
//   rpcUrl: "https://polygon-rpc.com/",
// };

const sepoliaTestnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://rpc.sepolia.org",
};

const scrollTestnet = {
  chainId: 534351,
  name: "Scroll Sepolia Testnet",
  currency: "ETH",
  explorerUrl: "https://sepolia.scrollscan.com",
  rpcUrl: "https://sepolia-rpc.scroll.io/",
};

const optimismTestnet = {
  chainId: 11155420,
  name: "Optimism",
  currency: "ETH",
  explorerUrl: "https://sepolia-optimistic.etherscan.io/",
  rpcUrl: "https://sepolia.optimism.io",
};

const polygonTestnet = {
  chainId: 80001,
  name: "Polygon Mumbai",
  currency: "MATIC",
  explorerUrl: "https://mumbai.polygonscan.com",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
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

createWeb3Modal({
  ethersConfig,
  chains: [sepoliaTestnet, scrollTestnet, optimismTestnet, polygonTestnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  return (
    <>
      <w3m-button />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6  lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <SecretToken />
          <Router>
            <Navigation /> {/* Navigation included here */}
            <Routes>
              <Route path="/create" element={<CreateAuctionItem />} />
              <Route path="/bid" element={<BidOnAuctionItem />} />
              {/* Define other routes as needed */}
            </Routes>
          </Router>
        </div>
      </div>
    </>
  );
}

export default App;
