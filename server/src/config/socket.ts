import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  const projectNamespace = io.of(/^\/project\/[a-zA-Z0-9-]+$/);

  projectNamespace.on('connection', (socket: Socket) => {
    const namespace = socket.nsp.name;
    const projectId = namespace.split('/').pop();
    
    console.log(`Client connected to project room: ${projectId}`);
    
    // In Phase 2, this will be expanded for real-time task sync
    
    socket.on('join-project', (data) => {
      console.log(`User ${data.userId} joined project ${projectId}`);
      socket.broadcast.emit('user-joined', { userId: data.userId });
    });

    socket.on('task:move', async (data) => {
      const { taskId, newStatus, newPosition, userId, version } = data;
      
      // Basic conflict detection (for MVP we'll trust the client if version matches or skip strict checks)
      // In a real app we'd query the DB first. For now, broadcast instantly.
      socket.broadcast.emit('task:move', data);
      
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.task.update({
          where: { id: taskId },
          data: { status: newStatus, position: newPosition, version: { increment: 1 } }
        });
        
        await prisma.taskHistory.create({
          data: {
            taskId,
            action: 'MOVE',
            changedBy: userId,
            changeDetails: JSON.stringify({ status: newStatus, position: newPosition }),
          },
        });
      } catch (err) {
        console.error('Error updating task on move:', err);
      }
    });

    socket.on('task:update', async (data) => {
      const { taskId, updates, userId } = data;
      socket.broadcast.emit('task:update', data);
      
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.task.update({
          where: { id: taskId },
          data: { ...updates, version: { increment: 1 } }
        });
        
        await prisma.taskHistory.create({
          data: {
            taskId,
            action: 'UPDATE',
            changedBy: userId,
            changeDetails: JSON.stringify(updates),
          },
        });
      } catch (err) {
        console.error('Error updating task details:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from project: ${projectId}`);
    });
  });

  return io;
};
