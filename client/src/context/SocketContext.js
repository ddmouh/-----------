"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://1-3fr2.onrender.com';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    let pid = sessionStorage.getItem('deception_player_id');
    if (!pid) {
      pid = 'p_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('deception_player_id', pid);
    }
    setPlayerId(pid);

    const newSocket = io(SOCKET_URL, {
      autoConnect: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to game server:', newSocket.id);
      
      // Auto-rejoin if saved room and name exist
      const savedRoomId = sessionStorage.getItem('deception_room_id');
      const savedPlayerName = sessionStorage.getItem('deception_player_name');
      if (savedRoomId && savedPlayerName) {
        console.log(`Auto-rejoining room: ${savedRoomId} as ${savedPlayerName} with ID: ${pid}`);
        newSocket.emit('join_room', { roomId: savedRoomId, playerName: savedPlayerName, playerId: pid });
      }
    });

    newSocket.on('room_state_update', (newState) => {
      setGameState(newState);
      setError(null);
    });

    newSocket.on('chat_message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    newSocket.on('error_message', (err) => {
      setError(err);
      if (err === 'Room not found' || err === 'Game already in progress') {
        sessionStorage.removeItem('deception_room_id');
      }
      // Clear error after 4 seconds
      setTimeout(() => setError(null), 4000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = (playerName) => {
    if (!socket) return;
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setChatMessages([]);
    const pid = sessionStorage.getItem('deception_player_id') || playerId;
    sessionStorage.setItem('deception_room_id', code);
    sessionStorage.setItem('deception_player_name', playerName);
    socket.emit('join_room', { roomId: code, playerName, playerId: pid });
  };

  const joinRoom = (roomId, playerName) => {
    if (!socket) return;
    setChatMessages([]);
    const code = roomId.toUpperCase();
    const pid = sessionStorage.getItem('deception_player_id') || playerId;
    sessionStorage.setItem('deception_room_id', code);
    sessionStorage.setItem('deception_player_name', playerName);
    socket.emit('join_room', { roomId: code, playerName, playerId: pid });
  };

  const addMockPlayers = () => {
    if (!socket || !gameState) return;
    socket.emit('add_mock_players', { roomId: gameState.roomId });
  };

  const leaveRoom = () => {
    if (!socket || !gameState) return;
    socket.emit('leave_room', { roomId: gameState.roomId });
    setGameState(null);
    setChatMessages([]);
    sessionStorage.removeItem('deception_room_id');
  };


  const setRoleMode = (mode) => {
    if (!socket || !gameState) return;
    socket.emit('set_role_mode', { roomId: gameState.roomId, mode });
  };

  const assignManualRole = (playerId, role) => {
    if (!socket || !gameState) return;
    socket.emit('assign_manual_role', { roomId: gameState.roomId, playerId, role });
  };

  const toggleDevMode = (isDevMode) => {
    if (!socket || !gameState) return;
    socket.emit('toggle_dev_mode', { roomId: gameState.roomId, isDevMode });
  };

  const startGame = () => {
    if (!socket || !gameState) return;
    socket.emit('start_game', { roomId: gameState.roomId });
  };

  const startNight = () => {
    if (!socket || !gameState) return;
    socket.emit('start_night', { roomId: gameState.roomId });
  };

  const startForensicPhase = () => {
    if (!socket || !gameState) return;
    socket.emit('start_forensic_phase', { roomId: gameState.roomId });
  };

  const submitEvidence = (clueCardId, meansCardId) => {
    if (!socket || !gameState) return;
    socket.emit('murderer_select_evidence', { roomId: gameState.roomId, clueCardId, meansCardId });
  };

  const placeMarker = (tileId, optionIndex) => {
    if (!socket || !gameState) return;
    socket.emit('place_marker', { roomId: gameState.roomId, tileId, optionIndex });
  };

  const replaceTile = (oldTileId) => {
    if (!socket || !gameState) return;
    socket.emit('replace_tile', { roomId: gameState.roomId, oldTileId });
  };

  const submitAccusation = (targetId, clueCardId, meansCardId) => {
    if (!socket || !gameState) return;
    socket.emit('submit_accusation', { roomId: gameState.roomId, targetId, clueCardId, meansCardId });
  };

  const nextRound = () => {
    if (!socket || !gameState) return;
    socket.emit('next_round', { roomId: gameState.roomId });
  };

  const resetToLobby = () => {
    if (!socket || !gameState) return;
    socket.emit('reset_to_lobby', { roomId: gameState.roomId });
  };

  const sendMessage = (message) => {
    if (!socket || !gameState) return;
    socket.emit('send_chat_message', { roomId: gameState.roomId, message });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameState,
        chatMessages,
        error,
        playerId,
        createRoom,
        joinRoom,
        addMockPlayers,
        leaveRoom,
        setRoleMode,
        assignManualRole,
        toggleDevMode,
        startGame,
        startNight,
        startForensicPhase,
        submitEvidence,
        placeMarker,
        replaceTile,
        submitAccusation,
        nextRound,
        resetToLobby,
        sendMessage
      }}
    >
      {children}
    </SocketContext.Provider>
  );

};

export const useGame = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useGame must be used within a SocketProvider');
  }
  return context;
};
