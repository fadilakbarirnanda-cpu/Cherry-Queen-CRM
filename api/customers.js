module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const mockCustomers = [
    { id: 1, name: 'Budi Santoso', company: 'PT Teknologi Bangsa', email: 'budi@contoh.id', phone: '081234567890', status: 'active', agent_name: 'Rian Pratama', created_at: '2026-10-01' },
    { id: 2, name: 'Siti Rahma', company: 'CV Berkah Utama', email: 'siti@contoh.id', phone: '081987654321', status: 'prospect', agent_name: 'Rian Pratama', created_at: '2026-10-05' }
  ];

  return res.status(200).json({ success: true, data: mockCustomers });
};