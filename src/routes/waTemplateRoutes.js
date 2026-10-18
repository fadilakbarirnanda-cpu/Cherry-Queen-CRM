const express = require('express');
const router = express.Router();
const waTemplateController = require('../controllers/waTemplateController');
const { optionalAuth, requireAuth } = require('../middlewares/auth');

// Pasang optionalAuth untuk membaca atau mengelola template
router.use(optionalAuth);

// GET /api/wa-templates - Ambil semua template WhatsApp
router.get('/', waTemplateController.getAllTemplates);

// GET /api/wa-templates/:id - Ambil detail template WhatsApp
router.get('/:id', waTemplateController.getTemplateById);

// POST /api/wa-templates - Buat template WhatsApp baru
router.post('/', requireAuth, waTemplateController.createTemplate);

// PUT /api/wa-templates/:id - Perbarui template WhatsApp
router.put('/:id', requireAuth, waTemplateController.updateTemplate);

// DELETE /api/wa-templates/:id - Hapus template WhatsApp
router.delete('/:id', requireAuth, waTemplateController.deleteTemplate);

module.exports = router;
