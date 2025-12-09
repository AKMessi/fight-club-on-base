# Fight Club 🥊

**DeFi Battle Royale on Base Blockchain**

A Web3 game where players configure AI trading agents to compete in simulated market battles. The last agent standing (or highest P&L) wins the prize pool.

![Fight Club](https://img.shields.io/badge/Base-Sepolia-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

---

## 🎮 Game Overview

1. **Configure Your Agent**: Set risk level, trade frequency, and asset focus
2. **Enter Arena**: Pay 0.001 ETH entry fee to join a battle
3. **Battle**: Your AI agent trades automatically for 30 minutes
4. **Win**: Highest P&L wins the prize pool!

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi v2 + RainbowKit
- **Blockchain**: Base Sepolia (testnet)

### Backend
- **Runtime**: Node.js + Express
- **Real-time**: WebSocket (ws)
- **Blockchain**: Ethers.js v6
- **Market Data**: CoinGecko API

### Smart Contract
- **Language**: Solidity 0.8.24
- **Network**: Base Sepolia
- **Framework**: OpenZeppelin Contracts v5

---

## 📁 Project Structure

```
fight-club/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # Wagmi/RainbowKit providers
├── components/            # React components
│   ├── BotConfig.tsx       # Agent configuration UI
│   ├── BattleArena.tsx    # Battle display
│   ├── LiveLeaderboard.tsx # Real-time leaderboard
│   └── LobbyList.tsx       # Active battles list
├── lib/                   # Frontend utilities
│   ├── engine.ts          # Battle simulation logic
│   └── wagmi.ts           # Wagmi configuration
├── server/                # Backend server
│   ├── src/
│   │   ├── server.ts      # Express + WebSocket server
│   │   ├── agents/        # Trading agent logic
│   │   ├── battles/       # Battle management
│   │   ├── blockchain/    # Contract interactions
│   │   └── market/        # Price feeds
│   └── package.json       # Backend dependencies
├── contracts/            # Smart contracts
│   └── FightClubV2.sol   # Main contract
└── package.json          # Frontend dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (or use pnpm)
- MetaMask wallet
- Base Sepolia testnet ETH

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd fight-club
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
# or
pnpm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

**Frontend** (create `.env.local` in root):
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...YOUR_CONTRACT_ADDRESS...
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Backend** (create `server/.env`):
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x...YOUR_CONTRACT_ADDRESS...
ORACLE_PRIVATE_KEY=0x...YOUR_ORACLE_PRIVATE_KEY...
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
```

### 4. Deploy Smart Contract

**Option A: Remix IDE** (Recommended)
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Deploy `contracts/FightClubV2.sol` to Base Sepolia
3. Copy the deployed address to your `.env` files

**Option B: Hardhat** (if available)
```bash
cd server
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Open Application

Visit [http://localhost:3000](http://localhost:3000)

---

## 🎯 Features

### ✅ Implemented

- [x] Agent configuration (risk, frequency, asset focus)
- [x] Smart contract integration (enterArena, startBattle, finalizeBattle)
- [x] Real-time leaderboard via WebSocket
- [x] Battle simulation with AI trading agents
- [x] Market data feeds (CoinGecko API)
- [x] Responsive cyberpunk UI
- [x] Wallet connection (RainbowKit)

### 🚧 Planned

- [ ] Multi-battle support
- [ ] Historical battle replays
- [ ] Agent strategy presets
- [ ] Tournament mode
- [ ] NFT rewards for winners
- [ ] Mobile app

---

## 🧪 Testing

### Local Testing

1. **Start Backend**: `cd server && npm run dev`
2. **Start Frontend**: `npm run dev`
3. **Connect Wallet**: MetaMask → Base Sepolia
4. **Join Battle**: Configure agent → Deploy → Wait for battle start
5. **Watch Leaderboard**: Real-time updates every 30 seconds

### Manual Battle Start (Testing)

```bash
curl -X POST http://localhost:3001/api/battle/1/start
```

This starts battle #1 manually (useful for testing with < 100 players).

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Summary:**
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Contract**: Deploy via Remix or Hardhat

---

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Backend:**
```bash
cd server
npm run dev      # Start with hot reload (tsx watch)
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Code Structure

- **Frontend**: React components with Wagmi hooks for blockchain interactions
- **Backend**: Express REST API + WebSocket for real-time updates
- **Smart Contract**: Solidity contract with events for battle lifecycle

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to backend"**
- Check `NEXT_PUBLIC_BACKEND_URL` is correct
- Ensure backend is running on port 3001
- Check CORS settings in `server/src/server.ts`

**"WebSocket connection failed"**
- Verify backend WebSocket server is running
- Check `FRONTEND_ORIGIN` in backend `.env`
- Ensure Railway/Vercel URLs are correct in production

**"Transaction failed"**
- Verify contract address is correct
- Check you have Base Sepolia ETH
- Ensure MetaMask is on Base Sepolia network

**"TypeScript errors"**
- Run `npm install` in both root and `server/`
- Check that all `.js` extensions are used in imports
- Verify `tsconfig.json` settings

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Discord**: [Join our Discord](https://discord.gg/...) (if available)
- **Twitter**: [@FightClubDeFi](https://twitter.com/...) (if available)

---

## 🙏 Acknowledgments

- Built on [Base](https://base.org) blockchain
- UI inspired by cyberpunk aesthetics
- Powered by [Wagmi](https://wagmi.sh) and [RainbowKit](https://rainbowkit.com)

---

**⚠️ Disclaimer**: This is a testnet application for educational purposes. Do not use real funds on mainnet without proper auditing.
