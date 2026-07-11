import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createTask,
  updateTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addComment,
  getComments,
  deleteComment,
  getTimeline,
  getTaskHistory,
  getProjectActivity,
} from '../controllers/taskController';
import { getContributors } from '../controllers/contributorController';
import { exportProjectPDF } from '../controllers/pdfExportController';
import prisma from '../config/database';

const router = Router();

// GET /api/v1/projects/:projectId/tasks
// Needs to be here or in controller. We'll leave it here to avoid refactoring get tasks if not needed, but protect it.
router.get('/projects/:projectId/tasks', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: { comments: true, subtasks: true }
        },
        subtasks: {
          where: { completed: true }
        }
      }
    });

    // Transform count into the format expected by frontend
    const tasksWithCounts = tasks.map((t: any) => ({
      ...t,
      commentCount: t._count.comments,
      subtaskCount: t._count.subtasks,
      completedSubtaskCount: t.subtasks.length
    }));

    const tasksByStatus = {
      BACKLOG: tasksWithCounts.filter((t: any) => t.status === 'BACKLOG'),
      TODO: tasksWithCounts.filter((t: any) => t.status === 'TODO'),
      IN_PROGRESS: tasksWithCounts.filter((t: any) => t.status === 'IN_PROGRESS'),
      DONE: tasksWithCounts.filter((t: any) => t.status === 'DONE'),
    };

    res.status(200).json({ tasks: tasksByStatus });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All subsequent routes require JWT auth
router.use(authenticateToken);

// Timeline route
router.get('/projects/:projectId/timeline', getTimeline);

// Contributors and PDF Export routes
router.get('/projects/:projectId/contributors', getContributors);
router.post('/projects/:projectId/export/pdf', exportProjectPDF);
router.get('/projects/:projectId/activity', getProjectActivity);


// Task CRUD
router.post('/', createTask); // POST /api/v1/tasks
router.put('/:taskId', updateTask); // PUT /api/v1/tasks/:taskId
router.delete('/:taskId', deleteTask); // DELETE /api/v1/tasks/:taskId

// Sub-task routes
router.post('/:taskId/subtasks', addSubtask); // POST /api/v1/tasks/:taskId/subtasks
router.put('/subtasks/:subtaskId', toggleSubtask); // PUT /api/v1/subtasks/:subtaskId (toggle completion)
router.delete('/subtasks/:subtaskId', deleteSubtask); // DELETE /api/v1/subtasks/:subtaskId

// Comment routes
router.post('/:taskId/comments', addComment); // POST /api/v1/tasks/:taskId/comments
router.get('/:taskId/comments', getComments); // GET /api/v1/tasks/:taskId/comments
router.delete('/comments/:commentId', deleteComment); // DELETE /api/v1/comments/:commentId

// History route
router.get('/:taskId/history', getTaskHistory); // GET /api/v1/tasks/:taskId/history

export default router;
