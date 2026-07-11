import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';

interface TaskHistoryProps {
  taskId: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'task_created': return '📝';
    case 'task_updated': return '🔄';
    case 'task_deleted': return '🗑️';
    case 'subtask_created': return '➕';
    case 'subtask_completed': return '✅';
    case 'subtask_uncompleted': return '🟩';
    case 'subtask_deleted': return '❌';
    case 'comment_added': return '💬';
    case 'comment_deleted': return '🔇';
    default: return '📌';
  }
};

const formatActionText = (action: string) => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDetails = (action: string, details?: Record<string, any>) => {
  if (!details) return null;
  
  if (action === 'task_updated' && details.oldValue && details.newValue) {
    const changes = [];
    for (const key in details.newValue) {
      if (details.oldValue[key] !== details.newValue[key]) {
        changes.push(
          <div key={key} className="text-xs mt-1">
            <span className="text-slate-400 capitalize">{key}:</span>{' '}
            <span className="line-through text-slate-500">{String(details.oldValue[key] || 'None')}</span>
            {' → '}
            <span className="text-emerald-400">{String(details.newValue[key] || 'None')}</span>
          </div>
        );
      }
    }
    return changes.length > 0 ? changes : <span className="text-xs text-slate-400">No visible changes</span>;
  }
  
  if (action === 'comment_added') {
    return <div className="text-xs mt-1 text-slate-300 italic">"{details.content}"</div>;
  }
  
  if (action.startsWith('subtask')) {
    return <div className="text-xs mt-1 text-slate-300">"{details.title}"</div>;
  }
  
  return null;
};

export const TaskHistory: React.FC<TaskHistoryProps> = ({ taskId }) => {
  const { taskHistory, fetchTaskHistory } = useKanban();

  useEffect(() => {
    fetchTaskHistory(taskId);
  }, [taskId, fetchTaskHistory]);

  if (!taskHistory || taskHistory.length === 0) {
    return <div className="text-slate-400 text-sm text-center py-4">No history available.</div>;
  }

  return (
    <div className="relative pl-6 mt-4">
      {/* Vertical line connector */}
      <m.line
        initial={{ strokeDasharray: 100, strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-700 origin-top"
      />
      
      {taskHistory.map((history, index) => (
        <m.div
          key={history.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="relative mb-6 last:mb-0"
        >
          {/* Dot */}
          <div className="absolute -left-[27px] mt-1.5 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getActionIcon(history.action)}</span>
              <span className="text-sm font-medium text-slate-200">
                {history.changedByName || 'System'}
              </span>
              <span className="text-sm text-slate-400">
                {formatActionText(history.action)}
              </span>
            </div>
            
            <div className="text-xs text-slate-500 mb-2">
              {new Date(history.timestamp).toLocaleString()}
            </div>
            
            {formatDetails(history.action, history.changeDetails)}
          </div>
        </m.div>
      ))}
    </div>
  );
};
