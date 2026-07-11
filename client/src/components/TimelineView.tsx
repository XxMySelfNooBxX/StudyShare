import React from 'react';
import { motion as m } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';
import type { TaskUrgency } from '../types';

export const TimelineView: React.FC = () => {
  const { timeline, filterByDeadline, taskFilter } = useKanban();

  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="mb-6 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
      <div className="flex gap-4 min-w-max px-2">
        {timeline.map((item, index) => {
          const isSelected = taskFilter?.dueDate === item.dueDate;
          const urgencyColor = {
            'safe': 'bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-400',
            'warning': 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/60',
            'critical': 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:border-rose-500/60',
          }[item.urgency as TaskUrgency] || 'bg-slate-700 text-slate-200 border-slate-600';

          // Ensure proper date parsing by adding timezone offset if needed or just slice
          // The API returns YYYY-MM-DD string.
          // Since we might run into timezone issues if we just new Date('YYYY-MM-DD'),
          // a simple split is safer or use UTC
          const [year, month, day] = item.dueDate.split('-');
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <m.div
              key={item.dueDate}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              onClick={() => filterByDeadline(isSelected ? undefined : item.dueDate)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200
                ${urgencyColor}
                ${isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-lg' : ''}
              `}
              style={{ minWidth: '110px' }}
            >
              <div className="text-sm font-bold mb-1">{formattedDate}</div>
              <div className="text-xs opacity-80">{item.tasks.length} task{item.tasks.length !== 1 ? 's' : ''}</div>
              
              <div className={`mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                 item.urgency === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                 item.urgency === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                 'bg-slate-600 text-slate-300'
              }`}>
                {item.urgency}
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
};
