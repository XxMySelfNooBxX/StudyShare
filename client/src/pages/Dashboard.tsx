import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import { MobileNav } from '../components/MobileNav';
import { ThemeToggle } from '../components/ThemeToggle';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading projects
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8 pt-20">
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <MobileNav />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Projects</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-slate-500 dark:text-slate-400">Select a project to view the project board.</p>
      </m.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <m.div
            layoutId="project-card-1"
            className="bg-white dark:bg-cardBg border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl cursor-pointer hover:border-brandAccent transition-colors shadow-lg"
            onClick={() => navigate('/project/1')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Web Dev Coursework</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Build a full-stack web app with user auth...</p>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Updated 2h ago</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Active</span>
            </div>
          </m.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
