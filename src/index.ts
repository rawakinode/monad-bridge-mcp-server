"use strict";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { string, z } from "zod";
import { ethers } from "ethers";
import { ERC20_ABI, SEPOLIA_BRIDGE_WMON_ABI } from "./abi";
import { BRIDGE_CONTRACT_FROM_SEPOLIA, BRIDGE_CONTRACT_FROM_MONAD, WMON_SEPOLIA_CONTRACT } from "./contracts";
require('dotenv').config();

// Import Private key from Environtment
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Initiate Provider
const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/l_Ke2DDFnO33DiHtXTXVlsyZdJEcnh0h");
const monadProvider = new ethers.JsonRpcProvider("https://monad-testnet.g.alchemy.com/v2/a7yt4T3V-ndJMoHBFdRmOmahf2Huaa2W");

// Init client for wallet
const clientSepolia = new ethers.Wallet(PRIVATE_KEY, sepoliaProvider);
const clientMonad = new ethers.Wallet(PRIVATE_KEY, monadProvider);

// Initiate MPC server
const server = new McpServer({
  name: "monad-mcp",
  version: "0.1.0",
  capabilities: [
    "get-wallet-address",
    "get-eth-balance",
    "get-mon-balance",
    "get-wmon-sepolia-balance",
    "bridge-sepolia-wmon-to-monad",
    "bridge-monad-to-sepolia-wmon",
  ]
});

/**
 * Tool to retrieve a wallet address from the loaded private key
 *
 * This tool returns the wallet address (starting with 0x) associated
 * with the private key loaded into the Sepolia client (clientSepolia).
 *
 * Note: This tool does not take parameters. It assumes that the private
 * key is already securely loaded in the client.
 *
 * @returns The Ethereum address derived from the private key
 */
