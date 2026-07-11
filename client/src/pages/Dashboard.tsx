import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="bg-mesh" />

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        zIndex: 30,
        padding: '0 0 20px',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
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
          {[
            { icon: '⊞', label: 'Projects', active: true },
            { icon: '✓', label: 'My Tasks' },
            { icon: '📅', label: 'Calendar' },
            { icon: '📊', label: 'Analytics' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', marginBottom: 2,
                background: item.active ? 'var(--accent-muted)' : 'transparent',
                color: item.active ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.85rem', fontWeight: item.active ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User area */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'white',
              flexShrink: 0,
            }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Shaurya</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Student</div>
            </div>
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}
              title="Logout"
            >
              →
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
              Projects
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {loading ? '–' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px 7px 30px',
                fontSize: '0.8rem', color: 'var(--text-primary)',
                outline: 'none', width: 200,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button className="btn-primary" style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </button>
        </header>

        <div style={{ padding: '32px' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Projects', value: '3', icon: '⊞', color: '#6366f1' },
              { label: 'Tasks Completed', value: '26', icon: '✓', color: '#22c55e' },
              { label: 'Active Deadlines', value: '4', icon: '⏰', color: '#f59e0b' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${stat.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>
                  {stat.icon}
                </div>
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
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layoutId={`project-card-${project.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    onClick={() => navigate(`/project/${project.id}`)}
                    onHoverStart={() => setHovered(project.id)}
                    onHoverEnd={() => setHovered(null)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${hovered === project.id ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      boxShadow: hovered === project.id ? 'var(--shadow-md)' : 'none',
                      overflow: 'hidden',
                      position: 'relative',
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

                    {/* Progress */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {project.tasks.done}/{project.tasks.total} tasks
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-highlight)', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ delay: i * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
                          style={{ height: '100%', background: `linear-gradient(90deg, ${project.color}, ${project.color}aa)`, borderRadius: 99 }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                      {/* Avatars */}
                      <div style={{ display: 'flex' }}>
                        {project.members.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                              border: '2px solid var(--bg-surface)',
                              marginLeft: idx > 0 ? -8 : 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.6rem', fontWeight: 700, color: 'white',
                            }}
                          >{m}</div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Updated {project.updatedAt}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
