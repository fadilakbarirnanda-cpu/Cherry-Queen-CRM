const CustomerModel = require('../models/customerModel');

const CustomerController = {
  // GET /api/customers
  getAllCustomers: async (req, res, next) => {
    try {
      const customers = await CustomerModel.findAll();
      res.json({
        success: true,
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/customers/:id
  getCustomerById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.findById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan.`,
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/customers
  createCustomer: async (req, res, next) => {
    try {
      const { name, email, phone, company, status } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Kolom nama wajib diisi.',
        });
      }

      if (email) {
        const existing = await CustomerModel.findByEmail(email);
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar.',
          });
        }
      }

      const newCustomer = await CustomerModel.create({
        name,
        email,
        phone,
        company,
        status,
      });

      res.status(201).json({
        success: true,
        message: 'Customer berhasil ditambahkan.',
        data: newCustomer,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/customers/:id
  updateCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, company, status } = req.body;

      const existing = await CustomerModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan.`,
        });
      }

      // Jika email diubah, pastikan tidak bentrok dengan data lain
      if (email && email !== existing.email) {
        const emailExists = await CustomerModel.findByEmail(email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar untuk customer lain.',
          });
        }
      }

      const updatedCustomer = await CustomerModel.update(id, {
        name,
        email,
        phone,
        company,
        status,
      });

      res.json({
        success: true,
        message: 'Data customer berhasil diperbarui.',
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/customers/:id
  deleteCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await CustomerModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan.`,
        });
      }

      await CustomerModel.delete(id);

      res.json({
        success: true,
        message: `Customer dengan ID ${id} berhasil dihapus.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CustomerController;
