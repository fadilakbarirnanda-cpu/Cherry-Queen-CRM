const LeadModel = require('../models/leadModel');

const LeadController = {
  // GET /api/leads
  getAllLeads: async (req, res, next) => {
    try {
      const leads = await LeadModel.findAll();
      res.json({
        success: true,
        count: leads.length,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/leads/:id
  getLeadById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const lead = await LeadModel.findById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: `Lead dengan ID ${id} tidak ditemukan.`,
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/leads
  createLead: async (req, res, next) => {
    try {
      const { name, email, phone, company, source, status, notes } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Kolom nama lead wajib diisi.',
        });
      }

      const newLead = await LeadModel.create({
        name,
        email,
        phone,
        company,
        source,
        status,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Lead baru berhasil ditambahkan.',
        data: newLead,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/leads/:id
  updateLead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, company, source, status, notes } = req.body;

      const existing = await LeadModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Lead dengan ID ${id} tidak ditemukan.`,
        });
      }

      const updatedLead = await LeadModel.update(id, {
        name,
        email,
        phone,
        company,
        source,
        status,
        notes,
      });

      res.json({
        success: true,
        message: 'Data lead berhasil diperbarui.',
        data: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/leads/:id
  deleteLead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await LeadModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Lead dengan ID ${id} tidak ditemukan.`,
        });
      }

      await LeadModel.delete(id);

      res.json({
        success: true,
        message: `Lead dengan ID ${id} berhasil dihapus.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = LeadController;
