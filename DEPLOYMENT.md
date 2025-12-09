# Fight Club - Deployment Guide

This guide covers deploying the Fight Club DeFi Battle Royale application to production.

## Architecture

- **Frontend**: Next.js 14 (deployed on Vercel)
- **Backend**: Express + WebSocket (deployed on Railway)
- **Blockchain**: Base Sepolia (testnet) / Base (mainnet)
- **Smart Contract**: FightClubV2.sol (deployed via Remix IDE or Hardhat)

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **WalletConnect Project ID**: Get from [cloud.walletconnect.com](https://cloud.walletconnect.com)
4. **Base Sepolia Testnet ETH**: For testing (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
5. **Deployed Smart Contract**: Deploy `FightClubV2.sol` to Base Sepolia

---

## Step 1: Deploy Smart Contract

### Option A: Using Remix IDE (Recommended for Windows ARM64)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file `FightClubV2.sol`
3. Copy the contract code from `contracts/FightClubV2.sol`
4. Compile with Solidity 0.8.24
5. Deploy to Base Sepolia:
   - Select "Injected Provider" (MetaMask)
   - Switch MetaMask to Base Sepolia network
   - Click "Deploy"
   - **Copy the deployed contract address** (you'll need this)

### Option B: Using Hardhat (if you have it working)

```bash
cd server
npm install
npx hardhat run scripts/deploy.ts --network baseSepolia
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or use Railway CLI)
4. Connect your repository

### 2.2 Configure Environment Variables

In Railway dashboard, go to your service → Variables, and add:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x...YOUR_DEPLOYED_CONTRACT_ADDRESS...
ORACLE_PRIVATE_KEY=0x...YOUR_ORACLE_WALLET_PRIVATE_KEY...
PORT=3001
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
```

**Important Notes:**
- `ORACLE_PRIVATE_KEY`: This wallet will call `startBattle()` and `finalizeBattle()`. Fund it with Base Sepolia ETH.
- `FRONTEND_ORIGIN`: Set this to your Vercel deployment URL (or `*` for development)

### 2.3 Configure Build Settings

Railway will auto-detect the `server/` directory. Ensure:
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

The `railway.json` file in `server/` should handle this automatically.

### 2.4 Deploy

Railway will automatically deploy when you push to your main branch, or click "Deploy" in the dashboard.

### 2.5 Get Backend URL

After deployment, Railway will provide a URL like:
```
https://your-app.up.railway.app
```

**Copy this URL** - you'll need it for the frontend.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (or `pnpm build`)
   - **Output Directory**: `.next`

### 3.2 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...YOUR_DEPLOYED_CONTRACT_ADDRESS...
NEXT_PUBLIC_BACKEND_URL=https://your-app.up.railway.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**Important:**
- All frontend env vars MUST start with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_BACKEND_URL` should be your Railway backend URL

### 3.3 Deploy

Click "Deploy" or push to your main branch. Vercel will automatically deploy.

### 3.4 Update CORS in Backend

After getting your Vercel URL, update the `FRONTEND_ORIGIN` in Railway to:
```
https://your-vercel-app.vercel.app
```

Then redeploy the backend.

---

## Step 4: Testing

### 4.1 Test Backend

```bash
curl https://your-app.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":...}`

### 4.2 Test Frontend

1. Visit your Vercel URL
2. Connect wallet (MetaMask with Base Sepolia)
3. Configure an agent
4. Click "Deploy Agent"
5. Confirm transaction in MetaMask
6. Wait for battle to start
7. Watch leaderboard update

### 4.3 Test WebSocket

Open browser console on your frontend and check for:
```
✅ WebSocket connected to leaderboard
```

---

## Step 5: Production Checklist

- [ ] Smart contract deployed and verified on Base Sepolia
- [ ] Backend deployed on Railway with all env vars set
- [ ] Frontend deployed on Vercel with all env vars set
- [ ] CORS configured correctly (backend allows frontend origin)
- [ ] Oracle wallet funded with Base Sepolia ETH
- [ ] WebSocket connection working
- [ ] Contract interactions working (enterArena, startBattle, etc.)
- [ ] Leaderboard updates in real-time
- [ ] Error handling working (check browser console and Railway logs)

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `ORACLE_PRIVATE_KEY` is valid and wallet has ETH

**Problem**: WebSocket not connecting
- Check that Railway exposes WebSocket (should work automatically)
- Verify `FRONTEND_ORIGIN` includes your Vercel URL
- Check browser console for WebSocket errors

**Problem**: Contract calls failing
- Verify `CONTRACT_ADDRESS` is correct
- Check `BASE_SEPOLIA_RPC_URL` is accessible
- Ensure oracle wallet has ETH for gas

### Frontend Issues

**Problem**: Can't connect wallet
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check that MetaMask is on Base Sepolia network
- Clear browser cache and try again

**Problem**: Transaction fails
- Check contract address is correct
- Verify you have Base Sepolia ETH
- Check browser console for error messages

**Problem**: Leaderboard not updating
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check WebSocket connection in browser console
- Verify backend is running and accessible

---

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed FightClubV2 contract | `0x1234...` |
| `NEXT_PUBLIC_BACKEND_URL` | Railway backend URL | `https://app.up.railway.app` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `abc123...` |

### Backend (server/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia RPC endpoint | `https://sepolia.base.org` |
| `CONTRACT_ADDRESS` | Deployed contract address | `0x1234...` |
| `ORACLE_PRIVATE_KEY` | Oracle wallet private key | `0xabcd...` |
| `PORT` | Server port | `3001` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `https://app.vercel.app` |

---

## Next Steps

- Monitor Railway logs for backend errors
- Monitor Vercel analytics for frontend performance
- Set up error tracking (Sentry, etc.)
- Add rate limiting to backend API
- Implement proper logging
- Set up monitoring/alerts

---

## Support

For issues, check:
- Railway logs: Railway dashboard → Deployments → Logs
- Vercel logs: Vercel dashboard → Deployments → Logs
- Browser console: F12 → Console tab
- Network tab: F12 → Network tab (check API calls)

