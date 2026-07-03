import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { m } from 'framer-motion';
import { useKanban, TaskStatus } from '../context/KanbanContext';
import Column from './Column';

interface KanbanBoardProps {
  projectId: string;
  userId: string;
}

const STATUS_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, userId }) => {
  const { tasks, moveTask } = useKanban();
  const [xPosition, setXPosition] = useState(0);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;
    
    // Calculate new position
    const destList = tasks[destStatus];
    let newPosition = 1000;
    
    if (destList.length > 0) {
      if (destination.index === 0) {
        newPosition = destList[0].position / 2;
      } else if (destination.index >= destList.length) {
        newPosition = destList[destList.length - 1].position + 1000;
      } else {
        const prev = destList[destination.index - 1].position;
        // if dropping in same list, and moving down, the target index shifts
        const nextIdx = sourceStatus === destStatus && source.index < destination.index 
          ? destination.index + 1 
          : destination.index;
          
        const next = nextIdx < destList.length ? destList[nextIdx].position : prev + 2000;
        newPosition = (prev + next) / 2;
      }
    }

    moveTask(draggableId, sourceStatus, destStatus, source.index, destination.index, newPosition, projectId, userId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full w-full overflow-hidden">
        {/* Mobile carousel vs Desktop flex */}
        <m.div 
          className="flex h-full gap-6 pb-4 md:px-0 px-4"
          drag="x"
          dragConstraints={{ left: -800, right: 0 }}
          animate={{ x: xPosition }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          dragElastic={0.1}
          // Only enable drag on small screens by using CSS to handle overflow on desktop
          style={{ cursor: 'grab' }}
        >
          {STATUS_COLUMNS.map((col, index) => (
            <Column
              key={col.id}
              status={col.id}
              title={col.title}
              tasks={tasks[col.id] || []}
              index={index}
            />
          ))}
        </m.div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
