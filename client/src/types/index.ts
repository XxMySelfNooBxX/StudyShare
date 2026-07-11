// src/types/index.ts

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Team {
    id: string;
    projectId: string;
    userId: string;
    user?: User;
    role: 'owner' | 'member' | 'viewer';
    joinedAt: string;
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskUrgency = 'safe' | 'warning' | 'critical';

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    assignedTo?: string;
    assignee?: User;
    dueDate?: string;
    urgency?: TaskUrgency;
    daysUntilDue?: number | null;
    position: number;
    version: number;
    createdAt: string;
    updatedAt: string;
    subtasks?: SubTask[];
    comments?: Comment[];
    commentCount?: number;
    subtaskCount?: number;
    completedSubtaskCount?: number;
}

export interface SubTask {
    id: string;
    taskId: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    taskId: string;
    authorId: string;
    author?: User;
    content: string;
    createdAt: string;
    updatedAt: string;
}



export interface Suggestion {
    title: string;
    type: 'design' | 'implementation' | 'testing' | 'research' | 'planning' | 'review' | 'writing';
    estimatedHours?: number;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  taskTitle?: string;
  action: string;
  changedBy: string;
  changedByName?: string;
  changeDetails?: Record<string, any>;
  timestamp: string;
}

export interface Contributor {
  userId: string;
  name: string;
  avatar?: string;
  taskCount: number;
  subtaskCount: number;
  commentCount: number;
  tasksCreated: number;
  tasksCompleted: number;
  lastActive: string;
  role: 'owner' | 'member' | 'viewer' | string;
}

export interface KanbanContextType {
    tasks: Record<TaskStatus, Task[]>;
    selectedTask: Task | null;
    loading: boolean;
    error: string | null;
    timeline?: any[];
    taskFilter?: { dueDate?: string };
    contributors?: Contributor[];
    taskHistory?: TaskHistory[];
    setSelectedTask: (task: Task | null) => void;
    createTask: (projectId: string, taskData: Partial<Task>, enableSuggestions?: boolean) => Promise<any>;
    moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    addSubtask: (taskId: string, title: string) => Promise<void>;
    toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
    deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
    addComment: (taskId: string, content: string) => Promise<void>;
    deleteComment: (taskId: string, commentId: string) => Promise<void>;
    fetchTasks: (projectId: string) => Promise<void>;
    fetchTaskDetails: (taskId: string) => Promise<void>;

    filterByDeadline: (dueDate?: string) => void;
    getCriticalTasks: () => Task[];
    getSortedTasksByDeadline: () => Task[];
    fetchContributors: (projectId: string) => Promise<void>;
    fetchTaskHistory: (taskId: string) => Promise<void>;
    exportPDF: (projectId: string, options: { includeComments: boolean; includeHistory: boolean; includeContributors: boolean; }) => Promise<void>;
}