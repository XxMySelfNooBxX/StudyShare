import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';

interface ContributorSummaryProps {
  projectId: string;
}

export const ContributorSummary: React.FC<ContributorSummaryProps> = ({ projectId }) => {
  const { contributors, fetchContributors } = useKanban();

  useEffect(() => {
    fetchContributors(projectId);
  }, [projectId, fetchContributors]);

  if (!contributors || contributors.length === 0) {
    return <div className="text-slate-400 p-4">Loading contributors...</div>;
  }

  const maxTasks = Math.max(...contributors.map(c => c.taskCount), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {contributors.map((contributor, index) => (
        <m.div
          key={contributor.userId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
              {contributor.avatar ? (
                <img src={contributor.avatar} alt={contributor.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                contributor.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold text-lg">{contributor.name}</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{contributor.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm text-slate-300 mb-4 bg-slate-900/50 p-3 rounded-lg">
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium text-slate-200">{contributor.taskCount}</span>
              <span className="text-xs text-slate-500">Tasks</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-700/50">
              <span className="text-lg font-medium text-emerald-400">{contributor.tasksCompleted}</span>
              <span className="text-xs text-slate-500">Done</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium text-slate-200">{contributor.commentCount}</span>
              <span className="text-xs text-slate-500">Comments</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Workload</span>
              <span>{Math.round((contributor.taskCount / maxTasks) * 100)}% of max</span>
            </div>
            <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <m.div 
                className="bg-indigo-500 h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${(contributor.taskCount / maxTasks) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
              />
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
};
