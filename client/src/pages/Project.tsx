import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinProject, leaveProject } = useSocket();

  useEffect(() => {
    if (id) {
      // Mock auth token and userId for phase 1
      joinProject(id, 'mock_token', 'mock_user_123');
    }
    return () => leaveProject();
  }, [id, joinProject, leaveProject]);

  return (
    <div className="h-screen flex flex-col p-8">
      <m.div
        layoutId={`project-card-${id}`}
        className="bg-cardBg border border-slate-700/50 p-6 rounded-xl mb-8 flex justify-between items-center"
      >
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white mb-2 text-sm flex items-center transition-colors"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Project {id}: Board</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-brandAccent animate-pulse" />
          <span className="text-sm text-slate-400">Live Sync Active</span>
        </div>
      </m.div>

      <div className="flex-1 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">Phase 1 infrastructure complete.</p>
          <p className="text-slate-500 text-sm">Kanban board will be built here in Phase 2.</p>
        </div>
      </div>
    </div>
  );
};

export default Project;
