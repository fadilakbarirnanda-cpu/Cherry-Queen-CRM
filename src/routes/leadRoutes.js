const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');

// GET /api/leads
router.get('/', LeadController.getAllLeads);

// GET /api/leads/:id
router.get('/:id', LeadController.getLeadById);

// POST /api/leads
router.post('/', LeadController.createLead);

// PUT /api/leads/:id
router.put('/:id', LeadController.updateLead);

// DELETE /api/leads/:id
router.delete('/:id', LeadController.deleteLead);

module.exports = router;
