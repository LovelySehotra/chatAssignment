import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../utils/tokenStorage';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:1209';

export interface SocketLog {
  time: string;
  type: 'info' | 'sent' | 'received' | 'error' | 'ack';
  event: string;
  data?: any;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SocketLog[]>([]);

  const addLog = useCallback((log: Omit<SocketLog, 'time'>) => {
    setLogs(prev => [
      ...prev,
      { ...log, time: new Date().toLocaleTimeString() },
    ]);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = tokenStorage.getAccessToken();
    const socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      setSocketId(socket.id ?? null);
      addLog({ type: 'info', event: 'connect', data: { socketId: socket.id } });
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      setSocketId(null);
      addLog({ type: 'info', event: 'disconnect', data: { reason } });
    });

    socket.on('connect_error', (err) => {
      addLog({ type: 'error', event: 'connect_error', data: { message: err.message } });
    });

    // Listen for server-pushed events
    socket.on('receive_message', (data) => {
      addLog({ type: 'received', event: 'receive_message', data });
    });

    socket.on('messages_read', (data) => {
      addLog({ type: 'received', event: 'messages_read', data });
    });

    socket.on('user_online', (data) => {
      addLog({ type: 'received', event: 'user_online', data });
    });

    socket.on('user_offline', (data) => {
      addLog({ type: 'received', event: 'user_offline', data });
    });

    socketRef.current = socket;
  }, [addLog]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setSocketId(null);
    }
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('join_conversation', { conversationId });
    addLog({ type: 'sent', event: 'join_conversation', data: { conversationId } });
  }, [addLog]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('leave_conversation', { conversationId });
    addLog({ type: 'sent', event: 'leave_conversation', data: { conversationId } });
  }, [addLog]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!socketRef.current?.connected) return;
    const payload = { conversationId, content };
    socketRef.current.emit('send_message', payload, (response: any) => {
      addLog({ type: 'ack', event: 'send_message (ack)', data: response });
    });
    addLog({ type: 'sent', event: 'send_message', data: payload });
  }, [addLog]);

  const markRead = useCallback((conversationId: string, messageId: string) => {
    if (!socketRef.current?.connected) return;
    const payload = { conversationId, messageId };
    socketRef.current.emit('mark_read', payload, (response: any) => {
      addLog({ type: 'ack', event: 'mark_read (ack)', data: response });
    });
    addLog({ type: 'sent', event: 'mark_read', data: payload });
  }, [addLog]);

  const clearLogs = useCallback(() => setLogs([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    connected,
    socketId,
    logs,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markRead,
    clearLogs,
  };
}
