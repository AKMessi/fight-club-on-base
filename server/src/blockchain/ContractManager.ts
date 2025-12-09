import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "currentBattleId",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "battleId", "type": "uint256"}],
    "name": "getBattleInfo",
    "outputs": [
      {"name": "playerCount", "type": "uint256"},
      {"name": "prizePool", "type": "uint256"},
      {"name": "startTime", "type": "uint256"},
      {"name": "endTime", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "isFinalized", "type": "bool"},
      {"name": "winner", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "battleId", "type": "uint256"}],
    "name": "getBattlePlayers",
    "outputs": [{"type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "battleId", "type": "uint256"},
      {"name": "player", "type": "address"}
    ],
    "name": "getPlayerConfig",
    "outputs": [
      {"name": "riskLevel", "type": "uint8"},
      {"name": "tradeFrequency", "type": "uint8"},
      {"name": "assetFocus", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "battleId", "type": "uint256"}],
    "name": "startBattle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "battleId", "type": "uint256"},
      {"name": "winner", "type": "address"},
      {"name": "winningPnL", "type": "int256"}
    ],
    "name": "finalizeBattle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "battleId", "type": "uint256"},
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "config", "type": "tuple", "components": [
        {"name": "riskLevel", "type": "uint8"},
        {"name": "tradeFrequency", "type": "uint8"},
        {"name": "assetFocus", "type": "uint8"}
      ]}
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "battleId", "type": "uint256"},
      {"indexed": false, "name": "startTime", "type": "uint256"},
      {"indexed": false, "name": "playerCount", "type": "uint256"}
    ],
    "name": "BattleStarted",
    "type": "event"
  }
] as const;

export class ContractManager {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    const privateKey = process.env.ORACLE_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!privateKey) {
      throw new Error('ORACLE_PRIVATE_KEY or PRIVATE_KEY not set in .env');
    }

    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS not set in .env');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);

    console.log('🔗 Contract Manager initialized');
    console.log('   Contract:', contractAddress);
    console.log('   Oracle:', this.wallet.address);
  }

  async getCurrentBattleId(): Promise<number> {
    const battleId = await this.contract.currentBattleId();
    return Number(battleId);
  }

  async getBattleInfo(battleId: number) {
    const info = await this.contract.getBattleInfo(battleId);
    return {
      playerCount: Number(info[0]),
      prizePool: ethers.formatEther(info[1]),
      startTime: Number(info[2]),
      endTime: Number(info[3]),
      isActive: info[4],
      isFinalized: info[5],
      winner: info[6],
    };
  }

  async getBattlePlayers(battleId: number): Promise<string[]> {
    return await this.contract.getBattlePlayers(battleId);
  }

  async getPlayerConfig(battleId: number, playerAddress: string) {
    const config = await this.contract.getPlayerConfig(battleId, playerAddress);
    
    const assetFocusMap = ['BlueChip', 'Layer2', 'Memecoin'] as const;
    
    return {
      riskLevel: Number(config[0]),
      tradeFrequency: Number(config[1]),
      assetFocus: assetFocusMap[Number(config[2])],
    };
  }

  async startBattle(battleId: number) {
    console.log(`🎬 Starting battle ${battleId} on-chain...`);
    const tx = await this.contract.startBattle(battleId);
    await tx.wait();
    console.log('✅ Battle started on-chain');
  }

  async finalizeBattle(battleId: number, winner: string, pnlBasisPoints: number) {
    console.log(`🏁 Finalizing battle ${battleId}...`);
    console.log(`   Winner: ${winner}`);
    console.log(`   P&L: ${(pnlBasisPoints / 100).toFixed(2)}%`);

    const tx = await this.contract.finalizeBattle(battleId, winner, pnlBasisPoints);
    const receipt = await tx.wait();

    console.log('✅ Battle finalized!');
    console.log(`   TX: ${receipt.hash}`);
  }

  // Listen for new players joining
  onPlayerJoined(callback: (battleId: number, player: string, config: any) => void) {
    this.contract.on('PlayerJoined', (battleId, player, config) => {
      callback(Number(battleId), player, {
        riskLevel: Number(config.riskLevel),
        tradeFrequency: Number(config.tradeFrequency),
        assetFocus: ['BlueChip', 'Layer2', 'Memecoin'][Number(config.assetFocus)],
      });
    });
  }

  // Listen for battle starts
  onBattleStarted(callback: (battleId: number, startTime: number, playerCount: number) => void) {
    this.contract.on('BattleStarted', (battleId, startTime, playerCount) => {
      callback(Number(battleId), Number(startTime), Number(playerCount));
    });
  }
}