import { CLUE_CARDS, MEANS_CARDS, LOCATION_TILE, CAUSE_TILE, ENVIRONMENT_TILES } from './decks.js';

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.broadcastCallback = null;
  }

  setBroadcastCallback(callback) {
    this.broadcastCallback = callback;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  createRoom(roomId, hostId, hostName, socketId) {
    const room = {
      roomId,
      status: 'lobby',
      roleMode: 'practical', // 'automated', 'practical', 'manual'
      players: {
        [hostId]: {
          id: hostId,
          socketId: socketId,
          name: hostName,
          role: null,
          isHost: true,
          isAlive: true,
          hasAccused: false,
          isDevMode: false,
          clueCards: [],
          meansCards: []
        }
      },
      crimeEvidence: {
        clueCardId: null,
        meansCardId: null
      },
      tiles: [],
      round: 1,
      winner: null,
      logs: []
    };
    this.rooms.set(roomId, room);
    this.logAction(roomId, `Room created by ${hostName}`);
    return room;
  }

  joinRoom(roomId, playerId, playerName, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Allow rejoining an in-progress game
    if (room.players[playerId]) {
      room.players[playerId].socketId = socketId;
      this.logAction(roomId, `${playerName} reconnected`);
      return room;
    }

    if (room.status !== 'lobby') {
      return { error: 'Game already in progress' };
    }

    room.players[playerId] = {
      id: playerId,
      socketId: socketId,
      name: playerName,
      role: null,
      isHost: false,
      isAlive: true,
      hasAccused: false,
      isDevMode: false,
      clueCards: [],
      meansCards: []
    };

    this.logAction(roomId, `${playerName} joined the room`);
    return room;
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerId = Object.keys(room.players).find(pId => room.players[pId].socketId === socketId);
    if (!playerId) return room;

    const player = room.players[playerId];
    const playerName = player.name;

    if (room.status === 'lobby') {
      delete room.players[playerId];
      this.logAction(roomId, `${playerName} left the room`);
    } else {
      player.socketId = null;
      this.logAction(roomId, `${playerName} disconnected`);
    }

    // If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // If host left/disconnected, assign new host
    if (player.isHost) {
      player.isHost = false;
      const connectedHuman = Object.values(room.players).find(p => p.socketId && !p.id.startsWith('mock_bot_'));
      if (connectedHuman) {
        connectedHuman.isHost = true;
        this.logAction(roomId, `${connectedHuman.name} is now the Host`);
      } else {
        const firstPlayer = Object.values(room.players)[0];
        if (firstPlayer) {
          firstPlayer.isHost = true;
          this.logAction(roomId, `${firstPlayer.name} is now the Host`);
        }
      }
    }

    return room;
  }

  forceLeaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerId = Object.keys(room.players).find(pId => room.players[pId].socketId === socketId);
    if (!playerId) return room;

    const playerName = room.players[playerId].name;
    delete room.players[playerId];
    this.logAction(roomId, `${playerName} left the room`);

    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    if (room.players && !Object.values(room.players).some(p => p.isHost)) {
      const firstPlayerId = Object.keys(room.players)[0];
      if (firstPlayerId) {
        room.players[firstPlayerId].isHost = true;
        this.logAction(roomId, `${room.players[firstPlayerId].name} is now the Host`);
      }
    }

    return room;
  }

  setRoleMode(roomId, mode) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.roleMode = mode;
    this.logAction(roomId, `Role mode set to ${mode}`);
    return room;
  }

  assignManualRole(roomId, playerId, role) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players[playerId]) {
      room.players[playerId].role = role;
    }
    return room;
  }

  toggleDevMode(roomId, playerId, isDevMode) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const player = room.players[playerId] || Object.values(room.players).find(p => p.socketId === playerId);
    if (player) {
      player.isDevMode = isDevMode;
      this.logAction(roomId, `${player.name} toggled Dev Mode ${isDevMode ? 'ON' : 'OFF'}`);
    }
    return room;
  }

  logAction(roomId, message) {
    const room = this.rooms.get(roomId);
    if (room) {
      const timestamp = new Date().toLocaleTimeString('ar-EG', { hour12: false });
      room.logs.push(`[${timestamp}] ${message}`);
    }
  }

  addMockPlayers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const mockNames = ['خالد (بوت)', 'سارة (بوت)', 'محمد (بوت)'];
    mockNames.forEach((name, idx) => {
      const mockId = `mock_bot_${idx}_${Math.random().toString(36).substring(2, 5)}`;
      room.players[mockId] = {
        id: mockId,
        name: name,
        role: null,
        isHost: false,
        isAlive: true,
        hasAccused: false,
        isDevMode: false,
        clueCards: [],
        meansCards: []
      };
      this.logAction(roomId, `${name} joined the room (Simulation)`);
    });

    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIds = Object.keys(room.players);
    const playerCount = playerIds.length;

    if (playerCount < 4) {
      return { error: 'Need at least 4 players to start' };
    }

    // 1. Assign Roles
    if (room.roleMode === 'manual') {
      // Validate manual assignment
      const rolesAssigned = Object.values(room.players).map(p => p.role);
      const forensicCount = rolesAssigned.filter(r => r === 'forensic').length;
      const murdererCount = rolesAssigned.filter(r => r === 'murderer').length;
      
      if (forensicCount !== 1) {
        return { error: 'Must assign exactly 1 Forensic Scientist (عالم جنايات)' };
      }
      if (murdererCount !== 1) {
        return { error: 'Must assign exactly 1 Murderer (المخادع)' };
      }
      
      // Fill unassigned as investigators
      for (const pId of playerIds) {
        if (!room.players[pId].role) {
          room.players[pId].role = 'investigator';
        }
      }
    } else {
      // Practical or Automated modes
      const roles = ['forensic', 'murderer'];
      
      if (room.roleMode === 'practical') {
        if (playerCount >= 6) {
          roles.push('accomplice');
        }
      } else {
        if (playerCount >= 5 && Math.random() > 0.3) {
          roles.push('accomplice');
        }
      }

      while (roles.length < playerCount) {
        roles.push('investigator');
      }

      // Shuffle and assign
      const shuffledRoles = shuffle(roles);
      playerIds.forEach((pId, index) => {
        room.players[pId].role = shuffledRoles[index];
      });
    }

    // 2. Distribute Cards (5 Clue Red, 5 Means Blue per player)
    const shuffledClues = shuffle(CLUE_CARDS);
    const shuffledMeans = shuffle(MEANS_CARDS);

    let clueIndex = 0;
    let meansIndex = 0;

    playerIds.forEach(pId => {
      room.players[pId].clueCards = shuffledClues.slice(clueIndex, clueIndex + 5);
      room.players[pId].meansCards = shuffledMeans.slice(meansIndex, meansIndex + 5);
      clueIndex += 5;
      meansIndex += 5;
      
      // Reset player live status
      room.players[pId].isAlive = true;
      room.players[pId].hasAccused = false;
    });

    // Reset game parameters
    room.status = 'reveal_cards';
    room.crimeEvidence = { clueCardId: null, meansCardId: null };
    room.tiles = [];
    room.round = 1;
    room.winner = null;
    room.tileReplacementsLeft = 2;

    this.logAction(roomId, 'Game started. All players see their cards!');

    // BOT AUTO-SELECTION FOR MURDERER
    // If the assigned murderer is a bot, let them select evidence immediately
    const murdererPlayer = Object.values(room.players).find(p => p.role === 'murderer');
    if (murdererPlayer && murdererPlayer.id.startsWith('mock_bot_')) {
      const randomClue = murdererPlayer.clueCards[Math.floor(Math.random() * 5)].id;
      const randomMeans = murdererPlayer.meansCards[Math.floor(Math.random() * 5)].id;
      
      // Run in a small timeout on the server to simulate thinking
      setTimeout(() => {
        this.submitEvidence(roomId, murdererPlayer.id, randomClue, randomMeans);
        if (this.broadcastCallback) this.broadcastCallback(roomId);
      }, 1500);
    }

    return room;
  }

  startNight(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.status !== 'reveal_cards') return { error: 'Cannot start night now' };

    room.status = 'night_selection';
    this.logAction(roomId, 'Night has begun. Investigators, close your eyes...');

    // BOT AUTO-SELECTION FOR MURDERER
    const murdererPlayer = Object.values(room.players).find(p => p.role === 'murderer');
    if (murdererPlayer && murdererPlayer.id.startsWith('mock_bot_')) {
      const randomClue = murdererPlayer.clueCards[Math.floor(Math.random() * 5)].id;
      const randomMeans = murdererPlayer.meansCards[Math.floor(Math.random() * 5)].id;
      setTimeout(() => { 
        this.submitEvidence(roomId, murdererPlayer.id, randomClue, randomMeans); 
        if (this.broadcastCallback) this.broadcastCallback(roomId);
      }, 1500);
    }

    return room;
  }

  submitEvidence(roomId, playerId, clueCardId, meansCardId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players[playerId] || Object.values(room.players).find(p => p.socketId === playerId);
    if (!player || player.role !== 'murderer') {
      return { error: 'Only the Murderer can choose the crime evidence' };
    }

    room.crimeEvidence.clueCardId = clueCardId;
    room.crimeEvidence.meansCardId = meansCardId;

    // Transition to forensic placement phase
    room.status = 'forensic_selection';

    // Generate Scene Tiles
    const shuffledEnv = shuffle(ENVIRONMENT_TILES);
    room.tiles = [
      JSON.parse(JSON.stringify(LOCATION_TILE)),
      JSON.parse(JSON.stringify(CAUSE_TILE)),
      ...JSON.parse(JSON.stringify(shuffledEnv.slice(0, 4)))
    ];

    this.logAction(roomId, `Crime committed! Forensic Scientist now places clues on scene tiles.`);

    // BOT AUTO-SELECTION FOR FORENSIC SCIENTIST
    const forensicPlayer = Object.values(room.players).find(p => p.role === 'forensic');
    if (forensicPlayer && forensicPlayer.id.startsWith('mock_bot_')) {
      setTimeout(() => {
        room.tiles.forEach(tile => {
          tile.selectedOptionIndex = Math.floor(Math.random() * tile.options.length);
        });
        room.status = 'investigation';
        this.logAction(roomId, `Forensic Scientist (Bot) placed clues. Investigation begins!`);
        if (this.broadcastCallback) this.broadcastCallback(roomId);
      }, 2000);
    }

    return room;
  }

  startForensicPhase(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    // forensic scientist manually confirms placement is done → start investigation
    if (room.status === 'forensic_selection') {
      room.status = 'investigation';
      this.logAction(roomId, 'Forensic clues placed. Investigation Phase begins!');
    }
    return room;
  }

  placeMarker(roomId, tileId, optionIndex) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const tile = room.tiles.find(t => t.id === tileId);
    if (tile) {
      tile.selectedOptionIndex = optionIndex;
      this.logAction(roomId, `Forensic Scientist marked option on "${tile.title}"`);
    }

    return room;
  }

  replaceTile(roomId, oldTileId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.tileReplacementsLeft === undefined) {
      room.tileReplacementsLeft = 2;
    }
    if (room.tileReplacementsLeft <= 0) {
      return room;
    }

    // Find a tile that is not currently on the board
    const activeTileIds = room.tiles.map(t => t.id);
    const availableEnvTiles = ENVIRONMENT_TILES.filter(t => !activeTileIds.includes(t.id));

    if (availableEnvTiles.length === 0) return room;

    const newTile = JSON.parse(JSON.stringify(shuffle(availableEnvTiles)[0]));
    const index = room.tiles.findIndex(t => t.id === oldTileId);
    
    if (index !== -1 && oldTileId !== 't_loc' && oldTileId !== 't_cause') {
      room.tiles[index] = newTile;
      room.tileReplacementsLeft -= 1;
      this.logAction(roomId, `Forensic Scientist replaced tile with "${newTile.title}" (Replacements left: ${room.tileReplacementsLeft})`);
    }

    return room;
  }

  submitAccusation(roomId, accuserId, targetId, clueCardId, meansCardId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const accuser = room.players[accuserId] || Object.values(room.players).find(p => p.socketId === accuserId);
    if (!accuser || !accuser.isAlive || accuser.hasAccused) {
      return { error: 'You cannot make an accusation' };
    }

    accuser.hasAccused = true;
    const isCorrect = 
      room.players[targetId]?.role === 'murderer' &&
      room.crimeEvidence.clueCardId === clueCardId &&
      room.crimeEvidence.meansCardId === meansCardId;

    if (isCorrect) {
      room.status = 'game_over';
      room.winner = 'investigators';
      this.logAction(roomId, `🎉 Correct! ${accuser.name} successfully accused the Murderer (${room.players[targetId].name})! Investigators win!`);
    } else {
      // Eliminate accuser, turn into spectator
      accuser.isAlive = false;
      const targetName = room.players[targetId]?.name || 'Unknown';
      this.logAction(roomId, `❌ Incorrect! ${accuser.name} accused ${targetName} but failed. ${accuser.name} is now a Spectator.`);
      
      // Check if all investigators have accused
      this.checkWinConditions(roomId);
    }

    return room;
  }

  checkWinConditions(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Find all players who are investigators (should exclude Forensic, Murderer, Accomplice)
    const activeInvestigators = Object.values(room.players).filter(
      p => p.role === 'investigator' && p.isAlive
    );

    // If no active investigators are left to make accusations, Murderer wins
    if (activeInvestigators.length === 0) {
      room.status = 'game_over';
      room.winner = 'murderer';
      this.logAction(roomId, `💀 All investigators have failed their accusations or are eliminated. The Murderer wins!`);
    }
  }

  nextRound(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // If we're still in forensic_selection phase, advance to investigation
    if (room.status === 'forensic_selection') {
      room.status = 'investigation';
      this.logAction(roomId, 'Forensic clues confirmed. Investigation Phase begins!');
      return room;
    }

    return room;
  }

  resetToLobby(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.status = 'lobby';
    Object.keys(room.players).forEach(pId => {
      room.players[pId].role = null;
      room.players[pId].isAlive = true;
      room.players[pId].hasAccused = false;
      room.players[pId].clueCards = [];
      room.players[pId].meansCards = [];
      // we keep isDevMode as is
    });
    room.crimeEvidence = { clueCardId: null, meansCardId: null };
    room.tiles = [];
    room.round = 1;
    room.winner = null;
    room.tileReplacementsLeft = 0;
    this.logAction(roomId, `Game reset. Returned to Lobby.`);
    return room;
  }
}

