// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FightClubV2 is Ownable, ReentrancyGuard {
    uint256 public constant ENTRY_FEE = 0.001 ether;
    uint256 public constant MAX_PLAYERS = 100;
    uint256 public constant BATTLE_DURATION = 30 minutes; // Short for testing
    
    struct BotConfig {
        uint8 riskLevel;      // 1-100
        uint8 tradeFrequency; // 1-100
        uint8 assetFocus;     // 0=BlueChip, 1=Layer2, 2=Memecoin
    }
    
    struct Battle {
        uint256 battleId;
        address[] players;
        mapping(address => BotConfig) configs;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        address winner;
        int256 winningPnL; // in basis points (e.g., 1050 = 10.5%)
        bool isActive;
        bool isFinalized;
    }
    
    mapping(uint256 => Battle) public battles;
    uint256 public currentBattleId;
    address public oracleAddress; // Backend server address
    
    event PlayerJoined(uint256 indexed battleId, address indexed player, BotConfig config);
    event BattleStarted(uint256 indexed battleId, uint256 startTime, uint256 playerCount);
    event BattleFinalized(uint256 indexed battleId, address indexed winner, int256 pnl, uint256 prize);
    
    constructor() Ownable(msg.sender) {
        battles[0].battleId = 0;
        battles[0].isActive = true;
    }
    
    function setOracle(address _oracle) external onlyOwner {
        oracleAddress = _oracle;
    }
    
    function enterArena(
        uint8 riskLevel,
        uint8 tradeFrequency,
        uint8 assetFocus
    ) external payable nonReentrant {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(riskLevel > 0 && riskLevel <= 100, "Invalid risk level");
        require(tradeFrequency > 0 && tradeFrequency <= 100, "Invalid trade frequency");
        require(assetFocus <= 2, "Invalid asset focus");
        
        Battle storage battle = battles[currentBattleId];
        require(battle.isActive, "Battle not active");
        require(battle.players.length < MAX_PLAYERS, "Battle full");
        require(battle.startTime == 0, "Battle already started");
        
        // Check if player already joined
        for (uint i = 0; i < battle.players.length; i++) {
            require(battle.players[i] != msg.sender, "Already joined");
        }
        
        battle.players.push(msg.sender);
        battle.configs[msg.sender] = BotConfig(riskLevel, tradeFrequency, assetFocus);
        battle.prizePool += msg.value;
        
        emit PlayerJoined(currentBattleId, msg.sender, BotConfig(riskLevel, tradeFrequency, assetFocus));
        
        // Auto-start when full (or manually start with startBattle())
        if (battle.players.length == MAX_PLAYERS) {
            _startBattle(currentBattleId);
        }
    }
    
    // Manual start (for testing with < 100 players)
    function startBattle(uint256 battleId) external {
        require(msg.sender == owner() || msg.sender == oracleAddress, "Unauthorized");
        _startBattle(battleId);
    }
    
    function _startBattle(uint256 battleId) internal {
        Battle storage battle = battles[battleId];
        require(battle.players.length >= 2, "Need at least 2 players"); // Min 2 for testing
        require(battle.startTime == 0, "Already started");
        
        battle.startTime = block.timestamp;
        battle.endTime = block.timestamp + BATTLE_DURATION;
        
        emit BattleStarted(battleId, battle.startTime, battle.players.length);
    }
    
    function finalizeBattle(
        uint256 battleId,
        address winner,
        int256 winningPnL
    ) external nonReentrant {
        require(msg.sender == oracleAddress, "Only oracle can finalize");
        Battle storage battle = battles[battleId];
        require(battle.startTime > 0, "Battle not started");
        require(block.timestamp >= battle.endTime, "Battle not ended");
        require(!battle.isFinalized, "Already finalized");
        require(_isPlayerInBattle(battleId, winner), "Winner not in battle");
        
        battle.winner = winner;
        battle.winningPnL = winningPnL;
        battle.isFinalized = true;
        battle.isActive = false;
        
        // Calculate payouts
        uint256 platformFee = battle.prizePool * 5 / 100; // 5% fee
        uint256 winnerPrize = battle.prizePool - platformFee;
        
        // Transfer prizes
        payable(winner).transfer(winnerPrize);
        payable(owner()).transfer(platformFee);
        
        emit BattleFinalized(battleId, winner, winningPnL, winnerPrize);
        
        // Create new battle
        currentBattleId++;
        battles[currentBattleId].battleId = currentBattleId;
        battles[currentBattleId].isActive = true;
    }
    
    function _isPlayerInBattle(uint256 battleId, address player) internal view returns (bool) {
        Battle storage battle = battles[battleId];
        for (uint i = 0; i < battle.players.length; i++) {
            if (battle.players[i] == player) return true;
        }
        return false;
    }
    
    // View functions
    function getBattleInfo(uint256 battleId) external view returns (
        uint256 playerCount,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool isFinalized,
        address winner
    ) {
        Battle storage battle = battles[battleId];
        return (
            battle.players.length,
            battle.prizePool,
            battle.startTime,
            battle.endTime,
            battle.isActive,
            battle.isFinalized,
            battle.winner
        );
    }
    
    function getPlayerConfig(uint256 battleId, address player) external view returns (BotConfig memory) {
        return battles[battleId].configs[player];
    }
    
    function getBattlePlayers(uint256 battleId) external view returns (address[] memory) {
        return battles[battleId].players;
    }
}