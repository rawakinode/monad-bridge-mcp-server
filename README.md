
# Monad Bridge MCP Server

A lightweight Model Context Protocol (MCP) server that enables bridging functionality between Ethereum Sepolia and Monad Testnet networks using the Wormhole bridge.

## 🚀 Supported Tools

This MCP server provides the following tools:

| Name                          | Decription                                                   |
|----------------------------------|-------------------------------------------------------------|
| `get-wallet-address`             | Get wallet address from private key.                       |
| `get-eth-balance`                | Check ETH balance on Sepolia testnet.                      |
| `get-mon-balance`                | Check MON balance on Monad testnet.                        |
| `bridge-sepolia-wmon-to-monad`  | Bridge wrapped MON (wMON) on Sepolia to MON on Monad.      |
| `bridge-monad-to-sepolia-wmon`  | Bridge MON from Monad to wMON on Sepolia.                  |
| `get-wmon-sepolia-balance` | Check Wrapped MON (wMON) balance on Sepolia. |
|`get-10-last-bridge-transaction`|Get and view the last 10 bridge transactions from Sepolia to Monad or Monad to Sepolia|

## Quick Start

- Clone the repository
```bash
git clone https://github.com/rawakinode/monad-bridge-mcp-server.git
cd monad-bridge-mcp-server
npm install
```

- Build and run
```
npm run build
```

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Claude Desktop (for MCP Client integration)

## How to Use

1. You need to Download and install Claude Dekstop
2. Open Claude Dekstop
3. Go to `Settings > Developer`
4. Open config . Edit `claude_desktop_config.json`
5. Add the following configuration.
```json
{
  "mcpServers": {
    "monad-mcp": {
      "command": "node",
      "args": ["<your-local-path>monad-bridge-mcp-server\\build\\index.js"],
      "env": {
        "PRIVATE_KEY": "<your-private-key>" 
      }
    }
  }
}

```
6. Replace `<your-local-path>monad-bridge-mcp-server\\build\\index.js` with the actual path to your project directory (e.g., `E:\data\monad-bridge-mcp-server\build\index.js` on Windows or `/home/user/monad-bridge-mcp-server\build\index.js` on Linux).
7. Restart Claude Desktop.
8. When prompted, allow MCP access for the chat session `(Allow for This Chat)`.

## Important Links

- [View on Etherscan Sepolia](https://sepolia.etherscan.io/)
- [View on Monad Testnet Explorer](https://testnet.monadexplorer.com/)
- [Wormhole Scan (Testnet)](https://wormholescan.io/?network=Testnet)

## Contact

- [Twitter X](https://x.com/rawakinode)
- [Github](https://github.com/rawakinode)

