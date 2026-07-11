import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

import { useKanban } from '../context/KanbanContext';
import type { TaskStatus } from '../types';
import Column from './Column';

interface KanbanBoardProps {
  // Empty
}

const STATUS_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = () => {
  const { tasks, moveTask, taskFilter } = useKanban();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    moveTask(draggableId, destStatus, newPosition);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full w-full overflow-hidden">
        <div 
          className={`h-full pb-4 md:px-0 px-4 ${isMobile ? 'flex overflow-x-auto gap-6 snap-x snap-mandatory' : 'grid grid-cols-4 gap-4'}`}
        >
          {STATUS_COLUMNS.map((col, index) => (
            <div key={col.id} className={isMobile ? "min-w-[85vw] snap-center" : ""}>
              <Column
                status={col.id}
                title={col.title}
                tasks={(tasks[col.id] || []).filter(t => !taskFilter?.dueDate || (t.dueDate && t.dueDate.startsWith(taskFilter.dueDate)))}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
