const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/agentController');

// GET /api/agents
router.get('/', AgentController.getAllAgents);

// GET /api/agents/:id
router.get('/:id', AgentController.getAgentById);

// POST /api/agents
router.post('/', AgentController.createAgent);

// PUT /api/agents/:id
router.put('/:id', AgentController.updateAgent);

// DELETE /api/agents/:id
router.delete('/:id', AgentController.deleteAgent);

module.exports = router;
