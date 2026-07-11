import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { SubTask } from '../types';
import { useKanban } from '../context/KanbanContext';

interface SubTaskListProps {
  taskId: string;
  subtasks: SubTask[];
}

export const SubTaskList: React.FC<SubTaskListProps> = ({ taskId, subtasks }) => {
  const { addSubtask, toggleSubtask, deleteSubtask } = useKanban();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Sub-Tasks</h3>
      
      <div className="space-y-2 mb-3">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center justify-between group">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => toggleSubtask(taskId, subtask.id)}
                className={`w-5 h-5 flex items-center justify-center rounded border ${
                  subtask.completed
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 hover:border-indigo-500'
                } transition-colors focus:outline-none`}
              >
                {subtask.completed && (
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </button>
              <span className={`text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {subtask.title}
              </span>
            </div>
            <button
              onClick={() => deleteSubtask(taskId, subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a sub-task..."
          className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5"
        />
        <button
          type="submit"
          disabled={!newSubtaskTitle.trim()}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
};
