const db = require('../config/db');

const DealModel = {
  findAll: async (agentId = null) => {
    if (agentId) {
      return await db.all(`
        SELECT 
          deals.*, 
          customers.name AS customer_name, 
          customers.company AS customer_company,
          customers.phone AS customer_phone,
          customers.email AS customer_email,
          agents.name AS agent_name,
          agents.role AS agent_role,
          agents.phone AS agent_phone
        FROM deals
        LEFT JOIN customers ON deals.customer_id = customers.id
        LEFT JOIN agents ON deals.agent_id = agents.id
        WHERE deals.agent_id = ?
        ORDER BY deals.created_at DESC
      `, [agentId]);
    }
    return await db.all(`
      SELECT 
        deals.*, 
        customers.name AS customer_name, 
        customers.company AS customer_company,
        customers.phone AS customer_phone,
        customers.email AS customer_email,
        agents.name AS agent_name,
        agents.role AS agent_role,
        agents.phone AS agent_phone
      FROM deals
      LEFT JOIN customers ON deals.customer_id = customers.id
      LEFT JOIN agents ON deals.agent_id = agents.id
      ORDER BY deals.created_at DESC
    `);
  },

  findById: async (id, agentId = null) => {
    if (agentId) {
      return await db.get(`
        SELECT 
          deals.*, 
          customers.name AS customer_name, 
          customers.company AS customer_company,
          customers.phone AS customer_phone,
          customers.email AS customer_email,
          agents.name AS agent_name,
          agents.role AS agent_role,
          agents.phone AS agent_phone
        FROM deals
        LEFT JOIN customers ON deals.customer_id = customers.id
        LEFT JOIN agents ON deals.agent_id = agents.id
        WHERE deals.id = ? AND deals.agent_id = ?
      `, [id, agentId]);
    }
    return await db.get(`
      SELECT 
        deals.*, 
        customers.name AS customer_name, 
        customers.company AS customer_company,
        customers.phone AS customer_phone,
        customers.email AS customer_email,
        agents.name AS agent_name,
        agents.role AS agent_role,
        agents.phone AS agent_phone
      FROM deals
      LEFT JOIN customers ON deals.customer_id = customers.id
      LEFT JOIN agents ON deals.agent_id = agents.id
      WHERE deals.id = ?
    `, [id]);
  },

  create: async ({ title, customer_id, agent_id, value, stage, expected_close_date }) => {
    const result = await db.run(
      `INSERT INTO deals (title, customer_id, agent_id, value, stage, expected_close_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        customer_id || null,
        agent_id || null,
        value || 0,
        stage || 'prospect',
        expected_close_date || null,
      ]
    );
    return await DealModel.findById(result.lastID);
  },

  update: async (id, { title, customer_id, agent_id, value, stage, expected_close_date }) => {
    await db.run(
      `UPDATE deals
       SET title = COALESCE(?, title),
           customer_id = COALESCE(?, customer_id),
           agent_id = CASE WHEN ? IS NOT NULL THEN ? ELSE agent_id END,
           value = COALESCE(?, value),
           stage = COALESCE(?, stage),
           expected_close_date = COALESCE(?, expected_close_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title : null,
        customer_id !== undefined ? customer_id : null,
        agent_id !== undefined ? 1 : null,
        agent_id !== undefined ? agent_id : null,
        value !== undefined ? value : null,
        stage !== undefined ? stage : null,
        expected_close_date !== undefined ? expected_close_date : null,
        id,
      ]
    );
    return await DealModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM deals WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = DealModel;
