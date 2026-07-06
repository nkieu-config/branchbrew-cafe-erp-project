"use client";

import { createContext, use, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => use(SocketContext);

const RECONNECT_TOAST_ID = 'socket-reconnect';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { activeBranchId, isAuthenticated, isInitialized } = useAuth();
  const hadConnectionRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      setSocket(null);
      setIsConnected(false);
      hadConnectionRef.current = false;
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const socketInstance = io(backendUrl, {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true,
      auth: {
        branchId: activeBranchId,
      },
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (hadConnectionRef.current) {
        toast.success('Realtime connection restored', {
          id: RECONNECT_TOAST_ID,
          duration: 3000,
        });
      }
      hadConnectionRef.current = true;
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      if (hadConnectionRef.current && reason !== 'io client disconnect') {
        toast.warning('Realtime connection lost — reconnecting…', {
          id: RECONNECT_TOAST_ID,
          duration: 10_000,
        });
      }
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [activeBranchId, isAuthenticated, isInitialized]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
