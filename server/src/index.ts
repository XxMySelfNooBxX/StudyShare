import express from 'express';
import cors from 'express'; // Need to import express for typings or just use standard cors
import corsMiddleware from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSocket } from './config/socket';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(corsMiddleware());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);

// Socket.io
setupSocket(httpServer);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
