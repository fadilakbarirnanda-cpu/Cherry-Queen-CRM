const DealModel = require('../models/dealModel');

const DealController = {
  // GET /api/deals
  getAllDeals: async (req, res, next) => {
    try {
      // RBAC: jika role 'sales', hanya tampilkan deals milik sales tersebut
      const agentFilter = req.user && req.user.role === 'sales'
        ? req.user.id
        : (req.query.agent_id ? Number(req.query.agent_id) : null);

      const deals = await DealModel.findAll(agentFilter);
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
      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const deal = await DealModel.findById(id, agentFilter);

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan atau Anda tidak memiliki hak akses.`,
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
      let { title, customer_id, agent_id, value, stage, expected_close_date } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Judul transaksi/deal wajib diisi.',
        });
      }

      // Jika role adalah sales, otomatis ditugaskan ke sales bersangkutan
      if (req.user && req.user.role === 'sales') {
        agent_id = req.user.id;
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
      let { title, customer_id, agent_id, value, stage, expected_close_date } = req.body;

      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const existing = await DealModel.findById(id, agentFilter);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan atau Anda tidak memiliki izin mengeditnya.`,
        });
      }

      // Jika Sales, tidak boleh reassign deal ke sales lain
      if (req.user && req.user.role === 'sales') {
        agent_id = req.user.id;
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
      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const existing = await DealModel.findById(id, agentFilter);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Deal dengan ID ${id} tidak ditemukan atau Anda tidak memiliki hak menghapusnya.`,
        });
      }

      await DealModel.delete(id);

      res.json({
        success: true,
        message: `Transaksi/Deal "${existing.title}" berhasil dihapus.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = DealController;
