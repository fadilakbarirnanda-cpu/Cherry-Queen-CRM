const AgentModel = require('../models/agentModel');
const db = require('../config/db');

const AgentController = {
  // GET /api/agents
  getAllAgents: async (req, res, next) => {
    try {
      const onlyActive = req.query.active === 'true';
      const agents = await AgentModel.findAll(onlyActive);
      res.json({
        success: true,
        count: agents.length,
        data: agents,
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
          message: `Agen dengan ID ${id} tidak ditemukan.`,
        });
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/agents
  createAgent: async (req, res, next) => {
    try {
      // Verifikasi hak akses: Hanya Administrator yang berwenang menambahkan agen sales baru
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya Administrator yang dapat mendaftarkan akun agen sales baru.',
        });
      }

      const { name, email, phone, role, password, status_active } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap agen wajib diisi.',
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Alamat email agen wajib diisi.',
        });
      }

      const existing = await AgentModel.findByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Alamat email agen sudah terdaftar dalam sistem.',
        });
      }

      const newAgent = await AgentModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        role: role === 'admin' ? 'admin' : 'sales',
        password: password && password.trim() ? password.trim() : 'Sales@123',
        status_active: status_active !== undefined ? status_active : 1,
      });

      res.status(201).json({
        success: true,
        message: `Akun agen ${newAgent.role === 'admin' ? 'Admin' : 'Sales'} "${newAgent.name}" berhasil didaftarkan!`,
        data: newAgent,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/agents/:id
  updateAgent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, password, status_active } = req.body;

      // Jika user yang login adalah sales, hanya boleh mengubah datanya sendiri
      if (req.user && req.user.role === 'sales' && req.user.id !== Number(id)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya dapat memperbarui profil Anda sendiri.',
        });
      }

      const existing = await AgentModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Agen dengan ID ${id} tidak ditemukan.`,
        });
      }

      if (email && email !== existing.email) {
        const emailExists = await AgentModel.findByEmail(email.trim().toLowerCase());
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar untuk agen lain.',
          });
        }
      }

      const updatedAgent = await AgentModel.update(id, {
        name,
        email: email ? email.trim().toLowerCase() : undefined,
        phone,
        role: req.user && req.user.role === 'sales' ? existing.role : role, // Sales tidak bisa promote dirinya ke admin
        password,
        status_active,
      });

      res.json({
        success: true,
        message: 'Data agen berhasil diperbarui.',
        data: updatedAgent,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/agents/:id
  deleteAgent: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Verifikasi hak akses: Hanya Administrator yang boleh menghapus akun Sales
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya akun Admin yang berwenang menghapus akun sales.',
        });
      }

      // Cegah Administrator menghapus akunnya sendiri
      if (req.user && req.user.id === Number(id)) {
        return res.status(400).json({
          success: false,
          message: 'Anda tidak dapat menghapus akun Admin yang sedang Anda gunakan.',
        });
      }

      const existing = await AgentModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Agen dengan ID ${id} tidak ditemukan.`,
        });
      }

      // Pastikan hanya akun Sales yang bisa dihapus (Akun Admin tidak boleh dihapus)
      if (existing.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akun Administrator tidak dapat dihapus. Hanya akun Sales yang dapat dihapus.',
        });
      }

      // Bersihkan keterkaitan agent_id pada tabel deals, customers, dan leads agar data tetap aman
      await db.run('UPDATE deals SET agent_id = NULL WHERE agent_id = ?', [id]);
      await db.run('UPDATE customers SET agent_id = NULL WHERE agent_id = ?', [id]);
      await db.run('UPDATE leads SET agent_id = NULL WHERE agent_id = ?', [id]);

      await AgentModel.delete(id);

      res.json({
        success: true,
        message: `Akun sales "${existing.name}" berhasil dihapus dari sistem.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AgentController;
