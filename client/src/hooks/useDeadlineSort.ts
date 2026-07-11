import type { Task } from '../types';

export const useDeadlineSort = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1; // No due date goes to end
    if (!b.dueDate) return -1;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};
