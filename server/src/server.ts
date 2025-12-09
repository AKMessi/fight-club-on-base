import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { PriceFeeder } from './market/PriceFeeder.js';
import { ContractManager } from './blockchain/ContractManager.js';
import { BattleManager } from './battles/BattleManager.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize services
const priceFeeder = new PriceFeeder();
const contractManager = new ContractManager();
const activeBattles = new Map<number, BattleManager>();

// REST API Routes

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/battle/current', async (req, res) => {
  try {
    const battleId = await contractManager.getCurrentBattleId();
    const info = await contractManager.getBattleInfo(battleId);
    const players = await contractManager.getBattlePlayers(battleId);

    res.json({
      battleId,
      ...info,
      players,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battle info' });
  }
});

app.get('/api/battle/:id', async (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const info = await contractManager.getBattleInfo(battleId);
    const players = await contractManager.getBattlePlayers(battleId);

    res.json({
      battleId,
      ...info,
      players,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battle info' });
  }
});

app.get('/api/battle/:id/leaderboard', async (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const battle = activeBattles.get(battleId);

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found or not active' });
    }

    const marketData = await priceFeeder.getCurrentPrices();
    const leaderboard = battle.getPlayers().map(p => ({
      address: p.address,
      config: p.config,
      pnl: p.agent.calculatePnL(marketData),
      positions: p.agent.positions,
      tradeCount: p.agent.tradeHistory.length,
    }));

    leaderboard.sort((a, b) => b.pnl - a.pnl);

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/prices', async (req, res) => {
  try {
    const prices = await priceFeeder.getCurrentPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Manual battle start (for testing)
app.post('/api/battle/:id/start', async (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    
    // Start on-chain
    await contractManager.startBattle(battleId);

    // Start off-chain simulation
    const players = await contractManager.getBattlePlayers(battleId);
    const battle = new BattleManager(battleId, priceFeeder, contractManager);

    for (const playerAddress of players) {
      const config = await contractManager.getPlayerConfig(battleId, playerAddress);
      battle.addPlayer(playerAddress, config);
    }

    activeBattles.set(battleId, battle);

    // Start 30-minute battle
    battle.start(30);

    res.json({ success: true, battleId, playerCount: players.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Server for real-time updates
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Fight Club Server running on port ${PORT}\n`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('👤 New WebSocket connection');

  ws.on('message', (message) => {
    console.log('📨 Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('👋 WebSocket disconnected');
  });
});

// Broadcast leaderboard updates every 30 seconds
setInterval(async () => {
  for (const [battleId, battle] of activeBattles.entries()) {
    if (!battle.isActive()) continue;

    try {
      const marketData = await priceFeeder.getCurrentPrices();
      const leaderboard = battle.getPlayers().map(p => ({
        address: p.address,
        pnl: p.agent.calculatePnL(marketData),
      }));

      leaderboard.sort((a, b) => b.pnl - a.pnl);

      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'LEADERBOARD_UPDATE',
            battleId,
            leaderboard,
            timestamp: Date.now(),
          }));
        }
      });
    } catch (error) {
      console.error('Failed to broadcast leaderboard:', error);
    }
  }
}, 30000);

// Listen for blockchain events
contractManager.onPlayerJoined((battleId, player, config) => {
  console.log(`\n🎮 New player joined battle ${battleId}`);
  console.log(`   Address: ${player}`);
  console.log(`   Config:`, config);

  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'PLAYER_JOINED',
        battleId,
        player,
        config,
      }));
    }
  });
});

contractManager.onBattleStarted(async (battleId, startTime, playerCount) => {
  console.log(`\n⚔️ Battle ${battleId} started!`);
  console.log(`   Players: ${playerCount}`);
  console.log(`   Start: ${new Date(startTime * 1000).toLocaleString()}`);

  // Auto-start the battle simulation
  try {
    const players = await contractManager.getBattlePlayers(battleId);
    const battle = new BattleManager(battleId, priceFeeder, contractManager);

    for (const playerAddress of players) {
      const config = await contractManager.getPlayerConfig(battleId, playerAddress);
      battle.addPlayer(playerAddress, config);
    }

    activeBattles.set(battleId, battle);
    battle.start(30); // 30 minutes
  } catch (error) {
    console.error('Failed to auto-start battle:', error);
  }
});

console.log('📡 Listening for blockchain events...\n');