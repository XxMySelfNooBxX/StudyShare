import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: (project: { id: string; name: string; description: string; color: string }) => void;
}

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f43f5e', '#ec4899', '#14b8a6',
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 700));
    const newProject = {
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      color,
    };
    setSubmitting(false);
    onCreated(newProject);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="modal-backdrop"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-xl)',
            width: '100%', maxWidth: 480,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '18px 22px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                New Project
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Create a workspace for your study group
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project Name *
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="input-base"
                placeholder="E.g., Final Year Project"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="input-base"
                placeholder="What is this project about?"
                style={{ resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c, border: 'none', cursor: 'pointer',
                      outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline 0.15s, transform 0.15s',
                      transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim()}
                style={{ minWidth: 120, justifyContent: 'center' }}
              >
                {submitting ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
