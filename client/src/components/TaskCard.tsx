import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { motion as m } from 'framer-motion';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  let due = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();
  if (due) due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const daysUntilDue = due
    ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const urgency = (() => {
    if (daysUntilDue === null) return 'safe';
    if (daysUntilDue < 0) return 'critical';
    if (daysUntilDue <= 3) return 'critical';
    if (daysUntilDue <= 7) return 'warning';
    return 'safe';
  })();

  const urgencyColor = { safe: '#6366f1', warning: '#f59e0b', critical: '#f43f5e' }[urgency];
  const urgencyBg = { safe: 'rgba(99,102,241,0.12)', warning: 'rgba(245,158,11,0.12)', critical: 'rgba(244,63,94,0.12)' }[urgency];
  const urgencyText = { safe: '#818cf8', warning: '#fbbf24', critical: '#fb7185' }[urgency];

  const dueDateLabel = (() => {
    if (!task.dueDate || daysUntilDue === null) return null;
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `${daysUntilDue}d left`;
  })();

  const totalSubs = task.subtaskCount ?? 0;
  const doneSubs = task.completedSubtaskCount ?? 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style, marginBottom: 8 }}
        >
          <m.div
            animate={{
              scale: snapshot.isDragging ? 1.03 : 1,
              rotateZ: snapshot.isDragging ? 1.5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={onClick}
            style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${snapshot.isDragging ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
              borderLeft: `3px solid ${urgencyColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              cursor: 'pointer',
              boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              transition: 'border-color 0.15s, background 0.15s',
              userSelect: 'none',
            }}
          >
            {/* Title */}
            <p style={{
              fontWeight: 500, fontSize: '0.84rem', color: 'var(--text-primary)',
              lineHeight: 1.45, marginBottom: 10,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {task.title}
            </p>

            {/* Footer row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Assignee avatar */}
                {task.assignee && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: 'white',
                    flexShrink: 0,
                  }}>
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Subtask count */}
                {totalSubs > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    <span>{doneSubs}/{totalSubs}</span>
                  </div>
                )}

                {/* Comments */}
                {(task.commentCount ?? 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    <span>{task.commentCount}</span>
                  </div>
                )}
              </div>

              {/* Due date badge */}
              {dueDateLabel && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 7px', borderRadius: 99,
                  background: urgencyBg, color: urgencyText,
                  fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.02em',
                  flexShrink: 0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {dueDateLabel}
                </div>
              )}
            </div>

            {/* Subtask progress bar */}
            {totalSubs > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 3, background: 'var(--bg-highlight)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(doneSubs / totalSubs) * 100}%`,
                    background: doneSubs === totalSubs ? 'var(--green)' : 'var(--accent)',
                    borderRadius: 99,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </m.div>
        </div>
      )}
    </Draggable>
  );
};

export default React.memo(TaskCard);