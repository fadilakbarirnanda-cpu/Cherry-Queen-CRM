const CustomerModel = require('../models/customerModel');
const XLSX = require('xlsx');

const CustomerController = {
  // GET /api/customers
  getAllCustomers: async (req, res, next) => {
    try {
      // RBAC: jika role 'sales', hanya tampilkan data milik sales tersebut
      const agentFilter = req.user && req.user.role === 'sales' 
        ? req.user.id 
        : (req.query.agent_id ? Number(req.query.agent_id) : null);

      const customers = await CustomerModel.findAll(agentFilter);
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
      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const customer = await CustomerModel.findById(id, agentFilter);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan atau Anda tidak memiliki akses.`,
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
      let { name, email, phone, company, status, agent_id } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Kolom nama wajib diisi.',
        });
      }

      // Jika role adalah sales, otomatis ditugaskan ke sales bersangkutan
      if (req.user && req.user.role === 'sales') {
        agent_id = req.user.id;
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
        agent_id,
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
      let { name, email, phone, company, status, agent_id } = req.body;

      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const existing = await CustomerModel.findById(id, agentFilter);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan atau Anda tidak berwenang mengeditnya.`,
        });
      }

      // Jika Sales, tidak boleh mengubah kepemilikan agent_id ke orang lain
      if (req.user && req.user.role === 'sales') {
        agent_id = req.user.id;
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
        agent_id,
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
      const agentFilter = req.user && req.user.role === 'sales' ? req.user.id : null;
      const existing = await CustomerModel.findById(id, agentFilter);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Customer dengan ID ${id} tidak ditemukan atau Anda tidak berwenang menghapusnya.`,
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

  // POST /api/customers/import
  importCustomers: async (req, res, next) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: 'File tidak ditemukan. Silakan unggah file CSV atau Excel (.xlsx/.xls).',
        });
      }

      let rows = [];
      try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'File Excel / CSV kosong atau tidak memiliki lembar kerja.',
          });
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          message: 'Gagal membaca format file. Pastikan file berformat CSV atau Excel yang valid.',
        });
      }

      if (!rows || rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada data yang ditemukan dalam file yang diunggah.',
        });
      }

      let insertedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Deteksi kolom Nama
        const name = (
          row['Nama'] || row['nama'] || row['Name'] || row['name'] || 
          row['Nama Pelanggan'] || row['Customer Name'] || ''
        ).toString().trim();

        if (!name) {
          skippedCount++;
          continue;
        }

        // Deteksi kolom Email
        const emailRaw = (
          row['Email'] || row['email'] || row['E-mail'] || ''
        ).toString().trim().toLowerCase();
        const email = emailRaw || null;

        // Cek jika email sudah terdaftar
        if (email) {
          const existing = await CustomerModel.findByEmail(email);
          if (existing) {
            skippedCount++;
            continue;
          }
        }

        // Deteksi kolom Telepon
        const phoneRaw = (
          row['Telepon'] || row['telepon'] || row['Phone'] || row['phone'] ||
          row['No. Telepon'] || row['No Telepon'] || row['No HP'] || row['WhatsApp'] || ''
        ).toString().trim();
        const phone = phoneRaw || null;

        // Deteksi kolom Perusahaan / Channel
        const companyRaw = (
          row['Perusahaan'] || row['perusahaan'] || row['Company'] || row['company'] ||
          row['Channel'] || ''
        ).toString().trim();
        const company = companyRaw || null;

        // Deteksi status
        let status = (
          row['Status'] || row['status'] || 'lead'
        ).toString().trim().toLowerCase();
        if (!['active', 'prospect', 'lead', 'inactive', 'blocked'].includes(status)) {
          status = 'lead';
        }

        // Penugasan agen (RBAC: jika sales, hanya bisa assign ke diri sendiri)
        let agent_id = null;
        if (req.user && req.user.role === 'sales') {
          agent_id = req.user.id;
        } else {
          const rawAgentId = row['Agent ID'] || row['agent_id'] || row['Penanggung Jawab'];
          if (rawAgentId && !isNaN(Number(rawAgentId))) {
            agent_id = Number(rawAgentId);
          }
        }

        try {
          await CustomerModel.create({
            name,
            email,
            phone,
            company,
            status,
            agent_id,
          });
          insertedCount++;
        } catch (err) {
          skippedCount++;
        }
      }

      res.json({
        success: true,
        message: `Berhasil mengimpor ${insertedCount} data pelanggan baru.${skippedCount > 0 ? ` (${skippedCount} data dilewati)` : ''}`,
        count: insertedCount,
        skipped: skippedCount,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CustomerController;
