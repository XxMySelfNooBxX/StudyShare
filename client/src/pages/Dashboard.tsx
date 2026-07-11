import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NewProjectModal } from '../components/NewProjectModal';
import { useToast } from '../context/ToastContext';

const INITIAL_PROJECTS = [
  {
    id: '1',
    name: 'Web Dev Coursework',
    description: 'Build a full-stack web app with user auth, real-time sync, and Kanban board',
    status: 'Active',
    progress: 68,
    tasks: { total: 24, done: 16 },
    members: ['A', 'B', 'C'],
    updatedAt: '2h ago',
    color: '#6366f1',
  },
  {
    id: '2',
    name: 'ML Research Paper',
    description: 'Survey of transformer architectures for NLP classification tasks',
    status: 'Active',
    progress: 42,
    tasks: { total: 18, done: 8 },
    members: ['D', 'E'],
    updatedAt: '1d ago',
    color: '#8b5cf6',
  },
  {
    id: '3',
    name: 'Group Presentation',
    description: 'End-of-term presentation on distributed systems and consensus algorithms',
    status: 'Planning',
    progress: 15,
    tasks: { total: 10, done: 2 },
    members: ['F', 'A', 'G'],
    updatedAt: '3d ago',
    color: '#06b6d4',
  },
];

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#f43f5e','#f59e0b','#22c55e','#ec4899'];

type NavView = 'projects' | 'tasks' | 'calendar' | 'analytics';

