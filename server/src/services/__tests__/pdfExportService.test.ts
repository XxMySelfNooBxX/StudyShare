import { generateProjectPDF } from '../pdfExportService';
import prisma from '../../config/database';
import * as contributorService from '../contributorService';

jest.mock('../../config/database', () => ({
  project: {
    findUnique: jest.fn(),
  },
  taskHistory: {
    findMany: jest.fn(),
  }
}));

jest.mock('../contributorService', () => ({
  getContributorSummary: jest.fn(),
}));

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn((event, callback) => {
      if (event === 'end') {
        // Trigger end almost immediately
        setTimeout(() => callback(), 10);
      }
    }),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn()
  }));
});

describe('pdfExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error if project not found', async () => {
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
    
    await expect(generateProjectPDF('p1', {
      includeComments: true, includeHistory: true, includeContributors: true
    })).rejects.toThrow('Project not found');
  });

  it('generates PDF buffer successfully', async () => {
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      name: 'Test Project',
      description: 'Desc',
      tasks: [
        { title: 'T1', status: 'DONE', dueDate: new Date() }
      ]
    });

    (contributorService.getContributorSummary as jest.Mock).mockResolvedValue([
      { name: 'Alice', role: 'ADMIN', taskCount: 1, tasksCompleted: 1, commentCount: 0 }
    ]);

    (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
      { timestamp: new Date(), user: { name: 'Alice' }, action: 'task_created', task: { title: 'T1' } }
    ]);

    const result = await generateProjectPDF('p1', {
      includeComments: true, includeHistory: true, includeContributors: true
    });

    expect(Buffer.isBuffer(result)).toBeTruthy();
  });
});
