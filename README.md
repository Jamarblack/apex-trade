# 🚀 APEX·TRADE

> **Submission for Hackathon 2026** > A high-performance, AI-driven Web3 trading terminal and autonomous market execution engine supporting multi-chain operations across Solana and Base networks.

Live Frontend: [https://apex-trade-eosin.vercel.app](https://apex-trade-eosin.vercel.app)  
Live Backend API: [https://apex-trade-bc4l.onrender.com](https://apex-trade-bc4l.onrender.com)

---

## 💡 Overview

**APEX·TRADE** bridges the gap between decentralized finance (DeFi) on-chain activity and real-time artificial intelligence. Built from the ground up over a high-intensity hackathon sprint, the platform combines a lightning-fast UI terminal with a dedicated backend execution engine. It allows users to monitor live price ticks, consume real-time AI trading signals generated via the Gemini API, and interface natively with Web3 wallets to prepare for automated execution.

---

## 🛠️ Architecture & Tech Stack

The project is structured as a decoupled monorepo optimized for seamless production delivery:

* **Frontend Terminal:** Built with **React**, **TypeScript**, and **Vite**, styled using a sleek, low-latency cyberpunk **Tailwind CSS** UI engine, and deployed on **Vercel**.
* **Backend Engine:** Built with **Node.js**, **Express**, and **TypeScript (`tsx`)**, managing continuous live data streams, and deployed on **Render** (configured to handle persistent data loops).
* **AI Integration:** Powered by the **Gemini API** for high-frequency predictive market analysis.

---

## 🌟 Current Capabilities (What It Can Do)

### 1. Multi-Chain Native Wallet Architecture
* Implements native, client-side cryptographic wallet discovery.
* Supports **Solana** network via deep linking/injection with the **Phantom Wallet**.
* Supports **Base** network via injected Web3 providers like **MetaMask** or **Coinbase Wallet**.
* Features runtime address parsing, security tracking, and state synchronization across components.

### 2. Live AI Stream & Predictive Engine
* Consumes live market data loops and feeds them directly into custom AI contexts.
* Streams automated trade signals, market predictions, and directional confidence intervals.

### 3. High-Frequency Live Tickers
* Simulates and feeds accurate cross-chain asset price points via a low-latency pipeline (`/api/markets/ticks`).
* Built-in stream resets and client-side error recovery mechanism to handle flaky networks.

### 4. Interactive Command Center
* A responsive sidebar system balancing diagnostic telemetry panels (AI Engine tracking, latency metrics) alongside interactive trading interfaces.

---

## ⚠️ Current Limitations (What It Cannot Do Yet)

As a rapid hackathon prototype, certain deep-infrastructure features are simulated or mocked to showcase the user experience flow:
* **On-Chain Transaction Settlement:** While the application connects natively to your Web3 wallet and extracts public authorization keys, it does not broadcast raw signed transactions to mainnet RPC nodes yet.
* **Persistent User Profiles:** Data states (such as past trading history profiles) refresh on hard browser reloads as no persistent database layer (e.g., Supabase/PostgreSQL) was hooked up during the sprint.
* **Live Centralized Order Books:** Market ticks rely on custom math-driven volatility pipelines instead of a direct live WebSockets hook into external exchanges (like Binance or Jupiter APIs).

---

## 🔮 Production Roadmap (Expectations for a Big Project)

If scaled beyond a hackathon prototype into an enterprise-grade dApp, APEX·TRADE will implement the following production-grade milestones:

### Phase 1: On-Chain Settlement & Execution Layer
* Integrate `@solana/web3.js` and `viem` / `wagmi` protocols to transform AI predictions into real, executable atomic smart contract actions.
* Implement secure smart accounts (ERC-4337 Account Abstraction) to enable session keys so the AI trading agent can trade automatically on behalf of the user within predefined risk parameters.

### Phase 2: Live Liquidity & Oracle Integration
* Swap out simulated asset ticks with real-time Pyth Network or Chainlink Oracle price feeds.
* Hook the backend directly into Jupiter Aggegator (Solana) and Uniswap V4 (Base) SDKs to pull true executable on-chain liquidity routes.

### Phase 3: Hardened Security & Persistence
* Introduce a secure backend persistence layer using PostgreSQL/Supabase with Row-Level Security (RLS).
* Implement strict API rate-limiting, secure hardware-security-module (HSM) credential parsing, and isolated environments for multi-tenant AI processing loops.

---

## ⚡ Quickstart (Local Development)

### Repository Setup
```bash
git clone [https://github.com/Jamarblack/apex-trade.git](https://github.com/Jamarblack/apex-trade.git)
cd apex-trade

* "HERE's my entry i hope i win" 