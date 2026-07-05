// src/components/TaskCard.tsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion as m } from 'framer-motion';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const daysUntilDue = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Color based on urgency
  let urgencyColor = 'border-slate-600'; // safe
  if (daysUntilDue !== null) {
    if (daysUntilDue <= 1) urgencyColor = 'border-rose-500'; // critical (red)
    else if (daysUntilDue <= 3) urgencyColor = 'border-amber-500'; // warning (amber)
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <m.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-task-id={task.id}
          animate={{
            scale: snapshot.isDragging ? 1.05 : 1,
            boxShadow: snapshot.isDragging
              ? '0 20px 40px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            rotate: snapshot.isDragging ? 2 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            duration: 0.3,
          }}
          onClick={onClick}
          className={`
            bg-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing
            border-l-4 ${urgencyColor} transition-all duration-300
            hover:bg-slate-600
          `}
        >
          {/* Task Title */}
          <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">
            {task.title}
          </h3>

          {/* Task Meta */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex gap-2">
              {/* Assignee Avatar */}
              {task.assignee && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Sub-task count */}
              {task.subtaskCount && task.subtaskCount > 0 && (
                <span className="text-slate-400">
                  {task.completedSubtaskCount || 0}/{task.subtaskCount}
                </span>
              )}
            </div>

            {/* Due date badge */}
            {task.dueDate && (
              <span className={`text-xs px-2 py-1 rounded ${isOverdue
                  ? 'bg-rose-500/20 text-rose-300'
                  : daysUntilDue && daysUntilDue <= 3
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                {daysUntilDue && daysUntilDue > 0 ? `${daysUntilDue}d` : 'Due'}
              </span>
            )}
          </div>

          {/* Comment count */}
          {task.commentCount && task.commentCount > 0 && (
            <div className="mt-2 text-xs text-slate-400">
              💬 {task.commentCount}
            </div>
          )}
        </m.div>
      )}
    </Draggable>
  );
};

export default React.memo(TaskCard);