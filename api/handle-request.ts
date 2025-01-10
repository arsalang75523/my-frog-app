export default function handler(req, res) {
    if (req.method === 'POST') {
      // Handle the request from the frame
      res.status(200).json({ message: 'Request handled successfully' });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  