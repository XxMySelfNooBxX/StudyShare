import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], icon?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const TOAST_COLORS: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  icon: '✓' },
  error:   { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.25)',  icon: '✕' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '⚠' },
  info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', icon: 'ℹ' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', icon?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const style = TOAST_COLORS[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  backdropFilter: 'blur(16px)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  minWidth: 260, maxWidth: 360,
                  boxShadow: 'var(--shadow-lg)',
                  pointerEvents: 'auto',
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {toast.icon ?? style.icon}
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {toast.message}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
