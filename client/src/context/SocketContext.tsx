import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket';

interface SocketContextProps {
  isConnected: boolean;
  joinProject: (projectId: string, token: string, userId: string) => void;
  leaveProject: () => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // We will listen to connect/disconnect events globally if needed
    // But since it's room-based, we handle connection per project.
  }, []);

  const joinProject = (projectId: string, token: string, userId: string) => {
    socketService.connect(projectId, token);
    socketService.emit('join-project', { userId });
    setIsConnected(true);
  };

  const leaveProject = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  return (
    <SocketContext.Provider value={{ isConnected, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
