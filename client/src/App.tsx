import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';

function App() {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
          </Routes>
        </SocketProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}

export default App;
