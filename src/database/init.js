const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Jika berjalan di Vercel (Serverless), gunakan folder /tmp yang writable.
// Jika di komputer lokal, gunakan folder/file lokal biasa.
const dbPath = process.env.VERCEL
  ? '/tmp/crm.db'
  : path.join(__dirname, '../../database.sqlite');

// Pastikan folder untuk database lokal ada jika tidak di Vercel
if (!process.env.VERCEL) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('X Gagal membuka database SQLite:', err.message);
  } else {
    console.log(`✓ Terhubung ke database SQLite (${process.env.VERCEL ? 'Vercel /tmp Environment' : 'Lokal Environment'})`);
  }
});

// Inisialisasi tabel dasar
function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tambahkan user default admin jika belum ada
    db.get("SELECT * FROM users WHERE email = ?", ['admin@cherryqueen.id'], (err, row) => {
      if (!row) {
        db.run(`
          INSERT INTO users (email, password, role, name)
          VALUES ('admin@cherryqueen.id', 'admin123', 'admin', 'Admin Cherry Queen')
        `);
      }
    });
  });
}

initDatabase();

module.exports = db;