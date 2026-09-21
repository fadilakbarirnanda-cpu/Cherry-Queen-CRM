const AgentModel = require('../models/agentModel');

const AgentController = {
  // GET /api/agents
  getAllAgents: async (req, res, next) => {
    try {
      const onlyActive = req.query.active === 'true';
      const agents = await AgentModel.findAll(onlyActive);
      res.json({
        success: true,
        count: agents.length,
        data: agents
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/agents/:id
  getAgentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const agent = await AgentModel.findById(id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: `Agen dengan ID ${id} tidak ditemukan.`
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/agents
  createAgent: async (req, res, next) => {
    try {
      const { name, email, phone, role, status_active } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nama agen wajib diisi.'
        });
      }

      if (email) {
        const existing = await AgentModel.findByEmail(email);
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Alamat email agen sudah terdaftar.'
          });
        }
      }

      const newAgent = await AgentModel.create({
        name,
        email,
        phone,
        role: role || 'CS Specialist',
        status_active: status_active !== undefined ? status_active : 1
      });

      res.status(201).json({
        success: true,
        message: 'Agen baru berhasil ditambahkan.',
        data: newAgent
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/agents/:id
  updateAgent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, status_active } = req.body;

      const existing = await AgentModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Agen dengan ID ${id} tidak ditemukan.`
        });
      }

      if (email && email !== existing.email) {
        const emailExists = await AgentModel.findByEmail(email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar untuk agen lain.'
          });
        }
      }

      const updatedAgent = await AgentModel.update(id, {
        name,
        email,
        phone,
        role,
        status_active
      });

      res.json({
        success: true,
        message: 'Data agen berhasil diperbarui.',
        data: updatedAgent
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/agents/:id
  deleteAgent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await AgentModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Agen dengan ID ${id} tidak ditemukan.`
        });
      }

      await AgentModel.delete(id);

      res.json({
        success: true,
        message: `Agen dengan ID ${id} berhasil dihapus.`
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AgentController;