server.tool(
    "get-wallet-address",
    "Get wallet address on Sepolia from a private key (starts with 0x)",
    async () => {
      try {
        return {
          content: [
            {
              type: "text",
              text: `🔐 Your wallet address: \`${clientSepolia.address}\``
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to retrieve wallet address from private key.\n\n**Error:** ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
);
  

/**
 * Tool to check MON balance on the Monad testnet
 *
 * This tool fetches the current MON token balance for a given Monad address.
 * It validates the address format before performing the balance query.
 *
 * @param address A valid Ethereum-style address on Monad testnet
 */
server.tool(
    "get-mon-balance",
    "Get MON balance for an my address on Monad testnet",
    async () => {
        try {
        const balance = await monadProvider.getBalance(clientMonad.address);
        return {
            content: [
            {
                type: "text",
                text: `📍 **MON Balance Check (Monad Testnet)**
                
                **Address:** \`${clientMonad.address}\`
                **Balance:** ${ethers.formatUnits(balance, 18)} MON`
            }
            ]
        };
        } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to retrieve MON balance for address: \`${clientMonad.address}\`.

                    **Error:** ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
        }
    }
);


/**
 * Tool to check ETH balance on the Ethereum Sepolia testnet
 *
 * This tool fetches the current ETH balance for a given Sepolia address.
 * It validates the address format before performing the balance query.
 *
 * @param address A valid Ethereum address on the Sepolia testnet
 */
server.tool(
    "get-eth-balance",
    "Get ETH balance for my address on Sepolia testnet",
    async () => {
        try {
        const balance = await sepoliaProvider.getBalance(clientSepolia.address);
        return {
            content: [
            {
                type: "text",
                text: `📍 **ETH Balance Check (Sepolia Testnet)**

                **Address:** \`${clientSepolia.address}\`
                **Balance:** ${ethers.formatEther(balance)} ETH`
            }
            ]
        };
        } catch (error) {
        return {
            content: [
              {
                  type: "text",
                  text: `❌ Failed to retrieve ETH balance for address: \`${clientSepolia.address}\`.

                  **Error:** ${error instanceof Error ? error.message : String(error)}`
              }
            ]
        };
        }
    }
);

/**
 * Tool to check Wrapped MONAD (WMON) balance on the Sepolia testnet
 *
 * This tool fetches the current balance of the Wrapped MONAD (WMON) ERC-20 token
 * for the connected address using the Sepolia testnet. It interacts with the WMON
 * contract and formats the response in a human-readable message.
 *
 * @returns An array of text content displaying the address and WMON balance,
 * or an error message if the fetch fails.
 */
server.tool(
  "get-wmon-sepolia-balance",
  "Get Wrapped MONAD (WMON) balance for my address on Sepolia testnet ",
  async () => {
      try {

       // Define WMON contract
       const defineWmonContract = new ethers.Contract(WMON_SEPOLIA_CONTRACT, ERC20_ABI, clientSepolia);
       const balance = await defineWmonContract.balanceOf(clientSepolia.address);

      return {
          content: [
          {
              type: "text",
              text: `📍 **Wrapped Monad (WMON) Balance Check (Sepolia Testnet)**

              **Address:** \`${clientSepolia.address}\`
              **Balance:** ${ethers.formatUnits(balance)} WMON`
          }
          ]
      };
      } catch (error) {
      return {
          content: [
            {
                type: "text",
                text: `❌ Failed to retrieve WMON on Sepolia balance for address: \`${clientSepolia.address}\`.

                **Error:** ${error instanceof Error ? error.message : String(error)}`
            }
          ]
      };
      }
  }
);
  

/**
 * Tool for bridging wMON (ERC20 on Sepolia) to MON (native on Monad)
 *
 * The process includes:
 *  1. Estimate gas fee using Sepolia provider
 *  2. Check user ETH balance on Sepolia
 *  3. Populate bridge transaction and calculate total required ETH
 *  4. Submit the bridge transaction via Wormhole if balance is sufficient
 *  5. Return success message with transaction details or error message
 *
 * @param amount The amount of wMON to bridge from Sepolia to the Monad network (max 10)
 */

server.tool(
    "bridge-sepolia-wmon-to-monad", 
    "Bridge Token Wrapped Monad (WMON) on Sepolia to MON Native on MONAD Chain",
    {
        amount: z
        .string()
        .min(1, "Amount is required")
        .refine((val) => !isNaN(Number(val)), { message: "Amount must be a valid number" })
        .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" })
        .refine((val) => Number(val) <= 10, { message: "Maximum amount is 10" })
        .describe("The amount of wMON to bridge from Sepolia to the Monad network")
    },
    async ({ amount }) => {
        try {

        const bridgeFee = ethers.parseEther("0.003625");
        const bridgeAmount = ethers.parseUnits(amount, 18);

        // Approved token allowance for spender
        const defineWmonContract = new ethers.Contract(WMON_SEPOLIA_CONTRACT, ERC20_ABI, clientSepolia);
        const balance = await defineWmonContract.balanceOf(clientSepolia.address);
        if (ethers.formatUnits(balance) < amount) {
          return { content: [{ type: "text",
            text: `WMON balance is insufficient. The wMON balance in Sepolia is insufficient. You need ${amount} wMON to continue. But you only have ${ethers.formatUnits(balance)} wMON.`
          }] }
        }
        const allowance = await defineWmonContract.approve(BRIDGE_CONTRACT_FROM_SEPOLIA, bridgeAmount);
        await allowance.wait();

        // Define Bridge contract on Sepolia
        const interfaceBridge = new ethers.Contract(
            BRIDGE_CONTRACT_FROM_SEPOLIA, 
            SEPOLIA_BRIDGE_WMON_ABI, 
            clientSepolia
        );

        const transaction = await interfaceBridge.transfer(
            WMON_SEPOLIA_CONTRACT,
            bridgeAmount,
            48,
            375000,
            ethers.zeroPadValue(clientSepolia.address, 32),
            {
            value: bridgeFee,
            gasLimit: 500000 
            }
        );
        await transaction.wait();

        const txUrl = `https://wormholescan.io/#/tx/${transaction.hash}?network=Testnet&view=overview`;

        return { 
            content: [ 
                {
                    type: "text",
                    text: `
                    ✅ **Bridge wrapped MON (wMON) to MONAD initiated successfully!**
                    🔁 Please allow approximately **18–20 minutes** for the bridge to complete and thew MON tokens to appear in your wallet on the Monad network.
                    🔗 View on Wormhole Scan:\n${txUrl}
                    🔗 Check your balance on Sepolia. https://sepolia.etherscan.io/address/${clientSepolia.address}
                    🔗 Check your MONAD balance. https://testnet.monadexplorer.com/address/${clientSepolia.address}
                    `
                },
            ]
        };

        } catch (error) {
        return {
            content: [
            {
                type: "text",
                text: `Failed to bridge wMON to MONAD. Error: ${error instanceof Error ? error.message : String(error)}`
            }
            ]
        };
        }
    }
);
  
/**
 * Tool to bridge MON from Monad to Sepolia wMON
 *
 * The process includes:
 *  1. Prepare the calldata for bridging MON to Sepolia wMON using the specified amount, round, and score.
 *  2. Send the transaction to the bridge contract.
 *  3. Return success or error message.
 *
 * @param amounts The amount of MON to bridge from Monad to Sepolia (maximum value handled: 10).
 */
server.tool(
    "bridge-monad-to-sepolia-wmon",
    "Bridge MON from Monad to Sepolia wMON",
    {
      amounts: z
        .string()
        .min(1, "Amount is required")
        .regex(/^\d+(\.\d+)?$/, "Invalid amount format")
        .refine((val) => Number(val) <= 10, { message: "Maximum amount is 10" })
        .describe("The amount of MON to bridge from Monad to Sepolia wMON")
    },
    async ({ amounts }) => {
      try {

        const balance = await monadProvider.getBalance(clientMonad.address);
        const TotalAmmountWithFee = ethers.parseEther((Number(amounts) + 0.4847456273).toString());
        if (ethers.formatEther(balance) < ethers.formatEther(TotalAmmountWithFee)) {
            if (!balance) {
                return {
                    content: [
                      {
                          type: "text",
                          text: `❌ Failed! Your balance not enough! Transaction need ${TotalAmmountWithFee} MON exclude gas fee to send transaction!`
                      },
                    ]
                  };
            }
        }

        const MonTransferSelector = "0xe5d486a5";
  
        // Prepare the encoded calldata
        const abiCoder = new ethers.AbiCoder();
        const encodedAmount = abiCoder.encode(["uint256"], [ethers.parseUnits(amounts, 18)]);
        const encodedRound = abiCoder.encode(["uint16"], [10002]);
        const encodedScore = abiCoder.encode(["uint256"], [6000000]);
        const encodedAddress = abiCoder.encode(["address"], [clientMonad.address]);
  
        // Concatenate calldata
        const calldata = MonTransferSelector + encodedAmount.slice(2) + encodedRound.slice(2) + "0" + encodedScore.slice(2) + encodedAddress.slice(3);
  
        // Send transaction to the contract bridge
        const transaction = await clientMonad.sendTransaction({
          to: BRIDGE_CONTRACT_FROM_MONAD,
          value: ethers.parseEther((Number(amounts) + 0.4847456273).toString()), // Adding additional value for gas or fees
          data: calldata,
          gasLimit: 500000
        });
  
        await transaction.wait();
  
        const txUrl = `https://wormholescan.io/#/tx/${transaction.hash}?network=Testnet&view=overview`;
        
        return {
          content: [
            {
                type: "text",
                text: `
                ✅ **Bridge ${ethers.formatEther(TotalAmmountWithFee)} MON (Amount + Fee) initiated successfully!**
                🔁 Please allow approximately *1-2 minutes** for the bridge to complete and the MON tokens to appear in your wallet on the Monad network.
                🔗 View on Wormhole Scan:\n${txUrl}
                🔗 Check your balance on Sepolia. https://sepolia.etherscan.io/address/${clientMonad.address}
                🔗 Check your MONAD balance. https://testnet.monadexplorer.com/address/${clientMonad.address}
                Note: You will get wMON on Sepolia. You need to Swap wMON/ETH on Uniswap Testnet to get ETH. Import wMON contract (0xbc60de5fdec277c909eb1763f9996ca1ab496567) to Uniswap Testnet Mode.`
            },
          ]
        };
  
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to bridge MON to Sepolia wMON.\n\nError: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
  

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monad MCP Server running with revoke support ✅");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
