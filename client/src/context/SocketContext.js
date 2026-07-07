"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      autoConnect: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to game server:', newSocket.id);
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
      // Clear error after 4 seconds
      setTimeout(() => setError(null), 4000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = (playerName) => {
    if (!socket) return;
    // Generate a random 4 letter code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setChatMessages([]);
    socket.emit('join_room', { roomId: code, playerName });
  };

  const joinRoom = (roomId, playerName) => {
    if (!socket) return;
    setChatMessages([]);
    socket.emit('join_room', { roomId: roomId.toUpperCase(), playerName });
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
