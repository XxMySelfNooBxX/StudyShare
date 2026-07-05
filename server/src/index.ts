import express from 'express';
import corsMiddleware from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSocket } from './config/socket';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(corsMiddleware());
app.use(express.json());

// Setup Socket.io
setupSocket(httpServer);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', tasksRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io server ready for connections`);
});

export default httpServer;