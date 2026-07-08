import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './utils/RoomManager.js';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();

// We need to set a callback so RoomManager can trigger broadcasts for async bot moves
roomManager.setBroadcastCallback((roomId) => {
  broadcastRoomState(roomId);
});

// Helper to sanitize state based on who is requesting it
function sanitizeStateForPlayer(room, playerId) {
  const player = room.players[playerId];
  if (!player) return null;

  const isGameOver = room.status === 'game_over';
  const isSpectator = !player.isAlive;
  const isPrivileged = player.role === 'murderer' || player.role === 'accomplice' || player.role === 'forensic';

  if (player.isDevMode) {
    // Return full unsanitized room for Devs
    return {
      ...room,
      players: room.players,
      crimeEvidence: room.crimeEvidence
    };
  }

  // If game is over, or player is a spectator, or player is privileged (Murderer, Accomplice, Forensic),
  // they can see the secret crime evidence. Otherwise, hide it.
  const crimeEvidence = (isGameOver || isSpectator || isPrivileged) 
    ? room.crimeEvidence 
    : { clueCardId: null, meansCardId: null };

  // Sanitize player roles
  const sanitizedPlayers = {};
  Object.keys(room.players).forEach(pId => {
    const p = room.players[pId];
    
    let visibleRole = null;
    
    // You can always see your own role
    if (pId === playerId) {
      visibleRole = p.role;
    }
    // Forensic Scientist is always public
    else if (p.role === 'forensic') {
      visibleRole = 'forensic';
    }
    // If game is over, or player is a spectator, they see all roles (Omniscient View)
    else if (isGameOver || isSpectator) {
      visibleRole = p.role;
    }
    // Privileged roles see each other
    else if (isPrivileged) {
      visibleRole = p.role;
    }
    // Otherwise, role is hidden
    else {
      visibleRole = null;
    }

    sanitizedPlayers[pId] = {
      ...p,
      role: visibleRole
    };
  });

  return {
    ...room,
    players: sanitizedPlayers,
    crimeEvidence
  };
}

// Broadcast updated state individually to each player in the room
function broadcastRoomState(roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const playerIds = Object.keys(room.players);
  playerIds.forEach(pId => {
    const player = room.players[pId];
    if (player && player.socketId) {
      const sanitized = sanitizeStateForPlayer(room, pId);
      io.to(player.socketId).emit('room_state_update', sanitized);
    }
  });
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join Room
  socket.on('join_room', ({ roomId, playerName, playerId }) => {
    const id = roomId.toUpperCase();
    let room = roomManager.getRoom(id);

    const effectivePlayerId = playerId || socket.id;

    if (!room) {
      room = roomManager.createRoom(id, effectivePlayerId, playerName, socket.id);
    } else {
      const result = roomManager.joinRoom(id, effectivePlayerId, playerName, socket.id);
      if (result && result.error) {
        socket.emit('error_message', result.error);
        return;
      }
      room = result;
    }

    socket.join(id);
    broadcastRoomState(id);
  });

  // Add Mock Players (Simulation Mode)
  socket.on('add_mock_players', ({ roomId }) => {
    const room = roomManager.addMockPlayers(roomId);
    if (room) {
      broadcastRoomState(roomId);
    }
  });


  // Set Role Mode
  socket.on('set_role_mode', ({ roomId, mode }) => {
    const room = roomManager.setRoleMode(roomId, mode);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Assign Manual Role
  socket.on('assign_manual_role', ({ roomId, playerId, role }) => {
    const room = roomManager.assignManualRole(roomId, playerId, role);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Toggle Dev Mode
  socket.on('toggle_dev_mode', ({ roomId, isDevMode }) => {
    const room = roomManager.toggleDevMode(roomId, socket.id, isDevMode);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Start Game (moves to reveal_cards)
  socket.on('start_game', ({ roomId }) => {
    const result = roomManager.startGame(roomId);
    if (result && result.error) {
      socket.emit('error_message', result.error);
      return;
    }
    broadcastRoomState(roomId);
  });

  // Host triggers night phase from reveal_cards
  socket.on('start_night', ({ roomId }) => {
    const result = roomManager.startNight(roomId);
    if (result && result.error) {
      socket.emit('error_message', result.error);
      return;
    }
    broadcastRoomState(roomId);
  });

  // Forensic Scientist finishes placing clues → start investigation
  socket.on('start_forensic_phase', ({ roomId }) => {
    const room = roomManager.startForensicPhase(roomId);
    if (room) broadcastRoomState(roomId);
  });

  // Murderer selects evidence
  socket.on('murderer_select_evidence', ({ roomId, clueCardId, meansCardId }) => {
    const result = roomManager.submitEvidence(roomId, socket.id, clueCardId, meansCardId);
    if (result && result.error) {
      socket.emit('error_message', result.error);
      return;
    }
    broadcastRoomState(roomId);
  });

  // Forensic Scientist places marker
  socket.on('place_marker', ({ roomId, tileId, optionIndex }) => {
    const room = roomManager.placeMarker(roomId, tileId, optionIndex);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Forensic Scientist replaces tile (Rounds 2 & 3)
  socket.on('replace_tile', ({ roomId, oldTileId }) => {
    const room = roomManager.replaceTile(roomId, oldTileId);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Submit Accusation
  socket.on('submit_accusation', ({ roomId, targetId, clueCardId, meansCardId }) => {
    const result = roomManager.submitAccusation(roomId, socket.id, targetId, clueCardId, meansCardId);
    if (result && result.error) {
      socket.emit('error_message', result.error);
      return;
    }
    broadcastRoomState(roomId);
  });

  // Next Round
  socket.on('next_round', ({ roomId }) => {
    const room = roomManager.nextRound(roomId);
    if (room) {
      broadcastRoomState(roomId);
    }
  });

  // Reset to Lobby
  socket.on('reset_to_lobby', ({ roomId }) => {
    const room = roomManager.resetToLobby(roomId);
    if (room) {
      broadcastRoomState(roomId);
    }
  });


  // Send Chat Message
  socket.on('send_chat_message', ({ roomId, message }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const player = Object.values(room.players).find(p => p.socketId === socket.id);
    // Forensic Scientist and dead players (spectators) cannot chat
    if (!player || !player.isAlive || player.role === 'forensic') {
      return;
    }

    const chatData = {
      senderId: player.id,
      senderName: player.name,
      message,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false })
    };

    io.to(roomId).emit('chat_message', chatData);
  });

  // Disconnect & Leave
  socket.on('leave_room', ({ roomId }) => {
    if (roomId) {
      socket.leave(roomId);
      const room = roomManager.forceLeaveRoom(roomId, socket.id);
      if (room) {
        broadcastRoomState(roomId);
      }
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const room = roomManager.leaveRoom(roomId, socket.id);
        if (room) {
          broadcastRoomState(roomId);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
