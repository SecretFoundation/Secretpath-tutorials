import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateProposal from "./components/CreateProposal";
import Navigation from "./components/Navigation";
import VoteOnProposal from "./components/VoteOnProposal";
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
    // Arbitrum Mainnet
    42161: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",
    // Linea Mainnet
    59144: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",

    //Scroll Mainnet
    534352: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",

    // Metis Mainnet
    1088: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",

    //Sepolia Testnet
    11155111:
      "https://sepolia.etherscan.io/images/svg/brands/ethereum-original.svg",

    // Scroll Testnet
    534351: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",

    // Polygon Amoy Testnet
    80002:
      "https://assets-global.website-files.com/637e2b6d602973ea0941d482/63e26c8a3f6e812d91a7aa3d_Polygon-New-Logo.png",

    // Optimism Testnet
    11155420:
      "https://optimistic.etherscan.io/assets/optimism/images/svg/logos/chain-light.svg?v=24.4.4.4",

    // Arbitrum Testnet
    421614: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",

    // Base Sepolia Testnet
    84532: "https://basescan.org/images/svg/brands/main.svg?v=24.4.4.9",

    // Berachain Testnet
    80085:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq-tjg8Kqgr76Ved6PbcjBoGCHWwnhDUljH-CziyBOzw&s",

    // Etherlink Testnet
    128123: "https://www.etherlink.com/favicon.ico",

    //Metis Sepolia Testnet
    59902: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",

    // Near Aurora Testnet
    1313161555:
      "https://play-lh.googleusercontent.com/0zJGaaodqDL--ig2W2h60zp5uLMexQs4_PRlon5qhakSwqsdwa_ZmV9DQKvg1WVnn-w=w240-h480-rw",

    // Linea Testnet
    59141: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",

    // XDC Apothem
    51: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe2KDAtPElT99WYln7tyeQPlPCiBWaRfRA_guAL0HImJWBcRympM_r5VBSiOR29zFpKIU&usqp=CAU",

    //Lisk Sepolia
    4202: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRan6D0dfiYmx2sv4kUPsFkfUDxYUWEuuA_dLJWgPm8Q&s",
  },
  ethersConfig,
  chains: [
    mainnets.ethereumMainnet,
    mainnets.binanceSmartChainMainnet,
    mainnets.polygonMainnet,
    mainnets.optimismMainnet,
    mainnets.arbitrumMainnet,
    mainnets.avalancheMainnet,
    mainnets.baseMainnet,
    mainnets.lineaMainnet,
    mainnets.scrollMainnet,
    mainnets.metisMainnet,
    testnets.sepoliaTestnet,
    testnets.scrollTestnet,
    testnets.polygonTestnet,
    testnets.optimismTestnet,
    testnets.arbitrumTestnet,
    testnets.baseSepoliaTestnet,
    testnets.berachainTestnet,
    testnets.etherlinkTestnet,
    testnets.metisSepoliaTestnet,
    testnets.nearAuroraTestnet,
    testnets.lineaSepoliaTestnet,
    testnets.XDCApothemTestnet,
    testnets.liskSepoliaTestnet,
  ],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  return (
    <div className="mt-4 ml-4">
      <w3m-button />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6  lg:px-8">
        <div className="flex flex-col items-center justify-center text-center mt-4 ml-4">
          <div className="text-white text-xl font-bold mb-10">
            Cross-Chain EVM Voting Demo
            <h6 className=" text-xs hover:underline">
              <a
                href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ethereum-evm-developer-toolkit/usecases/confidential-voting/confidential-voting-developer-tutorial-with-secretpath"
                target="_blank"
              >
                [click here for docs]
              </a>
            </h6>
          </div>

          <Router>
            <Navigation />

            <Routes>
              <Route path="/create" element={<CreateProposal />} />
              <Route path="/vote" element={<VoteOnProposal />} />
            </Routes>
          </Router>
          <img
            src={MyImage}
            alt="Descriptive Text"
            className="mx-auto w-18 h-12 rounded-lg shadow-lg mt-8"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
