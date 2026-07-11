import { Request, Response } from 'express';
import { generateProjectPDF, ExportOptions } from '../services/pdfExportService';

export const exportProjectPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const options: ExportOptions = {
      includeComments: req.body.includeComments ?? true,
      includeHistory: req.body.includeHistory ?? true,
      includeContributors: req.body.includeContributors ?? true,
    };

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const pdfBuffer = await generateProjectPDF(projectId, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${projectId}-report.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};
