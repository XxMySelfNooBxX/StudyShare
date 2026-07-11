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
  task?: Task | null;
}

type ModalTab = 'details' | 'subtasks' | 'comments' | 'history';

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, projectId, task }) => {
  const { createTask, updateTask, fetchTaskDetails } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Suggestion[]>([]);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('details');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setEnableSuggestions(false);
        setSuggestedSubtasks([]);
        setCreatedTaskId(null);
        setActiveTab('details');
        fetchTaskDetails(task.id);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setEnableSuggestions(true);
        setSuggestedSubtasks([]);
        setCreatedTaskId(null);
        setActiveTab('details');
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
        if (response?.suggestedSubtasks?.length > 0) {
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

  // Due date urgency
  const daysLeft = (() => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    const n = new Date();
    d.setHours(0, 0, 0, 0); n.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - n.getTime()) / 86400000);
  })();
  const dueBg   = daysLeft === null ? '' : daysLeft < 0 ? 'rgba(244,63,94,0.12)' : daysLeft <= 3 ? 'rgba(244,63,94,0.12)' : daysLeft <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)';
  const dueColor = daysLeft === null ? '' : daysLeft < 0 ? '#fb7185' : daysLeft <= 3 ? '#fb7185' : daysLeft <= 7 ? '#fbbf24' : '#818cf8';

  const modalTabs: { id: ModalTab; label: string }[] = task
    ? [
        { id: 'details', label: 'Details' },
        { id: 'subtasks', label: 'Subtasks' },
        { id: 'comments', label: 'Comments' },
        { id: 'history', label: 'History' },
      ]
    : [{ id: 'details', label: 'Details' }];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: 520,
              maxHeight: '90dvh',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {suggestedSubtasks.length > 0 && createdTaskId
                    ? '✨ AI Suggested Subtasks'
                    : task ? 'Edit Task' : 'New Task'}
                </h2>
                {task && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>ID: {task.id.slice(0, 8)}…</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* ── Tabs (edit mode) ── */}
            {task && !createdTaskId && (
              <div style={{
                display: 'flex', gap: 4, padding: '10px 16px 0',
                borderBottom: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}>
                {modalTabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      fontSize: '0.78rem', fontWeight: activeTab === t.id ? 600 : 400,
                      color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                      background: 'none', border: 'none',
                      borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                      cursor: 'pointer', fontFamily: 'inherit',
                      marginBottom: -1, transition: 'all 0.15s',
                    }}
                  >{t.label}</button>
                ))}
              </div>
            )}

            {/* ── Body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {suggestedSubtasks.length > 0 && createdTaskId ? (
                <div>
                  <div style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px', marginBottom: 16,
                  }}>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Task created!</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Here are AI-suggested subtasks based on your title. Click + to add them.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {suggestedSubtasks.map((suggestion, idx) => (
                      <SuggestionCard key={idx} suggestion={suggestion} index={idx} onAdd={handleAddSuggestion} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <button className="btn-primary" onClick={onClose}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Details Tab */}
                  {(activeTab === 'details' || !task) && (
                    <form id="task-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          required
                          autoFocus
                          className="input-base"
                          placeholder="E.g., Implement login page"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          rows={3}
                          className="input-base"
                          placeholder="Add more context about this task…"
                          style={{ resize: 'none', lineHeight: 1.6 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Due Date
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="input-base"
                        />
                        {daysLeft !== null && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            marginTop: 8, padding: '4px 10px', borderRadius: 99,
                            background: dueBg, color: dueColor,
                            fontSize: '0.75rem', fontWeight: 600,
                          }}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days remaining`}
                          </div>
                        )}
                      </div>

                      {!task && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px',
                          background: 'var(--bg-overlay)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                        }} onClick={() => setEnableSuggestions(!enableSuggestions)}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 5,
                            border: `2px solid ${enableSuggestions ? 'var(--accent)' : 'var(--border-medium)'}`,
                            background: enableSuggestions ? 'var(--accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.15s',
                          }}>
                            {enableSuggestions && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>Generate AI subtasks</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Automatically suggest subtasks based on your task title</p>
                          </div>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Subtasks Tab */}
                  {activeTab === 'subtasks' && task && (
                    <SubTaskList taskId={task.id} subtasks={task.subtasks || []} />
                  )}

                  {/* Comments Tab */}
                  {activeTab === 'comments' && task && (
                    <CommentThread taskId={task.id} comments={task.comments || []} />
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && task && (
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Change History</p>
                      <TaskHistory taskId={task.id} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            {!(suggestedSubtasks.length > 0 && createdTaskId) && (activeTab === 'details' || !task) && (
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'flex-end', gap: 10,
                flexShrink: 0,
              }}>
                <button type="button" className="btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="task-form"
                  disabled={isSubmitting || !title.trim()}
                  className="btn-primary"
                  style={{ minWidth: 110, justifyContent: 'center' }}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
