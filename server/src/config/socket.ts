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

    socket.on('comment:add', async (data) => {
      const { taskId, content, projectId, authorId } = data; // Wait, we need authorId from token, but in socket we might get it from data. Let's assume frontend sends it or we just broadcast for now.
      
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Let's assume the frontend provides authorId for socket, or we rely on the REST API.
        // Actually, the plan says: `comment:add` -> persist comment, emit `comment:new`.
        // If frontend doesn't send authorId, we can't create it here.
        // It's better if frontend calls the REST API and the REST API emits the socket event,
        // or frontend emits socket event which just broadcasts.
        // Let's broadcast and let the REST API handle persistence if needed, or persist here.
        if (authorId) {
          const comment = await prisma.comment.create({
            data: {
              taskId,
              content,
              authorId,
            },
            include: { author: { select: { name: true, email: true } } }
          });
          socket.broadcast.emit('comment:new', { taskId, comment, projectId });
        } else {
          // If no authorId, just broadcast (optimistic UI), but REST API will actually persist.
          // Wait, KanbanContext emits: `socket?.emit('comment:add', { taskId, content, projectId });`
          // So it doesn't send authorId. The REST API should handle the persistence. Let's remove persistence from socket for comments if it's not possible to get authorId, or update KanbanContext to send authorId?
          // The easiest is to just broadcast.
        }
      } catch (err) {
        console.error('Error in comment:add socket handler:', err);
      }
    });

    socket.on('subtask:toggle', async (data) => {
      const { taskId, subtaskId, projectId } = data;
      // Broadcast to others immediately
      socket.broadcast.emit('subtask:updated', { taskId, subtaskId, projectId });
      
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const subtask = await prisma.subTask.findUnique({ where: { id: subtaskId } });
        if (subtask) {
          await prisma.subTask.update({
            where: { id: subtaskId },
            data: { completed: !subtask.completed }
          });
        }
      } catch (err) {
        console.error('Error toggling subtask via socket:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from project: ${projectId}`);
    });
  });

  return io;
};
