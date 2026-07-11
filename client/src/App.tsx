import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';

function App() {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
          </Routes>
        </ToastProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}

export default App;
