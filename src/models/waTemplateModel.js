const db = require('../config/db');

const WaTemplateModel = {
  findAll: async () => {
    return await db.all('SELECT * FROM wa_templates ORDER BY id ASC');
  },

  findById: async (id) => {
    return await db.get('SELECT * FROM wa_templates WHERE id = ?', [id]);
  },

  create: async ({ name, category, message }) => {
    const result = await db.run(
      `INSERT INTO wa_templates (name, category, message)
       VALUES (?, ?, ?)`,
      [name, category || 'general', message]
    );
    return await WaTemplateModel.findById(result.lastID);
  },

  update: async (id, { name, category, message }) => {
    await db.run(
      `UPDATE wa_templates
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           message = COALESCE(?, message),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name : null,
        category !== undefined ? category : null,
        message !== undefined ? message : null,
        id,
      ]
    );
    return await WaTemplateModel.findById(id);
  },

  delete: async (id) => {
    const result = await db.run('DELETE FROM wa_templates WHERE id = ?', [id]);
    return result.changes > 0;
  },
};

module.exports = WaTemplateModel;
