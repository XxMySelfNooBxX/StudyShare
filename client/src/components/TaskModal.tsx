import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';
import type { Task, Suggestion } from '../types';
import { SuggestionCard } from './SuggestionCard';
import { SubTaskList } from './SubTaskList';
import { CommentThread } from './CommentThread';
import { TaskHistory } from './TaskHistory';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null; // if null, it's a create modal
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, projectId, task }) => {
  const { createTask, updateTask, fetchTaskDetails } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For newly created task suggestions
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Suggestion[]>([]);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setEnableSuggestions(false);
        setSuggestedSubtasks([]);
        setCreatedTaskId(null);
        // Fetch full task details (comments etc) when opened
        fetchTaskDetails(task.id);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setEnableSuggestions(true);
        setSuggestedSubtasks([]);
        setCreatedTaskId(null);
      }
    }
  }, [isOpen, task, fetchTaskDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (task) {
        await updateTask(task.id, { title, description, dueDate: dueDate || undefined });
        onClose();
      } else {
        const response = await createTask(projectId, { title, description, dueDate: dueDate || undefined }, enableSuggestions);
        if (response && response.suggestedSubtasks && response.suggestedSubtasks.length > 0) {
          setSuggestedSubtasks(response.suggestedSubtasks);
          setCreatedTaskId(response.task.id);
        } else {
          onClose();
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSuggestion = async (suggestionTitle: string) => {
    if (createdTaskId) {
      const { addSubtask } = useKanban();
      await addSubtask(createdTaskId, suggestionTitle);
      setSuggestedSubtasks(prev => prev.filter(s => s.title !== suggestionTitle));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {suggestedSubtasks.length > 0 && createdTaskId ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">Task created successfully!</h3>
                  <p className="text-sm">Based on your title, we've generated some suggested sub-tasks. Add the ones you need.</p>
                </div>
                <div className="space-y-2 mt-4">
                  {suggestedSubtasks.map((suggestion, idx) => (
                    <SuggestionCard
                      key={idx}
                      suggestion={suggestion}
                      index={idx}
                      onAdd={handleAddSuggestion}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 sm:text-sm transition-shadow"
                    placeholder="E.g., Implement login page"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 sm:text-sm transition-shadow resize-none"
                    placeholder="Add details about this task..."
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 sm:text-sm transition-shadow"
                  />
                  {dueDate && (() => {
                    const now = new Date();
                    const due = new Date(dueDate);
                    now.setHours(0, 0, 0, 0);
                    due.setHours(0, 0, 0, 0);
                    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    let urgency = 'safe';
                    if (days < 0) urgency = 'critical';
                    else if (days <= 3) urgency = 'critical';
                    else if (days <= 7) urgency = 'warning';

                    return (
                      <div className={`text-xs px-2 py-1 rounded mt-2 inline-block font-medium ${
                        urgency === 'critical' ? 'bg-rose-500/20 text-rose-600' :
                        urgency === 'warning' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} priority
                      </div>
                    );
                  })()}
                </div>

                {!task && (
                  <div className="flex items-center">
                    <input
                      id="enableSuggestions"
                      type="checkbox"
                      checked={enableSuggestions}
                      onChange={(e) => setEnableSuggestions(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableSuggestions" className="ml-2 block text-sm text-gray-700">
                      Generate suggested sub-tasks
                    </label>
                  </div>
                )}

                {task && (
                  <>
                    <div className="pt-2 border-t border-gray-100">
                      <SubTaskList taskId={task.id} subtasks={task.subtasks || []} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <CommentThread taskId={task.id} comments={task.comments || []} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">History</h4>
                      <TaskHistory taskId={task.id} />
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Footer (only show if not in suggestions mode) */}
          {!(suggestedSubtasks.length > 0 && createdTaskId) && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="task-form"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
