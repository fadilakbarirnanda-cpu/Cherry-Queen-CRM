const express = require('express');
const router = express.Router();

const customerRoutes = require('./customerRoutes');
const leadRoutes = require('./leadRoutes');
const dealRoutes = require('./dealRoutes');
const agentRoutes = require('./agentRoutes');

// Root API Health Check & Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di CRM REST API Backend',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      leads: '/api/leads',
      deals: '/api/deals',
      agents: '/api/agents',
    },
  });
});

router.use('/customers', customerRoutes);
router.use('/leads', leadRoutes);
router.use('/deals', dealRoutes);
router.use('/agents', agentRoutes);

module.exports = router;
