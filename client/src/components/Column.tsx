import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { m } from 'framer-motion';
import { Task, TaskStatus } from '../context/KanbanContext';
import TaskCard from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  index: number;
}

const Column: React.FC<ColumnProps> = ({ status, title, tasks, index }) => {
  return (
    <m.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        type: 'spring'
      }}
      className="flex flex-col flex-shrink-0 w-80 bg-slate-800/80 rounded-xl h-full border border-slate-700/50 overflow-hidden backdrop-blur-sm"
    >
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-slate-200 font-semibold">{title}</h3>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-slate-700/50 border-brandAccent/30' : 'bg-transparent'
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-24 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center opacity-50">
                <span className="text-slate-400 text-sm">Drop tasks here</span>
              </div>
            )}
            
            {tasks.map((task, idx) => (
              <TaskCard key={task.id} task={task} index={idx} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </m.div>
  );
};

export default Column;
