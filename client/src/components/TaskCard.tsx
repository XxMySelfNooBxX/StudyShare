import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { m } from 'framer-motion';
import { Task } from '../context/KanbanContext';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = memo(({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <m.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          layout
          initial={false}
          animate={{
            scale: snapshot.isDragging ? 1.05 : 1,
            boxShadow: snapshot.isDragging 
              ? '0 20px 40px rgba(0,0,0,0.15)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
            rotate: snapshot.isDragging ? 2 : 0,
            zIndex: snapshot.isDragging ? 50 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            duration: 0.3
          }}
          className="bg-slate-700 rounded-lg p-3 mb-3 border border-slate-600/50 cursor-grab active:cursor-grabbing relative"
          data-task-id={task.id}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-medium text-sm leading-tight">{task.title}</h4>
            {task.assignedTo && (
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 ml-2 border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {task.assignedTo.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          
          {task.description && (
            <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              {task.id.substring(0, 5)}
            </span>
            {task.dueDate && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-600 text-slate-300`}>
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </m.div>
      )}
    </Draggable>
  );
}, (prev, next) => prev.task.id === next.task.id && prev.task.version === next.task.version && prev.index === next.index);

export default TaskCard;
