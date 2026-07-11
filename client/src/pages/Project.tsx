import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanProvider, useKanban } from '../context/KanbanContext';
import KanbanBoard from '../components/KanbanBoard';
import { TaskModal } from '../components/TaskModal';
import { TimelineView } from '../components/TimelineView';
import { DeadlineAlert } from '../components/DeadlineAlert';
import { ContributorSummary } from '../components/ContributorSummary';
import { ProjectActivityLog } from '../components/ProjectActivityLog';
import { ExportPDFModal } from '../components/ExportPDFModal';

type Tab = 'board' | 'contributors' | 'history';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'board',
    label: 'Board',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></svg>,
  },
  {
    id: 'contributors',
    label: 'Contributors',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    id: 'history',
    label: 'Activity',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  },
];

const ProjectContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const navigate = useNavigate();
  const { loading, error, selectedTask, setSelectedTask, getCriticalTasks } = useKanban();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('board');
  const [showExportModal, setShowExportModal] = useState(false);
  const criticalTasks = getCriticalTasks();

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-mesh" />

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        zIndex: 10,
        position: 'relative',
      }}>
        {/* Logo / Back */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.8rem',
              fontFamily: 'inherit', padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s',
              width: '100%',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            All Projects
          </button>
        </div>

        {/* Project info */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          </div>
          <h1 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Web Dev Coursework
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Team workspace · 3 members
          </p>

          {/* Live sync badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 10, padding: '4px 8px',
            background: 'var(--green-muted)',
            borderRadius: 99, fontSize: '0.7rem', color: 'var(--green)',
            fontWeight: 600,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', position: 'relative' }} className="live-dot" />
            Live Sync
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 10px', borderRadius: 'var(--radius-md)',
                background: tab === t.id ? 'var(--accent-muted)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.84rem', fontWeight: tab === t.id ? 600 : 400,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', gap: 9 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(13,14,20,0.85)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Projects</span>
              <span>/</span>
              <span style={{ color: 'var(--text-secondary)' }}>Web Dev Coursework</span>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{tab}</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </button>
        </header>

        {/* Deadline alert */}
        {tab === 'board' && criticalTasks.length > 0 && (
          <DeadlineAlert criticalCount={criticalTasks.length} />
        )}

        {/* Timeline */}
        {tab === 'board' && <TimelineView />}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {tab === 'board' && (
              <div style={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="var(--border-medium)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading tasks…</span>
                  </div>
                ) : error ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: '2rem' }}>⚠️</div>
                    <p style={{ color: 'var(--rose)', fontSize: '0.875rem', maxWidth: 320, textAlign: 'center' }}>{error}</p>
                    <button className="btn-ghost" onClick={() => window.location.reload()}>Retry</button>
                  </div>
                ) : (
                  <KanbanBoard />
                )}
              </div>
            )}

            {tab === 'contributors' && (
              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                <ContributorSummary projectId={projectId} />
              </div>
            )}

            {tab === 'history' && (
              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                <ProjectActivityLog projectId={projectId} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen || !!selectedTask}
        onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
        projectId={projectId}
        task={selectedTask}
      />

      {showExportModal && (
        <ExportPDFModal projectId={projectId} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Project not found</div>;
  return (
    <KanbanProvider projectId={id}>
      <ProjectContent projectId={id} />
    </KanbanProvider>
  );
};

export default Project;
