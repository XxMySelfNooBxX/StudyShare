import PDFDocument from 'pdfkit';
import prisma from '../config/database';
import { getContributorSummary } from './contributorService';

export interface ExportOptions {
  includeComments: boolean;
  includeHistory: boolean;
  includeContributors: boolean;
}

export async function generateProjectPDF(projectId: string, options: ExportOptions): Promise<Buffer> {
  const project = await prisma.project.findUnique({ 
    where: { id: projectId },
    include: { tasks: { include: { subtasks: true, comments: true } } }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', chunk => chunks.push(chunk));
  
  // Return promise that resolves when doc is ended
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  // Title
  doc.fontSize(24).text(project.name, { align: 'center' });
  doc.moveDown();
  if (project.description) {
    doc.fontSize(12).text(project.description, { align: 'center' });
    doc.moveDown();
  }
  
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  // Summary
  doc.fontSize(16).text('Project Summary', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12)
    .text(`Total Tasks: ${project.tasks.length}`)
    .text(`Completed: ${project.tasks.filter((t: any) => t.status === 'DONE').length}`)
    .text(`In Progress: ${project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length}`)
    .text(`To Do: ${project.tasks.filter((t: any) => t.status === 'TODO').length}`)
    .text(`Backlog: ${project.tasks.filter((t: any) => t.status === 'BACKLOG').length}`);
  
  doc.moveDown(2);

  // Tasks breakdown
  doc.fontSize(16).text('Tasks Overview', { underline: true });
  doc.moveDown(0.5);
  
  project.tasks.forEach((task: any) => {
    doc.fontSize(12).text(`• ${task.title} [${task.status}]`);
    doc.fontSize(10).fillColor('gray').text(`  Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}`);
    doc.fillColor('black'); // Reset color
    doc.moveDown(0.5);
  });

  // Contributors
  if (options.includeContributors) {
    doc.addPage();
    doc.fontSize(16).text('Contributors', { underline: true });
    doc.moveDown();

    const contributors = await getContributorSummary(projectId);
    
    contributors.forEach(c => {
      doc.fontSize(12).text(`${c.name} (${c.role})`);
      doc.fontSize(10).text(`Tasks: ${c.taskCount} | Completed: ${c.tasksCompleted} | Comments: ${c.commentCount}`);
      doc.moveDown(0.5);
    });
  }

  // History
  if (options.includeHistory) {
    doc.addPage();
    doc.fontSize(16).text('Recent Activity Timeline', { underline: true });
    doc.moveDown();

    // Fetch history across all tasks in project (up to 50 items)
    const taskIds = project.tasks.map((t: any) => t.id);
    const history = await prisma.taskHistory.findMany({
      where: { taskId: { in: taskIds } },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { user: true, task: true }
    });

    history.forEach((h: any) => {
      doc.fontSize(10).text(`${new Date(h.timestamp).toLocaleString()} - ${h.user.name} - ${h.action} on "${h.task.title}"`);
      doc.moveDown(0.2);
    });
  }

  doc.end();

  return pdfPromise;
}
