const express = require('express');
const router = express.Router();
const DealController = require('../controllers/dealController');

// GET /api/deals
router.get('/', DealController.getAllDeals);

// GET /api/deals/:id
router.get('/:id', DealController.getDealById);

// POST /api/deals
router.post('/', DealController.createDeal);

// PUT /api/deals/:id
router.put('/:id', DealController.updateDeal);

// DELETE /api/deals/:id
router.delete('/:id', DealController.deleteDeal);

module.exports = router;
