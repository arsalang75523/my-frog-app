export default function handler(req, res) {
    if (req.method === 'POST') {
      // Handle the share action
      res.status(200).json({ message: 'Share action processed successfully' });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  