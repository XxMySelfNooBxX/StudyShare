// src/hooks/useSocket.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const useSocket = (): Socket | null => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (socketInstance) {
            setSocket(socketInstance);
            return;
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        const newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        socketInstance = newSocket;
        setSocket(newSocket);

        return () => {
            // Don't disconnect - keep the connection alive
            // newSocket.disconnect();
        };
    }, []);

    return socket;
};

export const getSocket = (): Socket | null => {
    return socketInstance;
};