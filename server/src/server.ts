import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { PriceFeeder } from './market/PriceFeeder.js';
import { ContractManager } from './blockchain/ContractManager.js';
import { BattleManager } from './battles/BattleManager.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

// Initialize services
const priceFeeder = new PriceFeeder();
const contractManager = new ContractManager();
const activeBattles = new Map<number, BattleManager>();

// REST API Routes

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/battle/current', async (_req: Request, res: Response) => {
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
    console.error('Failed to fetch current battle:', error);
    res.status(500).json({ error: 'Failed to fetch battle info' });
  }
});

app.get('/api/battle/:id', async (req: Request, res: Response) => {
  try {
    const battleId = parseInt(req.params.id);
    if (isNaN(battleId)) {
      return res.status(400).json({ error: 'Invalid battle ID' });
    }

    const info = await contractManager.getBattleInfo(battleId);
    const players = await contractManager.getBattlePlayers(battleId);

    res.json({
      battleId,
      ...info,
      players,
    });
  } catch (error) {
    console.error('Failed to fetch battle:', error);
    res.status(500).json({ error: 'Failed to fetch battle info' });
  }
});

app.get('/api/battle/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const battleId = parseInt(req.params.id);
    if (isNaN(battleId)) {
      return res.status(400).json({ error: 'Invalid battle ID' });
    }

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
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/prices', async (_req: Request, res: Response) => {
  try {
    const prices = await priceFeeder.getCurrentPrices();
    res.json(prices);
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Manual battle start (for testing)
app.post('/api/battle/:id/start', async (req: Request, res: Response) => {
  try {
    const battleId = parseInt(req.params.id);
    if (isNaN(battleId)) {
      return res.status(400).json({ error: 'Invalid battle ID' });
    }
    
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
    await battle.start(30);

    res.json({ success: true, battleId, playerCount: players.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to start battle';
    console.error('Failed to start battle:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// WebSocket Server for real-time updates
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Fight Club Server running on port ${PORT}`);
  console.log(`   CORS enabled for: ${FRONTEND_ORIGIN}`);
  console.log(`   WebSocket ready for connections\n`);
});

const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

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