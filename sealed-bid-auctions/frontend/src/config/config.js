// config.js

// 1. Export Project ID
export const projectId = "6e58f7c259de8fd44a4b237465fe9956";

// 2. Testnet configurations
export const testnets = {
  sepoliaTestnet: {
    chainId: 11155111,
    name: "Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://rpc.sepolia.org",
  },
  scrollTestnet: {
    chainId: 534351,
    name: "Scroll Sepolia Testnet",
    currency: "ETH",
    explorerUrl: "https://sepolia.scrollscan.com",
    rpcUrl: "https://sepolia-rpc.scroll.io/",
  },
  // polygonTestnet: {
  //   chainId: 80001,
  //   name: "Matic Mumbai",
  //   currency: "MATIC",
  //   explorerUrl: "https://mumbai.polygonscan.com",
  //   rpcUrl: "https://rpc-mumbai.maticvigil.com/",
  // },
  optimismTestnet: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    currency: "ETH",
    explorerUrl: "https://optimism-sepolia.blockscout.com",
    rpcUrl: "https://sepolia.optimism.io",
  },
  arbitrumTestnet: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia.arbiscan.io",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  },
  baseSepoliaTestnet: {
    chainId: 84532,
    name: "Base Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia-explorer.base.org",
    rpcUrl: "https://sepolia.base.org",
  },
  berachainTestnet: {
    chainId: 80085,
    name: "Berachain Artio",
    currency: "BERA",
    explorerUrl: "https://artio.beratrail.io/",
    rpcUrl: "https://artio.rpc.berachain.com/",
  },
  metisSepoliaTestnet: {
    chainId: 59901,
    name: "Metis Sepolia",
    currency: "Metis",
    explorerUrl: "https://artio.beratrail.io/",
    rpcUrl: "https://sepolia.rpc.metisdevops.link/",
  },
  nearAuroraTestnet: {
    chainId: 1313161555,
    name: "Aurora Testnet",
    currency: "ETH",
    explorerUrl: "https://explorer.testnet.aurora.dev/",
    rpcUrl: "https://testnet.aurora.dev",
  },
  lineaSepoliaTestnet: {
    chainId: 59141,
    name: "Linea Sepolia test network",
    currency: "ETH",
    explorerUrl: "https://sepolia.lineascan.build",
    rpcUrl: "https://rpc.sepolia.linea.build",
  },
};

// 3. Mainnet configurations
export const mainnets = {
  ethereumMainnet: {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://cloudflare-eth.com",
  },
  binanceSmartChainMainnet: {
    chainId: 56,
    name: "BNB Chain",
    currency: "BNB",
    explorerUrl: "https://bscscan.com/",
    rpcUrl: "https://bsc-dataseed.binance.org/",
  },
  polygonMainnet: {
    chainId: 137,
    name: "Polygon Mainnet",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com/",
    rpcUrl: "https://polygon-mainnet.infura.io",
  },
  optimismMainnet: {
    chainId: 10,
    name: "OP Mainnet",
    currency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io/",
    rpcUrl: "https://optimism-mainnet.infura.io",
  },
  arbitrumMainnet: {
    chainId: 42161,
    name: "Arbitrum One",
    currency: "MATIC",
    explorerUrl: "https://explorer.arbitrum.io",
    rpcUrl: "https://arbitrum-mainnet.infura.io",
  },
  avalancheMainnet: {
    chainId: 43114,
    name: "Avalanche Network C-Chain",
    currency: "AVAX",
    explorerUrl: "https://snowtrace.io/",
    rpcUrl: "https://avalanche-mainnet.infura.io",
  },
  baseMainnet: {
    chainId: 8453,
    name: "Base Mainnet",
    currency: "ETH",
    explorerUrl: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org",
  },
  lineaMainnet: {
    chainId: 59144,
    name: "Linea",
    currency: "ETH",
    explorerUrl: "https://lineascan.build",
    rpcUrl: "https://linea.blockpi.network/v1/rpc/public",
  },
  scrollMainnet: {
    chainId: 534352,
    name: "Scroll",
    currency: "ETH",
    explorerUrl: "https://scrollscan.com",
    rpcUrl: "https://rpc.scroll.io",
  },
};

// 4. Metadata Object
export const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://secretpath-connect.vercel.app", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};
