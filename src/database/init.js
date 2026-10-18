const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
  console.log('🚀 Memulai inisialisasi skema database Cherry Queen CRM...');

  try {
    // Aktifkan foreign key support di SQLite
    await db.run('PRAGMA foreign_keys = ON;');

    // 1. Tabel Agents / Users (Admin & Sales)
    await db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'sales',
        password_hash TEXT,
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

    // 5. Tabel WhatsApp Templates
    await db.run(`
      CREATE TABLE IF NOT EXISTS wa_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Tabel `wa_templates` siap.');

    // Seed default template WhatsApp jika tabel kosong
    const existingTemplates = await db.get('SELECT COUNT(*) as count FROM wa_templates');
    if (existingTemplates && existingTemplates.count === 0) {
      console.log('🌱 Menambahkan template default WhatsApp Automation...');
      const defaultTemplates = [
        {
          name: 'Follow-up Leads Baru',
          category: 'follow_up',
          message: 'Halo Kak {nama_pelanggan}, salam kenal dari Cherry Queen! Saya {nama_sales}. Terima kasih sudah tertarik dengan produk dan layanan kami untuk {nama_perusahaan}. Ada yang bisa kami bantu jelaskan lebih lanjut mengenai kebutuhan Anda? 😊'
        },
        {
          name: 'Promo Skincare Cherry Queen',
          category: 'promo',
          message: 'Halo Kak {nama_pelanggan}! 🌸 Cherry Queen sedang menghadirkan promo spesial untuk produk {nama_produk}! Khusus periode ini ada diskon dan bonus menarik untuk {nama_perusahaan}. Yuk amankan penawaran terbaiknya sebelum kehabisan!'
        },
        {
          name: 'Penawaran Paket Penjualan',
          category: 'penawaran',
          message: 'Halo Kak {nama_pelanggan}, berikut rincian penawaran paket {nama_produk} untuk {nama_perusahaan} dengan estimasi nilai {nilai_deals}. Penawaran ini siap kami sesuaikan dengan kebutuhan spesifik Anda. Kapan ada waktu luang untuk berdiskusi lebih detail? 🙏'
        },
        {
          name: 'Konfirmasi Pembayaran & Faktur',
          category: 'pembayaran',
          message: 'Halo Kak {nama_pelanggan}, kami dari tim Cherry Queen ingin mengonfirmasi kelanjutan transaksi {nama_produk} senilai {nilai_deals}. Apakah ada kendala dalam proses transfer atau faktur pembayaran? Mohon konfirmasinya ya Kak, terima kasih!'
        },
        {
          name: 'Penyelesaian & Closing Deal',
          category: 'closing',
          message: 'Halo Kak {nama_pelanggan}, perkenalkan kembali saya {nama_sales} dari Cherry Queen. Melanjutkan diskusi mengenai transaksi {nama_produk} senilai {nilai_deals}, tim kami siap membantu proses closing hari ini agar pesanan dapat segera diproses! 🚀'
        }
      ];

      for (const t of defaultTemplates) {
        await db.run(`
          INSERT INTO wa_templates (name, category, message)
          VALUES (?, ?, ?)
        `, [t.name, t.category, t.message]);
      }
      console.log('✔ Template default WhatsApp berhasil ditambahkan.');
    }

    // Pastikan kolom-kolom baru tersedia pada tabel yang telah dibuat sebelumnya
    await ensureColumn('agents', 'password_hash', 'TEXT');
    await ensureColumn('agents', 'role', "TEXT DEFAULT 'sales'");
    await ensureColumn('agents', 'status_active', 'INTEGER DEFAULT 1');
    await ensureColumn('customers', 'agent_id', 'INTEGER REFERENCES agents(id)');
    await ensureColumn('leads', 'agent_id', 'INTEGER REFERENCES agents(id)');
    await ensureColumn('deals', 'agent_id', 'INTEGER REFERENCES agents(id)');

    // Inisialisasi / Seed Data Agen
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const salesPasswordHash = bcrypt.hashSync('Sales@123', 10);

    // Cek apakah akun admin sudah ada
    const adminExists = await db.get("SELECT * FROM agents WHERE email = 'admin@cherryqueen.id' OR role = 'admin'");
    if (!adminExists) {
      console.log('🌱 Menambahkan akun default Admin Cherry Queen...');
      await db.run(`
        INSERT INTO agents (name, email, phone, role, password_hash, status_active)
        VALUES ('Queen Admin', 'admin@cherryqueen.id', '081122334455', 'admin', ?, 1)
      `, [adminPasswordHash]);
    } else if (!adminExists.password_hash) {
      await db.run(`
        UPDATE agents 
        SET password_hash = ?, role = 'admin', email = 'admin@cherryqueen.id'
        WHERE id = ?
      `, [adminPasswordHash, adminExists.id]);
    }

    // Pastikan agen sales default tersedia
    const defaultSales = [
      { name: 'Rian Pratama', email: 'rian.pratama@cherryqueen.id', phone: '081234567801', role: 'sales' },
      { name: 'Sarah Amelia', email: 'sarah.amelia@cherryqueen.id', phone: '081234567802', role: 'sales' },
      { name: 'Dimas Anggara', email: 'dimas.anggara@cherryqueen.id', phone: '081234567803', role: 'sales' }
    ];

    for (const s of defaultSales) {
      const existing = await db.get('SELECT id, password_hash FROM agents WHERE email = ?', [s.email]);
      if (!existing) {
        await db.run(`
          INSERT INTO agents (name, email, phone, role, password_hash, status_active)
          VALUES (?, ?, ?, ?, ?, 1)
        `, [s.name, s.email, s.phone, s.role, salesPasswordHash]);
      } else if (!existing.password_hash) {
        await db.run('UPDATE agents SET password_hash = ?, role = ? WHERE id = ?', [salesPasswordHash, s.role, existing.id]);
      }
    }

    // Pastikan role hanya 'admin' atau 'sales', dan password_hash tidak ada yang NULL
    await db.run("UPDATE agents SET role = 'sales' WHERE role != 'admin'");
    await db.run('UPDATE agents SET password_hash = ? WHERE password_hash IS NULL', [salesPasswordHash]);
    // Bersihkan sisa akun lama bertipe nexus.id jika sudah ada versi cherryqueen.id
    await db.run("DELETE FROM agents WHERE email LIKE '%@nexus.id%' AND EXISTS (SELECT 1 FROM agents a2 WHERE a2.email LIKE '%@cherryqueen.id%')");

    // Cek apakah tabel customers kosong untuk seed awal
    const existingCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
    if (existingCustomers && existingCustomers.count === 0) {
      console.log('🌱 Menambahkan data contoh awal customers, leads & deals...');

      const salesRian = await db.get("SELECT id FROM agents WHERE email = 'rian.pratama@cherryqueen.id'");
      const salesSarah = await db.get("SELECT id FROM agents WHERE email = 'sarah.amelia@cherryqueen.id'");
      const rianId = salesRian ? salesRian.id : null;
      const sarahId = salesSarah ? salesSarah.id : null;

      await db.run(`
        INSERT INTO customers (name, email, phone, company, status, agent_id)
        VALUES 
          ('PT Maju Bersama', 'contact@majubersama.id', '081234567890', 'Maju Bersama Group', 'active', ?),
          ('Budi Santoso', 'budi.santoso@techindo.com', '081987654321', 'Tech Indo Solusi', 'prospect', ?),
          ('Siti Rahma', 'siti@kreatifnusantara.com', '082112233445', 'Kreatif Nusantara', 'lead', ?)
      `, [rianId, sarahId, rianId]);

      await db.run(`
        INSERT INTO leads (name, email, phone, company, source, status, notes, agent_id)
        VALUES 
          ('Andi Pratama', 'andi@startupbaru.io', '085678901234', 'Startup Baru', 'website', 'new', 'Tertarik dengan paket enterprise CRM', ?),
          ('Dewi Lestari', 'dewi@digitalagency.co', '087788990011', 'Digital Agency', 'referral', 'contacted', 'Sudah follow-up via WhatsApp', ?)
      `, [rianId, sarahId]);

      await db.run(`
        INSERT INTO deals (title, customer_id, agent_id, value, stage, expected_close_date)
        VALUES 
          ('Implementasi Cherry CRM Enterprise', 1, ?, 75000000, 'negotiation', '2026-10-15'),
          ('Lisensi Tahunan Paket Pro', 2, ?, 25000000, 'prospect', '2026-11-01')
      `, [rianId, sarahId]);

      console.log('✔ Contoh data awal berhasil ditambahkan.');
    }

    // Pastikan tabel deals memiliki data contoh
    const existingDeals = await db.get('SELECT COUNT(*) as count FROM deals');
    if (existingDeals && existingDeals.count === 0) {
      console.log('🌱 Menambahkan contoh data deals...');
      const salesRian = await db.get("SELECT id FROM agents WHERE email = 'rian.pratama@cherryqueen.id'");
      const salesSarah = await db.get("SELECT id FROM agents WHERE email = 'sarah.amelia@cherryqueen.id'");
      const rianId = salesRian ? salesRian.id : null;
      const sarahId = salesSarah ? salesSarah.id : null;

      const custs = await db.all('SELECT id FROM customers ORDER BY id ASC LIMIT 4');
      const c1 = custs[0] ? custs[0].id : null;
      const c2 = custs[1] ? custs[1].id : c1;
      const c3 = custs[2] ? custs[2].id : c1;

      if (c1) {
        await db.run(`
          INSERT INTO deals (title, customer_id, agent_id, value, stage, expected_close_date)
          VALUES 
            ('Implementasi Cherry Queen Enterprise', ?, ?, 85000000, 'negotiation', '2026-10-15'),
            ('Lisensi Tahunan Paket Pro', ?, ?, 30000000, 'prospect', '2026-11-01'),
            ('Paket Kustomisasi Workflow', ?, ?, 45000000, 'won', '2026-09-30'),
            ('Pelatihan Onsite & Integrasi', ?, ?, 15000000, 'lost', '2026-09-20')
        `, [c1, rianId, c2, sarahId, c1, rianId, c3, sarahId]);
        console.log('✔ Contoh data deals berhasil ditambahkan.');
      }
    }

    console.log('🎉 Database SQLite Cherry Queen CRM siap digunakan!');
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
