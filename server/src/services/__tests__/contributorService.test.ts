import { getContributorSummary } from '../contributorService';
import prisma from '../../config/database';

jest.mock('../../config/database', () => ({
  task: {
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  team: {
    findUnique: jest.fn(),
  }
}));

describe('contributorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates contributor data correctly', async () => {
    const mockTasks = [
      {
        id: 't1',
        projectId: 'p1',
        assignedTo: 'user1',
        status: 'DONE',
        subtasks: [
          { completed: true }
        ],
        comments: [
          { authorId: 'user1' }
        ]
      },
      {
        id: 't2',
        projectId: 'p1',
        assignedTo: 'user2',
        status: 'IN_PROGRESS',
        subtasks: [
          { completed: false }
        ],
        comments: [
          { authorId: 'user1' },
          { authorId: 'user2' }
        ]
      }
    ];

    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
    
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where: { id } }) => {
      if (id === 'user1') return Promise.resolve({ id: 'user1', name: 'Alice' });
      if (id === 'user2') return Promise.resolve({ id: 'user2', name: 'Bob' });
      return Promise.resolve(null);
    });

    (prisma.team.findUnique as jest.Mock).mockImplementation(({ where: { projectId_userId } }) => {
      if (projectId_userId.userId === 'user1') return Promise.resolve({ role: 'ADMIN' });
      return Promise.resolve({ role: 'MEMBER' });
    });

    const result = await getContributorSummary('p1');
    
    expect(result).toHaveLength(2);
    
    // Sort logic places user1 (1 task) and user2 (1 task). If tie, stable sort or whatever.
    const alice = result.find(r => r.userId === 'user1');
    const bob = result.find(r => r.userId === 'user2');

    expect(alice).toMatchObject({
      name: 'Alice',
      role: 'ADMIN',
      taskCount: 1,
      tasksCompleted: 1,
      subtaskCount: 1,
      commentCount: 2
    });

    expect(bob).toMatchObject({
      name: 'Bob',
      role: 'MEMBER',
      taskCount: 1,
      tasksCompleted: 0,
      subtaskCount: 0,
      commentCount: 1
    });
  });
});
