import React, { useState, useEffect } from 'react';
import abi from "../abi/SecretNFT.json";
import { ethers } from 'ethers';
import { SecretNetworkClient } from "secretjs";
import DisplayIPFSImage from '../components/DisplayIPFSImage';

export default function DisplayNFT() {
    const [nftData, setNftData] = useState([]);
    const [currentTokenId, setCurrentTokenId] = useState(null);
    const [passwords, setPasswords] = useState({});
    const [hiddenMessages, setHiddenMessages] = useState({});
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

    useEffect(() => {
        const fetchTokenId = async () => {
            try {
                if (!window.ethereum) {
                    console.error('MetaMask is not installed');
                    return;
                }
                await (window).ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xAA36A7' }], // chainId must be in hexadecimal numbers
                });

                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();

                const contractABI = abi.abi;
                const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

                const tokenId = await contract.totalSupply();
                setCurrentTokenId(tokenId.toString());
                console.log('Current token ID:', tokenId.toString());
            } catch (error) {
                console.error('Error fetching token ID:', error);
            }
        };

        fetchTokenId();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const secretjs = new SecretNetworkClient({
                url: "https://lcd.testnet.secretsaturn.net",
                chainId: "pulsar-3",
            });

            try {
                const nftDataArray = [];
                for (let i = 0; i < parseInt(currentTokenId); i++) {
                    try {
                        const query_tx = await secretjs.query.compute.queryContract({
                            contract_address: process.env.REACT_APP_SECRET_CONTRACT_ADDRESS,
                            code_hash: process.env.REACT_APP_SECRET_CODE_HASH,
                            query: { retrieve_metadata: { token_id: i } }
                        });

                        if (query_tx.uri) {
                            nftDataArray.push(query_tx);
                            console.log(query_tx);
                        }
                    } catch (error) {
                        console.error(`Error fetching NFT data for token ${i}:`, error);
                    }
                }
                setNftData(nftDataArray);
            } catch (error) {
                console.error('Error fetching NFT data:', error);
                setNftData([]);
            }
        };

        if (currentTokenId !== null) {
            fetchData();
        }
    }, [currentTokenId]);

    const queryPrivateMetadata = async (tokenId, password) => {
        const secretjs = new SecretNetworkClient({
            url: "https://lcd.testnet.secretsaturn.net",
            chainId: "pulsar-3",
        });

        try {
            const query_tx = await secretjs.query.compute.queryContract({
                contract_address: process.env.REACT_APP_SECRET_CONTRACT_ADDRESS,
                code_hash: process.env.REACT_APP_SECRET_CODE_HASH,
                query: { retrieve_private_metadata: { token_id: tokenId, password: password } }
            });
            console.log(query_tx);
            return query_tx;
        } catch (error) {
            console.error(`Error fetching private metadata for token ${tokenId}:`, error);
            return null;
        }
    };

    const handlePasswordSubmit = async (tokenId) => {
        const password = passwords[tokenId];
        const privateMetadata = await queryPrivateMetadata(tokenId, password);
        if (privateMetadata) {
            setHiddenMessages((prev) => ({
                ...prev,
                [tokenId]: privateMetadata.private_metadata, // Adjust this based on your actual response structure
            }));
        }
    };

    const handleInputChange = (tokenId, value) => {
        setPasswords((prev) => ({
            ...prev,
            [tokenId]: value,
        }));
    };

    if (nftData.length === 0) {
        return (
            <div className="flex flex-col full-height justify-center items-center px-6 lg:px-8 pt-4">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8">
            <div className="mt-8">
                <h1 className="text-white text-2xl mb-6">NFT Details</h1>
                {nftData.map((nft, index) => (
                    <div key={index} className="border-4 rounded-lg p-4 mb-4 w-full max-w-md bg-white/10">
                        <p className="text-white"><strong>Token ID:</strong> {nft.token_id}</p>
                        <p className="text-white"><strong>Owner:</strong> {nft.owner}</p>
                        <div className="flex justify-center items-center">
                            <DisplayIPFSImage ipfsHash={nft.uri} />
                        </div>
                        <div className="mt-4 flex flex-col justify-center items-center">
                            {hiddenMessages[nft.token_id] ? (
                                <div className="text-white">
                                    <strong>Hidden Message:</strong> {hiddenMessages[nft.token_id]}
                                </div>
                            ) : (
                                <div className="flex justify-center items-center">
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={passwords[nft.token_id] || ''}
                                        onChange={(e) => handleInputChange(nft.token_id, e.target.value)}
                                        className="p-2 border rounded text-black"
                                    />
                                    <button
                                        onClick={() => handlePasswordSubmit(nft.token_id)}
                                        className="ml-2 p-2 bg-blue-500 text-white rounded"
                                    >
                                        Reveal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}