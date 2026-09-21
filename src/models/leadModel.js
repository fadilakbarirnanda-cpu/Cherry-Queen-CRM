const db = require('../config/db');

const LeadModel = {
  findAll: async () => {
    return await db.all('SELECT * FROM leads ORDER BY created_at DESC');
  },

  findById: async (id) => {
    return await db.get('SELECT * FROM leads WHERE id = ?', [id]);
  },

  create: async ({ name, email, phone, company, source, status, notes }) => {
    const result = await db.run(
      `INSERT INTO leads (name, email, phone, company, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email || null,
        phone || null,
        company || null,
        source || 'website',
        status || 'new',
        notes || null,
      ]
    );
    return await LeadModel.findById(result.lastID);
  },

  update: async (id, { name, email, phone, company, source, status, notes }) => {
    await db.run(
      `UPDATE leads
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           company = COALESCE(?, company),
           source = COALESCE(?, source),
           status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, company, source, status, notes, id]
    );
    return await LeadModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM leads WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = LeadModel;
