module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url;

  const mockUsers = [
    { id: 1, name: 'Queen Admin', email: 'admin@cherryqueen.id', role: 'admin' },
    { id: 2, name: 'Rian Pratama', email: 'rian.pratama@cherryqueen.id', role: 'sales' }
  ];

  const mockCustomers = [
    { id: 1, name: 'Budi Santoso', company: 'PT Teknologi Bangsa', email: 'budi@contoh.id', phone: '081234567890', status: 'active', agent_name: 'Rian Pratama', created_at: '2026-10-01' },
    { id: 2, name: 'Siti Rahma', company: 'CV Berkah Utama', email: 'siti@contoh.id', phone: '081987654321', status: 'prospect', agent_name: 'Rian Pratama', created_at: '2026-10-05' }
  ];

  const mockDeals = [
    { id: 101, title: 'Paket Skincare Bulk Purchase', customer_id: 1, customer_name: 'Budi Santoso', value: 15000000, stage: 'negotiation', expected_close_date: '2026-11-01', agent_name: 'Rian Pratama' }
  ];

  if (url.includes('/auth/login')) {
    return res.status(200).json({ success: true, token: 'mock-jwt-token-cherry-queen', user: mockUsers[0] });
  }

  if (url.includes('/customers')) {
    return res.status(200).json({ success: true, data: mockCustomers });
  }

  if (url.includes('/deals')) {
    return res.status(200).json({ success: true, data: mockDeals });
  }

  if (url.includes('/agents')) {
    return res.status(200).json({ success: true, data: mockUsers });
  }

  if (url.includes('/leads') || url.includes('/wa-templates')) {
    return res.status(200).json({ success: true, data: [] });
  }

  return res.status(200).json({ success: true, message: 'Cherry Queen CRM API Active' });
};