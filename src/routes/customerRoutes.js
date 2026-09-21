const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

// GET /api/customers
router.get('/', CustomerController.getAllCustomers);

// GET /api/customers/:id
router.get('/:id', CustomerController.getCustomerById);

// POST /api/customers
router.post('/', CustomerController.createCustomer);

// PUT /api/customers/:id
router.put('/:id', CustomerController.updateCustomer);

// DELETE /api/customers/:id
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
