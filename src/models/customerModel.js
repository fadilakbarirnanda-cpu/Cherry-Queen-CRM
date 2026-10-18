const db = require('../config/db');

const CustomerModel = {
  findAll: async (agentId = null) => {
    if (agentId) {
      return await db.all(`
        SELECT customers.*, agents.name AS agent_name, agents.role AS agent_role
        FROM customers
        LEFT JOIN agents ON customers.agent_id = agents.id
        WHERE customers.agent_id = ?
        ORDER BY customers.created_at DESC
      `, [agentId]);
    }
    return await db.all(`
      SELECT customers.*, agents.name AS agent_name, agents.role AS agent_role
      FROM customers
      LEFT JOIN agents ON customers.agent_id = agents.id
      ORDER BY customers.created_at DESC
    `);
  },

  findById: async (id, agentId = null) => {
    if (agentId) {
      return await db.get(`
        SELECT customers.*, agents.name AS agent_name, agents.role AS agent_role
        FROM customers
        LEFT JOIN agents ON customers.agent_id = agents.id
        WHERE customers.id = ? AND customers.agent_id = ?
      `, [id, agentId]);
    }
    return await db.get(`
      SELECT customers.*, agents.name AS agent_name, agents.role AS agent_role
      FROM customers
      LEFT JOIN agents ON customers.agent_id = agents.id
      WHERE customers.id = ?
    `, [id]);
  },

  findByEmail: async (email) => {
    return await db.get('SELECT * FROM customers WHERE email = ?', [email]);
  },

  create: async ({ name, email, phone, company, status, agent_id }) => {
    const result = await db.run(
      `INSERT INTO customers (name, email, phone, company, status, agent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email || null, phone || null, company || null, status || 'lead', agent_id || null]
    );
    return await CustomerModel.findById(result.lastID);
  },

  update: async (id, { name, email, phone, company, status, agent_id }) => {
    await db.run(
      `UPDATE customers
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           company = COALESCE(?, company),
           status = COALESCE(?, status),
           agent_id = CASE WHEN ? IS NOT NULL THEN ? ELSE agent_id END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name : null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        company !== undefined ? company : null,
        status !== undefined ? status : null,
        agent_id !== undefined ? 1 : null,
        agent_id !== undefined ? agent_id : null,
        id,
      ]
    );
    return await CustomerModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM customers WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = CustomerModel;
