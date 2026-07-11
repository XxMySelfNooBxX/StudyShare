import { Request, Response } from 'express';
import { getContributorSummary } from '../services/contributorService';

export const getContributors = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    
    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const contributors = await getContributorSummary(projectId);
    
    res.status(200).json({ contributors });
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
};
