import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateSuggestions } from '../services/suggester';
import { calculateUrgency } from '../services/urgencyCalculator';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, title, description, status, position, dueDate, assignedTo, enableSuggestions } = req.body;
    
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status: status || 'TODO',
        position: position || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
      }
    });

    const user = (req as any).user;
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        action: 'task_created',
        changedBy: user?.id || 'system',
        changeDetails: JSON.stringify({ title, status: status || 'TODO' })
      }
    });

    let suggestedSubtasks = null;
    if (enableSuggestions) {
      suggestedSubtasks = generateSuggestions(title, description);
    }

    res.status(201).json({ task, suggestedSubtasks });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
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
        ...(status && { status: status as any }),
        ...(position !== undefined && { position }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo !== undefined && { assignedTo }),
        version: { increment: 1 },
      },
    });

    const user = (req as any).user;
    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'task_updated',
        changedBy: user?.id || userId || 'system',
        changeDetails: JSON.stringify({
          oldValue: { status: task.status, position: task.position, title: task.title, dueDate: task.dueDate, assignedTo: task.assignedTo },
          newValue: { status: updatedTask.status, position: updatedTask.position, title: updatedTask.title, dueDate: updatedTask.dueDate, assignedTo: updatedTask.assignedTo }
        }),
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const user = (req as any).user;
    await prisma.taskHistory.create({
      data: {
        taskId, // Wait, if the task is deleted (Cascade), the history might be deleted. 
        // But let's log it anyway just in case schema is not cascading or we want to keep it.
        // Actually, if we delete task, we can't create history for it if FK fails. Let's do it before delete.
        action: 'task_deleted',
        changedBy: user?.id || 'system',
      }
    }).catch(() => {}); // ignore error if it fails
    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const subtask = await prisma.subTask.create({
      data: {
        taskId,
        title,
      }
    });

    const user = (req as any).user;
    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'subtask_created',
        changedBy: user?.id || 'system',
        changeDetails: JSON.stringify({ subtaskId: subtask.id, title })
      }
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtaskId } = req.params;
    const { completed } = req.body;

    const subtask = await prisma.subTask.update({
      where: { id: subtaskId },
      data: { completed }
    });

    const user = (req as any).user;
    await prisma.taskHistory.create({
      data: {
        taskId: subtask.taskId,
        action: completed ? 'subtask_completed' : 'subtask_uncompleted',
        changedBy: user?.id || 'system',
        changeDetails: JSON.stringify({ subtaskId: subtask.id, title: subtask.title, completed })
      }
    });

    res.status(200).json(subtask);
  } catch (error) {
    console.error('Toggle subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtaskId } = req.params;
    const subtask = await prisma.subTask.findUnique({ where: { id: subtaskId } });
    if (subtask) {
      const user = (req as any).user;
      await prisma.taskHistory.create({
        data: {
          taskId: subtask.taskId,
          action: 'subtask_deleted',
          changedBy: user?.id || 'system',
          changeDetails: JSON.stringify({ subtaskId: subtask.id, title: subtask.title })
        }
      });
    }
    await prisma.subTask.delete({ where: { id: subtaskId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    // req.user should be populated by authenticateToken middleware
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        content,
        authorId: user.id
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'comment_added',
        changedBy: user.id,
        changeDetails: JSON.stringify({ commentId: comment.id, content })
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorId !== user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.taskHistory.create({
      data: {
        taskId: comment.taskId,
        action: 'comment_deleted',
        changedBy: user.id,
        changeDetails: JSON.stringify({ commentId: comment.id })
      }
    });

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId, dueDate: { not: null } },
      orderBy: { dueDate: 'asc' }
    });

    const timelineMap: Record<string, any> = {};

    tasks.forEach((task: any) => {
      if (!task.dueDate) return;
      const dateStr = task.dueDate.toISOString().split('T')[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = {
          dueDate: dateStr,
          urgency: calculateUrgency(task.dueDate),
          tasks: []
        };
      }
      timelineMap[dateStr].tasks.push(task);
    });

    const timeline = Object.values(timelineMap).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    res.status(200).json({ timeline });
  } catch (error) {
    console.error('Fetch timeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    const history = await prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    const formattedHistory = history.map((h: any) => ({
      ...h,
      changedByName: h.user?.name,
      changeDetails: h.changeDetails ? JSON.parse(h.changeDetails) : null
    }));

    res.status(200).json({ history: formattedHistory });
  } catch (error) {
    console.error('Get task history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    // First get all task IDs for this project
    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: { id: true, title: true }
    });
    
    const taskMap = new Map(tasks.map((t: any) => [t.id, t.title]));
    const taskIds = tasks.map((t: any) => t.id);
    
    const history = await prisma.taskHistory.findMany({
      where: { taskId: { in: taskIds } },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } }
    });

    const formattedHistory = history.map((h: any) => ({
      ...h,
      taskTitle: taskMap.get(h.taskId) || 'Unknown Task',
      changedByName: h.user?.name,
      changeDetails: h.changeDetails ? JSON.parse(h.changeDetails) : null
    }));

    res.status(200).json({ activity: formattedHistory });
  } catch (error) {
    console.error('Get project activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

