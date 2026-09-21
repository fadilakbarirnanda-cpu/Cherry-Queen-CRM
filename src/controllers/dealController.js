const DealModel = require('../models/dealModel');

const DealController = {
  // GET /api/deals
  getAllDeals: async (req, res, next) => {
    try {
      const deals = await DealModel.findAll();
      res.json({
        success: true,
        count: deals.length,
        data: deals,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/deals/:id
  getDealById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deal = await DealModel.findById(id);

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan.`,
        });
      }

      res.json({
        success: true,
        data: deal,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/deals
  createDeal: async (req, res, next) => {
    try {
      const { title, customer_id, agent_id, value, stage, expected_close_date } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Judul transaksi/deal wajib diisi.',
        });
      }

      const newDeal = await DealModel.create({
        title,
        customer_id,
        agent_id: agent_id !== undefined ? agent_id : null,
        value,
        stage,
        expected_close_date,
      });

      res.status(201).json({
        success: true,
        message: 'Deal berhasil ditambahkan.',
        data: newDeal,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/deals/:id
  updateDeal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, customer_id, agent_id, value, stage, expected_close_date } = req.body;

      const existing = await DealModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan.`,
        });
      }

      const updatedDeal = await DealModel.update(id, {
        title,
        customer_id,
        agent_id,
        value,
        stage,
        expected_close_date,
      });

      res.json({
        success: true,
        message: 'Data deal berhasil diperbarui.',
        data: updatedDeal,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/deals/:id
  deleteDeal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await DealModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan.`,
        });
      }

      await DealModel.delete(id);

      res.json({
        success: true,
        message: `Deal dengan ID ${id} berhasil dihapus.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = DealController;
