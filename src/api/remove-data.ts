import { NextApiRequest, NextApiResponse } from 'next';

export default async (_: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({ message: 'Data removed successfully!' });
};
