import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { TaskStatus } from '@prisma/client';

const router = Router();

// GET /api/v1/projects/:projectId/tasks
router.get('/projects/:projectId/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });

    const tasksByStatus = {
      BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
      TODO: tasks.filter((t) => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter((t) => t.status === 'DONE'),
    };

    res.status(200).json({ tasks: tasksByStatus });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/tasks/:taskId
router.put('/tasks/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status, position, title, description, dueDate, assignedTo, userId } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && { status: status as TaskStatus }),
        ...(position !== undefined && { position }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate }),
        ...(assignedTo !== undefined && { assignedTo }),
        version: { increment: 1 },
      },
    });

    // Auto-record history
    if (userId && (status || position !== undefined)) {
      await prisma.taskHistory.create({
        data: {
          taskId,
          action: 'UPDATE',
          changedBy: userId,
          changeDetails: JSON.stringify({ status, position }),
        },
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
