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
      // Broadcast presence (Figma style indicators in later phases)
      socket.broadcast.emit('user-joined', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from project: ${projectId}`);
    });
  });

  return io;
};
