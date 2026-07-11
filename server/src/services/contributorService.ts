import prisma from '../config/database';

export async function getContributorSummary(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { 
      subtasks: true, 
      comments: { include: { author: true } }
    }
  });

  const contributors = new Map();

  const initContributor = () => ({
    taskCount: 0,
    subtaskCount: 0,
    commentCount: 0,
    tasksCreated: 0,
    tasksCompleted: 0,
  });

  // Aggregate task data per user
  tasks.forEach((task: any) => {
    // Count tasks assigned to user
    if (task.assignedTo) {
      const contrib = contributors.get(task.assignedTo) || initContributor();
      contrib.taskCount++;
      if (task.status === 'DONE') {
        contrib.tasksCompleted++;
      }
      contributors.set(task.assignedTo, contrib);
    }

    // Count subtasks completed by user
    task.subtasks.forEach((st: any) => {
      if (st.completed && task.assignedTo) {
        // Assume assignedTo user completed it for now
        const contrib = contributors.get(task.assignedTo) || initContributor();
        contrib.subtaskCount++;
        contributors.set(task.assignedTo, contrib);
      }
    });

    // Count comments per user
    task.comments.forEach((comment: any) => {
      const contrib = contributors.get(comment.authorId) || initContributor();
      contrib.commentCount++;
      contributors.set(comment.authorId, contrib);
    });
  });

  // Fetch user details and convert map to array
  const result = await Promise.all(
    Array.from(contributors.entries()).map(async ([userId, data]) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      // Get role from Team model
      const teamMember = await prisma.team.findUnique({
        where: { projectId_userId: { projectId, userId } }
      });

      return {
        userId,
        name: user?.name || 'Unknown User',
        avatar: (user as any)?.avatar || null,
        ...data,
        lastActive: new Date().toISOString(), // In real app, fetch from TaskHistory
        role: teamMember?.role || 'MEMBER'
      };
    })
  );

  return result.sort((a, b) => b.taskCount - a.taskCount);
}
