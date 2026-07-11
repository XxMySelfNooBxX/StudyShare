import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { motion as m } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  index: number;
}

const STATUS_META: Record<TaskStatus, { color: string; icon: React.ReactNode }> = {
  BACKLOG: {
    color: '#5b5e73',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
  },
  TODO: {
    color: '#6366f1',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  },
  IN_PROGRESS: {
    color: '#f59e0b',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  },
  DONE: {
    color: '#22c55e',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>,
  },
};

const Column: React.FC<ColumnProps> = ({ status, title, tasks, index }) => {
  const { setSelectedTask } = useKanban();
  const meta = STATUS_META[status];

  return (
    <m.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, width: 280,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ color: meta.color, display: 'flex', alignItems: 'center' }}>
          {meta.icon}
        </div>
        <h3 style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', letterSpacing: '0.01em', flex: 1 }}>
          {title}
        </h3>
        <div style={{
          minWidth: 20, height: 20, padding: '0 6px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
        }}>
          {tasks.length}
        </div>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <m.div
            ref={provided.innerRef}
            {...provided.droppableProps}
            animate={{
              background: snapshot.isDraggingOver
                ? 'rgba(99,102,241,0.05)'
                : 'transparent',
            }}
            transition={{ duration: 0.15 }}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '10px 10px',
              minHeight: 80,
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div style={{
                minHeight: 80,
                border: '1.5px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-placeholder)', fontSize: '0.78rem',
              }}>
                No tasks yet
              </div>
            )}

            {tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                onClick={() => setSelectedTask(task)}
              />
            ))}
            {provided.placeholder}
          </m.div>
        )}
      </Droppable>
    </m.div>
  );
};

export default Column;
