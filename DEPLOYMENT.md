# BaseQuest Deployment Guide

## Prerequisites
- Node.js 18+
- ETH on Base Mainnet (for deployment gas)
- Basescan API key: https://basescan.org/myapikey
- CDP RPC URL: https://portal.cdp.coinbase.com

## Step 1 — Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

## Step 2 — Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

## Step 3 — Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network base
```
Copy the printed addresses into your .env as VITE_* vars.

## Step 4 — Verify Contracts
```bash
npx hardhat run scripts/verify.js --network base
```

## Step 5 — Deploy Frontend
```bash
cd frontend && npm run build
```
Deploy the `frontend/dist` folder to Vercel.
Set all VITE_ environment variables in Vercel dashboard.

## Vercel Env Vars Required
- VITE_CORE_CONTRACT
- VITE_GAME_CONTRACT
- VITE_BRIDGE_CONTRACT
- VITE_CDP_RPC_URL
- VITE_BASESCAN_API_KEY
- VITE_WALLETCONNECT_PROJECT_ID
