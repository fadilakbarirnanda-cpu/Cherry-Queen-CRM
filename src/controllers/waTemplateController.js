const WaTemplateModel = require('../models/waTemplateModel');

const waTemplateController = {
  getAllTemplates: async (req, res, next) => {
    try {
      const templates = await WaTemplateModel.findAll();
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  },

  getTemplateById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const template = await WaTemplateModel.findById(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template WhatsApp tidak ditemukan',
        });
      }
      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  createTemplate: async (req, res, next) => {
    try {
      const { name, category, message } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama template wajib diisi',
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Isi pesan template wajib diisi',
        });
      }

      const newTemplate = await WaTemplateModel.create({
        name: name.trim(),
        category: (category || 'general').trim(),
        message: message.trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Template WhatsApp berhasil ditambahkan',
        data: newTemplate,
      });
    } catch (error) {
      next(error);
    }
  },

  updateTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await WaTemplateModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Template WhatsApp tidak ditemukan',
        });
      }

      const { name, category, message } = req.body;

      const updated = await WaTemplateModel.update(id, {
        name: name !== undefined ? name.trim() : existing.name,
        category: category !== undefined ? category.trim() : existing.category,
        message: message !== undefined ? message.trim() : existing.message,
      });

      res.json({
        success: true,
        message: 'Template WhatsApp berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await WaTemplateModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Template WhatsApp tidak ditemukan',
        });
      }

      await WaTemplateModel.delete(id);
      res.json({
        success: true,
        message: 'Template WhatsApp berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = waTemplateController;
