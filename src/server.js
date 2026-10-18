const app = require('./app');
const initDatabase = require('./database/init');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Pastikan skema database SQLite telah terinisialisasi
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('==================================================');
      console.log(`🌸 Server Cherry Queen CRM berjalan di port ${PORT}`);
      console.log(`🌐 Base API:      http://localhost:${PORT}/api`);
      console.log(`🔐 Auth API:      http://localhost:${PORT}/api/auth`);
      console.log(`📑 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`📑 Leads API:     http://localhost:${PORT}/api/leads`);
      console.log(`📑 Deals API:     http://localhost:${PORT}/api/deals`);
      console.log(`👥 Agents API:    http://localhost:${PORT}/api/agents`);
      console.log('==================================================');
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    process.exit(1);
  }
}

startServer();
