import React from 'react';
import { motion as m } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <m.button
      onClick={toggleDarkMode}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle dark mode"
      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </m.button>
  );
};
