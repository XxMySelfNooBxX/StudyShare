import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { KanbanProvider, useKanban, Task } from '../context/KanbanContext';
import KanbanBoard from '../components/KanbanBoard';

const ProjectContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const navigate = useNavigate();
  const { joinProject, leaveProject } = useSocket();
  const { setTasks } = useKanban();
  const [loading, setLoading] = useState(true);

  // Mock user for MVP Phase 1 & 2
  const userId = 'mock_user_123';

  useEffect(() => {
    joinProject(projectId, 'mock_token', userId);

    // Fetch tasks from backend
    fetch(`http://localhost:5000/api/v1/projects/${projectId}/tasks`)
      .then(res => res.json())
      .then(data => {
        if (data.tasks) {
          setTasks(data.tasks);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tasks, using empty board', err);
        setLoading(false);
      });

    return () => leaveProject();
  }, [projectId, joinProject, leaveProject, setTasks]);

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 pt-8">
      <m.div
        layoutId={`project-card-${projectId}`}
        className="bg-cardBg border border-slate-700/50 p-4 md:p-6 rounded-xl mb-6 flex justify-between items-center shadow-lg"
      >
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-brandAccent mb-1 text-sm flex items-center transition-colors"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">Project: Web Dev Coursework</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-brandAccent animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Live Sync</span>
        </div>
      </m.div>

      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brandAccent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <KanbanBoard projectId={projectId} userId={userId} />
        )}
      </div>
    </div>
  );
};

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return <div>Project not found</div>;

  return (
    <KanbanProvider>
      <ProjectContent projectId={id} />
    </KanbanProvider>
  );
};

export default Project;
