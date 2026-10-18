const express = require('express');
const app = express();

app.use(express.json());

// Mock Data
const mockUsers = [
  { id: 1, name: 'Queen Admin', email: 'admin@cherryqueen.id', role: 'admin' },
  { id: 2, name: 'Rian Pratama', email: 'rian.pratama@cherryqueen.id', role: 'sales' }
];

const mockCustomers = [
  { id: 1, name: 'Budi Santoso', company: 'PT Teknologi Bangsa', email: 'budi@contoh.id', phone: '081234567890', status: 'active', agent_name: 'Rian Pratama', created_at: '2026-10-01' },
  { id: 2, name: 'Siti Rahma', company: 'CV Berkah Utama', email: 'siti@contoh.id', phone: '081987654321', status: 'prospect', agent_name: 'Rian Pratama', created_at: '2026-10-05' }
];

// Endpoint API
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ success: true, token: 'mock-token', user: mockUsers[0] });
});

app.get('/api/customers', (req, res) => {
  res.status(200).json({ success: true, data: mockCustomers });
});

app.post('/api/customers', (req, res) => {
  res.status(200).json({ success: true, data: { id: Date.now(), ...req.body } });
});

app.get('/api/deals', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

app.get('/api/agents', (req, res) => {
  res.status(200).json({ success: true, data: mockUsers });
});

app.get('/api/leads', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

app.get('/api/wa-templates', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

module.exports = app;