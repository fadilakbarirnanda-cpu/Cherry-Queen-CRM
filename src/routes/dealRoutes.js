const express = require('express');
const router = express.Router();
const DealController = require('../controllers/dealController');
const { optionalAuth, requireAuth } = require('../middlewares/auth');

// Pasang optionalAuth pada rute deals
router.use(optionalAuth);

// GET /api/deals
router.get('/', DealController.getAllDeals);

// GET /api/deals/:id
router.get('/:id', DealController.getDealById);

// POST /api/deals
router.post('/', DealController.createDeal);

// PUT /api/deals/:id
router.put('/:id', DealController.updateDeal);

// DELETE /api/deals/:id (dengan proteksi autentikasi JWT)
router.delete('/:id', requireAuth, DealController.deleteDeal);

module.exports = router;
