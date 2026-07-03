import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { socketService } from '../services/socket';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  position: number;
  assignedTo?: string;
  dueDate?: string;
  version: number;
}

export type TasksByStatus = Record<TaskStatus, Task[]>;

interface KanbanContextProps {
  tasks: TasksByStatus;
  setTasks: React.Dispatch<React.SetStateAction<TasksByStatus>>;
  moveTask: (taskId: string, sourceStatus: TaskStatus, destStatus: TaskStatus, sourceIndex: number, destIndex: number, newPosition: number, projectId: string, userId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>, projectId: string, userId: string) => void;
}

const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TasksByStatus>({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    DONE: []
  });

  useEffect(() => {
    socketService.on('task:move', (data: any) => {
      // For real-time updates from other users
      // In a real app we'd carefully merge this without disrupting local drag.
      // For now, we will assume a simple reload or state merge.
      console.log('Received task:move', data);
    });

    socketService.on('task:update', (data: any) => {
      console.log('Received task:update', data);
    });

    return () => {
      socketService.off('task:move');
      socketService.off('task:update');
    };
  }, []);

  const moveTask = useCallback((
    taskId: string, 
    sourceStatus: TaskStatus, 
    destStatus: TaskStatus, 
    sourceIndex: number, 
    destIndex: number,
    newPosition: number,
    projectId: string,
    userId: string
  ) => {
    setTasks(prev => {
      const sourceList = [...prev[sourceStatus]];
      const destList = sourceStatus === destStatus ? sourceList : [...prev[destStatus]];
      
      const [movedTask] = sourceList.splice(sourceIndex, 1);
      movedTask.status = destStatus;
      movedTask.position = newPosition;
      movedTask.version += 1;
      
      destList.splice(destIndex, 0, movedTask);
      
      return {
        ...prev,
        [sourceStatus]: sourceList,
        [destStatus]: destList,
      };
    });

    socketService.emit('task:move', { 
      taskId, 
      newStatus: destStatus, 
      newPosition, 
      userId, 
      projectId,
      version: 1 // MVP
    });
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>, projectId: string, userId: string) => {
    // update logic...
    socketService.emit('task:update', { taskId, updates, userId, projectId });
  }, []);

  return (
    <KanbanContext.Provider value={{ tasks, setTasks, moveTask, updateTask }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used within KanbanProvider');
  return ctx;
};
