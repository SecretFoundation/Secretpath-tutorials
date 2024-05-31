import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import CreateNFT from './components/CreateNFT';
import DisplayNFT from './components/DisplayNFT';
import MyImage from "./poweredby.png";
import Spline from "@splinetool/react-spline";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <nav className="bg-gray-800 p-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
        </nav>
        <div className="text-white text-xl font-bold text-center mt-8">
          Cross-Chain NFT Demo
          <h6 className="text-xs hover:underline">
            <a
              href="https://testnets.opensea.io/collection/secretnft-11"
              rel="noopener noreferrer"
            >
              [click here to view NFTs on Opensea]
            </a>
          </h6>
          <h6 className="text-xs hover:underline">
            <a
              href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ethereum-evm-developer-toolkit/usecases/nfts"
              rel="noopener noreferrer"
            >
              [click here for docs]
            </a>
          </h6>
          
          <div className="mt-2 w-18 h-20 " id="mySplineScene">
      <Spline scene="https://prod.spline.design/NmlFm-JZtHmQe7ek/scene.splinecode" />
    </div>
        </div>
        <div className="flex flex-col items-center justify-start mt-[-25px] ">
          <Routes >
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateNFT />} />
            <Route path="/display" element={<DisplayNFT />} />
          </Routes>
          <img
            src={MyImage}
            alt="Powered by Secret"
            className="w-18 h-12 rounded-lg shadow-lg mb-8 mt-8"
          />
        </div>
      </div>
    </Router>
  );
}

export default App;
