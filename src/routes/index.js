const express = require('express');
const router = express.Router();

const customerRoutes = require('./customerRoutes');
const leadRoutes = require('./leadRoutes');
const dealRoutes = require('./dealRoutes');
const agentRoutes = require('./agentRoutes');
const authRoutes = require('./authRoutes');
const waTemplateRoutes = require('./waTemplateRoutes');

// Root API Health Check & Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di Cherry Queen CRM REST API Backend',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      leads: '/api/leads',
      deals: '/api/deals',
      agents: '/api/agents',
      waTemplates: '/api/wa-templates',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/leads', leadRoutes);
router.use('/deals', dealRoutes);
router.use('/agents', agentRoutes);
router.use('/wa-templates', waTemplateRoutes);

module.exports = router;
