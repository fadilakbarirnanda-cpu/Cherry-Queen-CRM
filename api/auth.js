module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    success: true,
    token: 'mock-jwt-token-cherry-queen',
    user: { id: 1, name: 'Queen Admin', email: 'admin@cherryqueen.id', role: 'admin' }
  });
};