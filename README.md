
# Monad Bridge MCP Server

A lightweight Model Context Protocol (MCP) server that enables bridging functionality between Ethereum Sepolia and Monad Testnet networks using the Wormhole bridge.

## 🚀 Supported Capabilities

This MCP server provides the following tools:

- `get-wallet-address`: Get wallet address from private key.
- `get-eth-balance`: Check ETH balance on Sepolia testnet.
- `get-mon-balance`: Check MON balance on Monad testnet.
- `bridge-sepolia-wmon-to-monad`: Bridge wrapped MON (wMON) on Sepolia to MON on Monad.
- `bridge-monad-to-sepolia-wmon`: Bridge MON from Monad to wMON on Sepolia.

## 🛠 Configuration

Make sure to set up your `.env` file with the following environment variable:

```env
PRIVATE_KEY=your_private_key_here
```

## 🧱 Server Initialization

```ts
const server = new McpServer({
  name: "monad-mcp",
  version: "0.1.0",
  capabilities: [
    "get-wallet-address",
    "get-eth-balance",
    "get-mon-balance",
    "bridge-sepolia-wmon-to-monad",
    "bridge-monad-to-sepolia-wmon",
  ]
});
```

## 🧪 Providers Used

```ts
const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/...");
const monadProvider = new ethers.JsonRpcProvider("https://monad-testnet.g.alchemy.com/v2/...");
```

## 🔗 Important Links

- [View on Etherscan Sepolia](https://sepolia.etherscan.io/)
- [View on Monad Testnet Explorer](https://testnet.monadexplorer.com/)
- [Wormhole Scan (Testnet)](https://wormholescan.io/?network=Testnet)

## 📦 Repository

This project is available on GitHub:  
🔗 [rawakinode/monad-bridge-mpc-server](https://github.com/rawakinode/monad-bridge-mpc-server)

---

Developed by [Rawakinode](https://github.com/rawakinode)
