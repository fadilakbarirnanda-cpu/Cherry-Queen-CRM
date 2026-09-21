const db = require('../config/db');

const CustomerModel = {
  findAll: async () => {
    return await db.all('SELECT * FROM customers ORDER BY created_at DESC');
  },

  findById: async (id) => {
    return await db.get('SELECT * FROM customers WHERE id = ?', [id]);
  },

  findByEmail: async (email) => {
    return await db.get('SELECT * FROM customers WHERE email = ?', [email]);
  },

  create: async ({ name, email, phone, company, status }) => {
    const result = await db.run(
      `INSERT INTO customers (name, email, phone, company, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email || null, phone || null, company || null, status || 'lead']
    );
    return await CustomerModel.findById(result.lastID);
  },

  update: async (id, { name, email, phone, company, status }) => {
    await db.run(
      `UPDATE customers
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           company = COALESCE(?, company),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, company, status, id]
    );
    return await CustomerModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM customers WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = CustomerModel;
