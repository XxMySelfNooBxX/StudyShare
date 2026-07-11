import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { KanbanProvider, useKanban } from '../context/KanbanContext';
import KanbanBoard from '../components/KanbanBoard';
import { TaskModal } from '../components/TaskModal';
import { TimelineView } from '../components/TimelineView';
import { DeadlineAlert } from '../components/DeadlineAlert';
import { ContributorSummary } from '../components/ContributorSummary';
import { ProjectActivityLog } from '../components/ProjectActivityLog';
import { ExportPDFModal } from '../components/ExportPDFModal';
import { MobileNav } from '../components/MobileNav';
import { ThemeToggle } from '../components/ThemeToggle';

const ProjectContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const navigate = useNavigate();
  // We remove the old SocketContext since KanbanContext now manages its own socket
  // (Or we leave it if it's used elsewhere, but let's just keep KanbanContext for tasks)
  const { loading, error, selectedTask, setSelectedTask, getCriticalTasks } = useKanban();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<'board' | 'contributors' | 'history'>('board');
  const [showExportModal, setShowExportModal] = useState(false);
  const criticalTasks = getCriticalTasks();

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 pt-8">
      <m.div
        layoutId={`project-card-${projectId}`}
        className="bg-white dark:bg-cardBg border border-slate-200 dark:border-slate-700/50 p-4 md:p-6 rounded-xl mb-6 flex justify-between items-center shadow-lg"
      >
        <div className="flex items-center gap-4">
          <MobileNav />
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 dark:text-slate-400 hover:text-brandAccent mb-1 text-sm flex items-center transition-colors"
            >
              &larr; Back to Dashboard
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Project: Web Dev Coursework</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Create Task
          </button>
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700 hidden md:flex">
            <div className="w-2 h-2 rounded-full bg-brandAccent animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Live Sync</span>
          </div>
        </div>
      </m.div>

      <div className="mt-2 mb-4">
        <div className="flex gap-4 border-b border-slate-700/50">
          <button 
            onClick={() => setTab('board')}
            className={`px-4 py-2 ${tab === 'board' ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            📋 Kanban Board
          </button>
          <button 
            onClick={() => setTab('contributors')}
            className={`px-4 py-2 ${tab === 'contributors' ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            👥 Contributors
          </button>
          <button 
            onClick={() => setTab('history')}
            className={`px-4 py-2 ${tab === 'history' ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            📝 Activity
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="ml-auto px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            📥 Export PDF
          </button>
        </div>
      </div>

      {tab === 'board' && (
        <>
          <DeadlineAlert criticalCount={criticalTasks.length} />
          <TimelineView />

          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brandAccent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : (
              <KanbanBoard />
            )}
          </div>
        </>
      )}

      {tab === 'contributors' && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <ContributorSummary projectId={projectId} />
        </div>
      )}

      {tab === 'history' && (
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <ProjectActivityLog projectId={projectId} />
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen || !!selectedTask}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        projectId={projectId}
        task={selectedTask}
      />

      {showExportModal && (
        <ExportPDFModal 
          projectId={projectId} 
          onClose={() => setShowExportModal(false)} 
        />
      )}
    </div>
  );
};

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return <div>Project not found</div>;

  return (
    <KanbanProvider projectId={id}>
      <ProjectContent projectId={id} />
    </KanbanProvider>
  );
};

export default Project;
