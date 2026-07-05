// src/context/KanbanContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, TaskStatus, SubTask, Comment, KanbanContextType } from '../types';
import { useSocket } from '../hooks/useSocket';

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode; projectId: string }> = ({
  children,
  projectId,
}) => {
  const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  // Fetch tasks from API
  const fetchTasks = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      const tasksByStatus: Record<TaskStatus, Task[]> = {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
      };

      data.tasks?.forEach((task: Task) => {
        tasksByStatus[task.status].push(task);
      });

      setTasks(tasksByStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Move task to different column
  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
      // Optimistic update
      const updatedTasks = { ...tasks };
      let movedTask: Task | null = null;

      // Find and remove from old status
      for (const status of Object.keys(updatedTasks) as TaskStatus[]) {
        const index = updatedTasks[status].findIndex((t) => t.id === taskId);
        if (index !== -1) {
          [movedTask] = updatedTasks[status].splice(index, 1);
          break;
        }
      }

      // Add to new status
      if (movedTask) {
        movedTask.status = newStatus;
        movedTask.position = newPosition;
        updatedTasks[newStatus].push(movedTask);
        setTasks(updatedTasks);
      }

      // Emit WebSocket event
      socket?.emit('task:move', { taskId, newStatus, newPosition, projectId });
    },
    [tasks, socket, projectId]
  );

  // Update task details
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updatedTasks = { ...tasks };

      for (const status of Object.keys(updatedTasks) as TaskStatus[]) {
        const task = updatedTasks[status].find((t) => t.id === taskId);
        if (task) {
          Object.assign(task, updates);
          break;
        }
      }

      setTasks(updatedTasks);
      socket?.emit('task:update', { taskId, updates, projectId });
    },
    [tasks, socket, projectId]
  );

  // Add sub-task
  const addSubtask = useCallback((taskId: string, subtask: SubTask) => {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };

      for (const status of Object.keys(newTasks) as TaskStatus[]) {
        const task = newTasks[status].find((t) => t.id === taskId);
        if (task) {
          if (!task.subtasks) task.subtasks = [];
          task.subtasks.push(subtask);
          break;
        }
      }

      return newTasks;
    });
  }, []);

  // Toggle sub-task completion
  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const task = newTasks[status].find((t) => t.id === taskId);
          if (task?.subtasks) {
            const subtask = task.subtasks.find((st) => st.id === subtaskId);
            if (subtask) {
              subtask.completed = !subtask.completed;
            }
          }
        }

        return newTasks;
      });

      socket?.emit('subtask:toggle', { taskId, subtaskId, projectId });
    },
    [socket, projectId]
  );

  // Delete sub-task
  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const task = newTasks[status].find((t) => t.id === taskId);
          if (task?.subtasks) {
            task.subtasks = task.subtasks.filter((st) => st.id !== subtaskId);
          }
        }

        return newTasks;
      });
    },
    []
  );

  // Add comment
  const addComment = useCallback(
    async (taskId: string, content: string) => {
      socket?.emit('comment:add', { taskId, content, projectId });
    },
    [socket, projectId]
  );

  // Delete comment
  const deleteComment = useCallback(
    async (taskId: string, commentId: string) => {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const task = newTasks[status].find((t) => t.id === taskId);
          if (task?.comments) {
            task.comments = task.comments.filter((c) => c.id !== commentId);
          }
        }

        return newTasks;
      });
    },
    []
  );

  // Listen for WebSocket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('task:move', (data) => {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        let movedTask: Task | null = null;

        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const index = newTasks[status].findIndex((t) => t.id === data.taskId);
          if (index !== -1) {
            [movedTask] = newTasks[status].splice(index, 1);
            break;
          }
        }

        if (movedTask) {
          movedTask.status = data.newStatus;
          movedTask.position = data.newPosition;
          newTasks[data.newStatus].push(movedTask);
        }

        return newTasks;
      });
    });

    socket.on('comment:new', (data) => {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const task = newTasks[status].find((t) => t.id === data.taskId);
          if (task) {
            if (!task.comments) task.comments = [];
            task.comments.push(data.comment);
            break;
          }
        }

        return newTasks;
      });
    });

    return () => {
      socket.off('task:move');
      socket.off('comment:new');
    };
  }, [socket]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks(projectId);
  }, [projectId, fetchTasks]);

  const value: KanbanContextType = {
    tasks,
    selectedTask,
    loading,
    error,
    setSelectedTask,
    moveTask,
    updateTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    deleteComment,
    fetchTasks,
  };

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

// Export types
export type { Task, TaskStatus, SubTask, Comment, KanbanContextType };