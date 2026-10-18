const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middlewares/auth');

const AuthController = {
  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi.',
        });
      }

      // Cari user / agent berdasarkan email
      const user = await db.get('SELECT * FROM agents WHERE email = ?', [email.trim().toLowerCase()]);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password yang Anda masukkan salah.',
        });
      }

      if (user.status_active === 0) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator.',
        });
      }

      // Verifikasi password dengan bcrypt
      const passwordMatch = user.password_hash ? bcrypt.compareSync(password, user.password_hash) : false;

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password yang Anda masukkan salah.',
        });
      }

      // Generate JWT Token
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'sales',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      res.json({
        success: true,
        message: `Selamat datang kembali, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  logout: (req, res) => {
    res.json({
      success: true,
      message: 'Sesi berhasil diakhiri (Logout sukses).',
    });
  },

  // GET /api/auth/me
  getMe: async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Belum terautentikasi.',
        });
      }

      const user = await db.get(
        'SELECT id, name, email, phone, role, status_active, created_at FROM agents WHERE id = ?',
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan.',
        });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuthController;
