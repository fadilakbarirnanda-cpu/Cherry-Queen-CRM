const app = require('./app');
const initDatabase = require('./database/init');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Pastikan skema database SQLite telah terinisialisasi
    await initDatabase();

    app.listen(PORT, () => {
      console.log('==================================================');
      console.log(`🚀 Server CRM Backend berjalan di port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`📑 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`📑 Leads API:     http://localhost:${PORT}/api/leads`);
      console.log(`📑 Deals API:     http://localhost:${PORT}/api/deals`);
      console.log('==================================================');
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    process.exit(1);
  }
}

startServer();
