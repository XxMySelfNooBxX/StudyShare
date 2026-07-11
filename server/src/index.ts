import express from 'express';
import corsMiddleware from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSocket } from './config/socket';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet());

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Middleware
app.use(corsMiddleware());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Setup Socket.io
setupSocket(httpServer);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', tasksRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io server ready for connections`);
});

export default httpServer;