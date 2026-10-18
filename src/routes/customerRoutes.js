const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { optionalAuth } = require('../middlewares/auth');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Pasang optionalAuth pada semua rute customer
router.use(optionalAuth);

// GET /api/customers
router.get('/', CustomerController.getAllCustomers);

// POST /api/customers/import
router.post('/import', upload.single('file'), CustomerController.importCustomers);

// GET /api/customers/:id
router.get('/:id', CustomerController.getCustomerById);

// POST /api/customers
router.post('/', CustomerController.createCustomer);

// PUT /api/customers/:id
router.put('/:id', CustomerController.updateCustomer);

// DELETE /api/customers/:id
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
