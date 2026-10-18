// Controller Auth bypass Vercel Serverless Timeout
const AuthController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email } = req.body;
      const isSales = email && email.toLowerCase().includes('sales');

      return res.status(200).json({
        success: true,
        message: 'Selamat datang kembali!',
        token: 'cherry-queen-token-demo-12345',
        user: {
          id: isSales ? 2 : 1,
          name: isSales ? 'Sales Cherry Queen' : 'Admin Cherry Queen',
          email: email || 'admin@cherryqueen.id',
          phone: '08123456789',
          role: isSales ? 'sales' : 'admin',
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message,
      });
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
  getMe: async (req, res) => {
    return res.status(200).json({
      success: true,
      user: {
        id: 1,
        name: 'Admin Cherry Queen',
        email: 'admin@cherryqueen.id',
        phone: '08123456789',
        role: 'admin',
      },
    });
  },
};

module.exports = AuthController;