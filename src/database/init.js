const db = require('../config/db');

// Helper untuk memastikan kolom ada pada tabel SQLite
async function ensureColumn(tableName, columnName, columnDef) {
  const tableInfo = await db.all(`PRAGMA table_info(${tableName});`);
  const exists = tableInfo.some(col => col.name === columnName);
  if (!exists) {
    await db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`);
    console.log(`✔ Kolom \`${columnName}\` berhasil ditambahkan ke tabel \`${tableName}\`.`);
  }
}

async function initDatabase() {
  console.log('🚀 Memulai inisialisasi skema database SQLite...');

  try {
    // Aktifkan foreign key support di SQLite
    await db.run('PRAGMA foreign_keys = ON;');

    // 1. Tabel Agents (CS / Sales)
    await db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'CS',
        status_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Tabel `agents` siap.');

    // 2. Tabel Customers
    await db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        company TEXT,
        status TEXT DEFAULT 'lead',
        agent_id INTEGER REFERENCES agents(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Tabel `customers` siap.');

    // 3. Tabel Leads
    await db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        source TEXT DEFAULT 'website',
        status TEXT DEFAULT 'new',
        notes TEXT,
        agent_id INTEGER REFERENCES agents(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Tabel `leads` siap.');

    // 4. Tabel Deals
    await db.run(`
      CREATE TABLE IF NOT EXISTS deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        customer_id INTEGER,
        agent_id INTEGER REFERENCES agents(id),
        value REAL DEFAULT 0,
        stage TEXT DEFAULT 'prospect',
        expected_close_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log('✔ Tabel `deals` siap.');

    // Pastikan kolom agent_id ada jika tabel sudah pernah dibuat sebelumnya
    await ensureColumn('customers', 'agent_id', 'INTEGER REFERENCES agents(id)');
    await ensureColumn('leads', 'agent_id', 'INTEGER REFERENCES agents(id)');
    await ensureColumn('deals', 'agent_id', 'INTEGER REFERENCES agents(id)');

    // Inisialisasi data awal Agen jika tabel agents kosong
    const existingAgents = await db.get('SELECT COUNT(*) as count FROM agents');
    if (existingAgents && existingAgents.count === 0) {
      console.log('🌱 Menambahkan data awal agen CS & Sales...');
      await db.run(`
        INSERT INTO agents (name, email, phone, role, status_active)
        VALUES 
          ('Rian Pratama', 'rian.pratama@nexus.id', '081234567801', 'CS Specialist', 1),
          ('Sarah Amelia', 'sarah.amelia@nexus.id', '081234567802', 'Sales Executive', 1),
          ('Dimas Anggara', 'dimas.anggara@nexus.id', '081234567803', 'Account Manager', 1)
      `);
      console.log('✔ Contoh agen berhasil ditambahkan.');
    }

    // Cek apakah tabel customers kosong untuk menambahkan data awal (seed)
    const existingCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
    if (existingCustomers && existingCustomers.count === 0) {
      console.log('🌱 Menambahkan contoh data awal pelanggan, leads & deals...');

      await db.run(`
        INSERT INTO customers (name, email, phone, company, status, agent_id)
        VALUES 
          ('PT Maju Bersama', 'contact@majubersama.id', '081234567890', 'Maju Bersama Group', 'active', 1),
          ('Budi Santoso', 'budi.santoso@techindo.com', '081987654321', 'Tech Indo Solusi', 'prospect', 2),
          ('Siti Rahma', 'siti@kreatifnusantara.com', '082112233445', 'Kreatif Nusantara', 'lead', 1)
      `);

      await db.run(`
        INSERT INTO leads (name, email, phone, company, source, status, notes, agent_id)
        VALUES 
          ('Andi Pratama', 'andi@startupbaru.io', '085678901234', 'Startup Baru', 'website', 'new', 'Tertarik dengan paket enterprise CRM', 1),
          ('Dewi Lestari', 'dewi@digitalagency.co', '087788990011', 'Digital Agency', 'referral', 'contacted', 'Sudah follow-up lewat WhatsApp', 2)
      `);

      await db.run(`
        INSERT INTO deals (title, customer_id, agent_id, value, stage, expected_close_date)
        VALUES 
          ('Implementasi CRM Enterprise', 1, 1, 75000000, 'negotiation', '2026-10-15'),
          ('Lisensi Tahunan Paket Pro', 2, 2, 25000000, 'prospect', '2026-11-01')
      `);

      console.log('✔ Contoh data awal berhasil ditambahkan.');
    } else {
      // Pastikan deal lama memiliki agent_id jika masih null
      await db.run('UPDATE deals SET agent_id = 1 WHERE agent_id IS NULL AND id = 1');
      await db.run('UPDATE deals SET agent_id = 2 WHERE agent_id IS NULL AND id = 2');
    }

    console.log('🎉 Database SQLite CRM berhasil diinisialisasi & dimigrasikan!');
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database:', error);
    process.exit(1);
  }
}

// Jalankan jika dieksekusi langsung
if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = initDatabase;