const NAV_ITEMS: { id: NavView; label: string; icon: React.ReactNode }[] = [
  {
    id: 'projects',
    label: 'Projects',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
];

const MOCK_TASKS = [
  { id: 't1', title: 'Implement auth middleware', project: 'Web Dev Coursework', status: 'In Progress', due: '2026-07-15' },
  { id: 't2', title: 'Write introduction chapter', project: 'ML Research Paper', status: 'Todo', due: '2026-07-20' },
  { id: 't3', title: 'Prepare slide deck', project: 'Group Presentation', status: 'Backlog', due: '2026-07-25' },
  { id: 't4', title: 'Fix CORS error on /api/v1/tasks', project: 'Web Dev Coursework', status: 'Done', due: '2026-07-10' },
  { id: 't5', title: 'Run transformer benchmarks', project: 'ML Research Paper', status: 'In Progress', due: '2026-07-18' },
];

const MOCK_CALENDAR_EVENTS = [
  { date: '2026-07-15', label: 'Auth middleware due', color: '#6366f1' },
  { date: '2026-07-17', label: 'Team standup', color: '#22c55e' },
  { date: '2026-07-20', label: 'Research chapter draft', color: '#8b5cf6' },
  { date: '2026-07-25', label: 'Presentation day', color: '#f43f5e' },
];

// ─── Sub-views ─────────────────────────────────────────────────────

const TasksView: React.FC = () => (
  <div>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Tasks</h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>{MOCK_TASKS.length} tasks across all projects</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {MOCK_TASKS.map(task => {
        const statusColor = task.status === 'Done' ? '#22c55e' : task.status === 'In Progress' ? '#f59e0b' : task.status === 'Todo' ? '#6366f1' : '#5b5e73';
        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: `3px solid ${statusColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>{task.title}</p>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{task.project}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: `${statusColor}20`, color: statusColor,
              }}>{task.status}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {new Date(task.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const CalendarView: React.FC = () => {
  const today = new Date('2026-07-11');
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Calendar — July 2026</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>{MOCK_CALENDAR_EVENTS.length} upcoming events</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
        {/* offset for July 2026 starting on Wednesday */}
        {[null, null].map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = `2026-07-${String(day).padStart(2, '0')}`;
          const event = MOCK_CALENDAR_EVENTS.find(e => e.date === dateStr);
          const isToday = day === today.getDate();
          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                cursor: 'pointer',
                background: isToday ? 'var(--accent-muted)' : event ? `${event.color}15` : 'var(--bg-surface)',
                border: `1px solid ${isToday ? 'var(--accent)' : event ? `${event.color}40` : 'var(--border-subtle)'}`,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-primary)' }}>{day}</span>
              {event && <div style={{ width: 5, height: 5, borderRadius: '50%', background: event.color, margin: '3px auto 0' }} />}
            </motion.div>
          );
        })}
      </div>
      <div>
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upcoming</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_CALENDAR_EVENTS.map(event => (
            <div key={event.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: event.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', flex: 1 }}>{event.label}</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalyticsView: React.FC = () => {
  const barData = [
    { label: 'Backlog', count: 8, color: '#5b5e73' },
    { label: 'Todo', count: 6, color: '#6366f1' },
    { label: 'In Progress', count: 10, color: '#f59e0b' },
    { label: 'Done', count: 26, color: '#22c55e' },
  ];
  const max = Math.max(...barData.map(d => d.count));
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analytics</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>Overview of all your project tasks</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Completion Rate', value: '68%', sub: 'across all projects', color: '#22c55e' },
          { label: 'Tasks This Week', value: '7', sub: 'created or updated', color: '#6366f1' },
          { label: 'Overdue Tasks', value: '2', sub: 'need attention', color: '#f43f5e' },
          { label: 'Avg. Task Duration', value: '4.2d', sub: 'from creation to done', color: '#f59e0b' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{stat.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Tasks by Status</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {barData.map((item, i) => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.count}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-highlight)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / max) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: item.color, borderRadius: 99 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavView>('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('You have been logged out', 'info', '👋');
    setTimeout(() => navigate('/login'), 600);
  };

  const handleNewProject = (newProj: { id: string; name: string; description: string; color: string }) => {
    setProjects(prev => [...prev, {
      ...newProj,
      status: 'Active',
      progress: 0,
      tasks: { total: 0, done: 0 },
      members: ['S'],
      updatedAt: 'just now',
    }]);
    setActiveNav('projects');
    showToast(`"${newProj.name}" created successfully!`, 'success', '🎉');
  };

  const mainTitle: Record<NavView, string> = {
    projects: 'Projects',
    tasks: 'My Tasks',
    calendar: 'Calendar',
    analytics: 'Analytics',
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', position: 'relative' }}>
      {/* ── Animated Background ── */}
      <div className="animated-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>
      <div className="grid-overlay" />

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: 'rgba(19,20,28,0.9)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>StudyShare</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Workspace</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 10px', borderRadius: 'var(--radius-md)',
                background: activeNav === item.id ? 'var(--accent-muted)' : 'transparent',
                color: activeNav === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.85rem', fontWeight: activeNav === item.id ? 600 : 400,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 2, textAlign: 'left', transition: 'background 0.15s, color 0.15s',
              }}
            >
              {item.icon}
              {item.label}
              {item.id === 'tasks' && (
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', background: 'var(--accent-muted)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
                  {MOCK_TASKS.filter(t => t.status !== 'Done').length}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User area */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Shaurya</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Student</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, minHeight: '100dvh', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <header style={{
          padding: '16px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'rgba(13,14,20,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {mainTitle[activeNav]}
            </h1>
            {activeNav === 'projects' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {loading ? '–' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>

          {activeNav === 'projects' && (
            <>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: '7px 12px 7px 30px',
                    fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none', width: 200, fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
              </div>

              <button
                className="btn-primary"
                style={{ gap: 6 }}
                onClick={() => setShowNewProject(true)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                New Project
              </button>
            </>
          )}
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeNav === 'projects' && (
                <>
                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                    {[
                      { label: 'Total Projects', value: String(projects.length), icon: '⊞', color: '#6366f1' },
                      { label: 'Tasks Completed', value: String(projects.reduce((s, p) => s + p.tasks.done, 0)), icon: '✓', color: '#22c55e' },
                      { label: 'Active Deadlines', value: '4', icon: '⏰', color: '#f59e0b' },
                    ].map(stat => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: 'rgba(19,20,28,0.7)', backdropFilter: 'blur(12px)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)', padding: '18px 20px',
                          display: 'flex', alignItems: 'center', gap: 14,
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${stat.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                        }}>{stat.icon}</div>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stat.value}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Projects grid */}
                  {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
                      <p style={{ fontSize: '0.9rem' }}>No projects match "{search}"</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                      {filtered.map((project, i) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          onClick={() => navigate(`/project/${project.id}`)}
                          onHoverStart={() => setHovered(project.id)}
                          onHoverEnd={() => setHovered(null)}
                          style={{
                            background: 'rgba(19,20,28,0.8)', backdropFilter: 'blur(12px)',
                            border: `1px solid ${hovered === project.id ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
                            boxShadow: hovered === project.id ? 'var(--shadow-md)' : 'none',
                            overflow: 'hidden', position: 'relative',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                        >
                          {/* Color accent bar */}
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                            background: `linear-gradient(90deg, ${project.color}, ${project.color}88)`,
                            borderRadius: '14px 14px 0 0',
                          }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {project.name}
                              </h2>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {project.description}
                              </p>
                            </div>
                            <span className={`tag ${project.status === 'Active' ? 'tag-green' : 'tag-accent'}`} style={{ marginLeft: 10, flexShrink: 0 }}>
                              {project.status}
                            </span>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.72rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{project.tasks.done}/{project.tasks.total} tasks</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--bg-highlight)', borderRadius: 99, overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                transition={{ delay: i * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
                                style={{ height: '100%', background: `linear-gradient(90deg, ${project.color}, ${project.color}99)`, borderRadius: 99 }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                            <div style={{ display: 'flex' }}>
                              {project.members.map((m, idx) => (
                                <div key={idx} style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                                  border: '2px solid var(--bg-surface)',
                                  marginLeft: idx > 0 ? -8 : 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.6rem', fontWeight: 700, color: 'white',
                                }}>{m}</div>
                              ))}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Updated {project.updatedAt}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeNav === 'tasks' && <TasksView />}
              {activeNav === 'calendar' && <CalendarView />}
              {activeNav === 'analytics' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={handleNewProject}
        />
      )}
    </div>
  );
};

export default Dashboard;
