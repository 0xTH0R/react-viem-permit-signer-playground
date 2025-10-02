# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Viem playground application for signing EIP-712 typed data permits. It's a single-page application built with Vite, React 19, and Tailwind CSS that demonstrates permit signature generation for Ethereum contracts.

## Development Commands

- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle (outputs to `dist/` directory)

## Deployment

This project is configured for GitHub Pages deployment:

1. **Automatic Deployment**: Pushes to `main` branch automatically deploy via GitHub Actions
2. **Manual Setup** (one-time):
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
3. **Live URL**: https://0xTH0R.github.io/react-viem-permit-signer-playground/

The base path is configured in `vite.config.ts` to match the repository name.

## Architecture

### Single-File Application Structure
The entire React application lives in `index.tsx` (root level, not in a `src/` directory). This is an intentional single-file design for a playground/example project.

### Core Components

**Wallet Client Setup** (index.tsx:20-23)
- Uses viem's `createWalletClient` with Arbitrum chain configuration
- Configured with custom transport to work with window.ethereum
- Mock ethereum provider included for demonstration (index.tsx:8-18)

**State Management** (index.tsx:26-64)
- `account`: Connected wallet address
- `signature`: Generated permit signature hash
- `permitData`: JSON string containing EIP-712 typed data structure
- `error`: Error messages from wallet operations

**Permit Data Format**
The application expects JSON input with the following EIP-712 structure:
- `domain`: Contract metadata (name, version, chainId, verifyingContract)
- `types`: Type definitions for the message (e.g., Permit with spender, tokenId, nonce, deadline)
- `primaryType`: The primary type being signed (e.g., "Permit")
- `message`: The actual permit data to sign

### Key Functions

**connect()** (index.tsx:66-74)
- Calls `walletClient.requestAddresses()` to trigger wallet connection
- Sets the first returned address as the active account

**signTypedData()** (index.tsx:76-107)
- Parses JSON permit data from textarea
- Validates required fields (domain, types, message, primaryType)
- Calls `walletClient.signTypedData()` with parsed parameters
- Updates signature state or shows error

### UI Structure

The app has two main views controlled by account connection state:

1. **Connect View** (index.tsx:241-263): Wallet connection prompt
2. **Signer View** (index.tsx:110-239):
   - Connected account display
   - JSON textarea for permit data input
   - Format/Clear controls
   - Sign button
   - Error/Success feedback
   - Signature output with copy functionality

## Tech Stack

- **React 19**: UI library
- **Viem**: Ethereum interaction library (wallet client, typed data signing)
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling (config in root-level tailwind.config.js)
- **TypeScript**: Type safety

## Important Notes

- The tsconfig.json includes `"src"` but the actual source file is `index.tsx` in the root directory
- Mock ethereum provider is hardcoded for demonstration - replace with real wallet connection in production
- Default permit data is pre-populated for Uniswap V3 Positions NFT on Arbitrum
