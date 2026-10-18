const db = require('../config/db');
const bcrypt = require('bcryptjs');

const AgentModel = {
  findAll: async (onlyActive = false) => {
    const query = `
      SELECT 
        agents.id, agents.name, agents.email, agents.phone, agents.role, agents.status_active, agents.created_at, agents.updated_at,
        (SELECT COUNT(*) FROM deals WHERE deals.agent_id = agents.id) AS assigned_deals_count,
        (SELECT COUNT(*) FROM leads WHERE leads.agent_id = agents.id) AS assigned_leads_count,
        (SELECT COUNT(*) FROM customers WHERE customers.agent_id = agents.id) AS assigned_customers_count
      FROM agents
      WHERE (? = 0 OR agents.status_active = 1)
      ORDER BY agents.role ASC, agents.name ASC
    `;
    return await db.all(query, [onlyActive ? 1 : 0]);
  },

  findById: async (id) => {
    const query = `
      SELECT 
        agents.id, agents.name, agents.email, agents.phone, agents.role, agents.status_active, agents.created_at, agents.updated_at,
        (SELECT COUNT(*) FROM deals WHERE deals.agent_id = agents.id) AS assigned_deals_count,
        (SELECT COUNT(*) FROM leads WHERE leads.agent_id = agents.id) AS assigned_leads_count,
        (SELECT COUNT(*) FROM customers WHERE customers.agent_id = agents.id) AS assigned_customers_count
      FROM agents
      WHERE agents.id = ?
    `;
    return await db.get(query, [id]);
  },

  findByEmail: async (email) => {
    return await db.get('SELECT * FROM agents WHERE email = ?', [email]);
  },

  create: async ({ name, email, phone, role = 'sales', password = 'Sales@123', status_active = 1 }) => {
    const password_hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      `INSERT INTO agents (name, email, phone, role, password_hash, status_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email || null, phone || null, role || 'sales', password_hash, status_active ? 1 : 0]
    );
    return await AgentModel.findById(result.lastID);
  },

  update: async (id, { name, email, phone, role, password, status_active }) => {
    let password_hash = null;
    if (password) {
      password_hash = bcrypt.hashSync(password, 10);
    }

    await db.run(
      `UPDATE agents
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           role = COALESCE(?, role),
           password_hash = COALESCE(?, password_hash),
           status_active = COALESCE(?, status_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, role, password_hash, status_active, id]
    );
    return await AgentModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM agents WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = AgentModel;
