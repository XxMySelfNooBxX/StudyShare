import React, { useState } from 'react';
import { motion as m } from 'framer-motion';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden z-50 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
        className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <m.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -200 }}
        className="absolute left-0 top-12 w-64 bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700 pointer-events-auto"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="flex flex-col gap-3">
          <a href="/dashboard" className="text-slate-200 hover:text-white">Dashboard</a>
          <button onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }} className="text-left text-rose-400 hover:text-rose-300">
            Logout
          </button>
        </div>
      </m.div>
    </div>
  );
};
