import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';

interface DeadlineAlertProps {
  criticalCount: number;
}

export const DeadlineAlert: React.FC<DeadlineAlertProps> = ({ criticalCount }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || criticalCount === 0) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mb-6 relative overflow-hidden"
      >
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <m.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(239, 68, 68, 0.4)',
                  '0 0 0 10px rgba(239, 68, 68, 0)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 bg-rose-500 rounded-full shrink-0"
            />
            <div>
              <h3 className="text-rose-400 font-medium flex items-center gap-2">
                Critical Deadlines Approaching
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                You have {criticalCount} task{criticalCount !== 1 ? 's' : ''} that {criticalCount !== 1 ? 'are' : 'is'} overdue or due within 3 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              aria-label="Dismiss alert"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </m.div>
    </AnimatePresence>
  );
};
