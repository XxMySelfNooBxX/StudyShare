import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <SocketProvider>
        <div className="min-h-screen">
          <div className="bg-mesh" />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
          </Routes>
        </div>
      </SocketProvider>
    </LazyMotion>
  );
}

export default App;
