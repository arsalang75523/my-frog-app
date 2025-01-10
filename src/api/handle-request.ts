import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.body;
  if (!fid) {
    return res.status(400).json({ error: 'FID is required' });
  }

  try {
    // Mock response, replace with actual API call logic
    const mockData = { fid, earnings: 123, interactions: 456 };
    return res.status(200).json(mockData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
