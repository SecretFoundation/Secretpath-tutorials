import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateAuctionItem from "./components/CreateAuctionItem";
import Navigation from "./components/Navigation";
import SecretToken from "./components/SecretToken";
import BidOnAuctionItem from "./components/BidOnAuctionItem";
import { projectId, testnets, mainnets, metadata } from "./config/config";
import MyImage from "./poweredby.png";
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
  chainImages: {
    1088: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",
    59902: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",
    11155111:
      "https://sepolia.etherscan.io/images/svg/brands/ethereum-original.svg",
    534352: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",
    534351: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",
    59144: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",
    59141: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",
    42161: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",
    421614: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",
    80085:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq-tjg8Kqgr76Ved6PbcjBoGCHWwnhDUljH-CziyBOzw&s",
    11155420:
      "https://optimistic.etherscan.io/assets/optimism/images/svg/logos/chain-light.svg?v=24.4.4.4",
    84532: "https://basescan.org/images/svg/brands/main.svg?v=24.4.4.9",
    80002:
      "https://assets-global.website-files.com/637e2b6d602973ea0941d482/63e26c8a3f6e812d91a7aa3d_Polygon-New-Logo.png",
    1313161555: "https://explorer.aurora.dev/assets/network_icon.svg",
  },
  ethersConfig,
  chains: [
    mainnets.ethereumMainnet,
    mainnets.polygonMainnet,
    mainnets.binanceSmartChainMainnet,
    mainnets.optimismMainnet,
    mainnets.arbitrumMainnet,
    mainnets.avalancheMainnet,
    mainnets.baseMainnet,
    mainnets.scrollMainnet,
    mainnets.lineaMainnet,
    mainnets.metisMainnet,
    testnets.arbitrumTestnet,
    testnets.sepoliaTestnet,
    testnets.scrollTestnet,
    testnets.optimismTestnet,
    testnets.baseSepoliaTestnet,
    testnets.berachainTestnet,
    testnets.metisSepoliaTestnet,
    testnets.lineaSepoliaTestnet,
    testnets.nearAuroraTestnet,
    testnets.etherlinkTestnet,
  ],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  return (
    <div className="mt-4">
      <w3m-button />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6  lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="text-white text-xl font-bold mb-10 ml-16">
            EVM Sealed-bid Auctions
          </div>
          <Router>
            <Navigation />

            <Routes>
              <Route path="/create" element={<CreateAuctionItem />} />
              <Route path="/bid" element={<BidOnAuctionItem />} />
            </Routes>
          </Router>
          <img
            src={MyImage}
            alt="Descriptive Text"
            className=" w-18 h-12 rounded-lg shadow-lg mt-8 ml-36"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
