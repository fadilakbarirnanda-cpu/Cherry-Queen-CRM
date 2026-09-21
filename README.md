# CRM Backend (Node.js + Express.js + SQLite)

Backend REST API untuk aplikasi CRM (Customer Relationship Management) yang dibangun menggunakan Node.js, Express.js, dan database SQLite3.

---

## 📁 Struktur Folder

```text
CRM/
├── .env                  # Variabel environment lokal
├── .env.example          # Contoh template konfigurasi environment
├── .gitignore            # File & direktori yang diabaikan Git
├── package.json          # Metadata proyek & daftar dependensi
├── README.md             # Dokumentasi proyek
├── public/               # File frontend statis
│   └── index.html        # Dashboard CRM (HTML + Tailwind CSS + Vanilla JS)
└── src/
    ├── app.js            # Konfigurasi aplikasi Express & middlewares
    ├── server.js         # Entry point server (menjalankan HTTP listener)
    ├── config/
    │   └── db.js         # Inisialisasi koneksi SQLite & wrapper Promise
    ├── database/
    │   ├── init.js       # Skrip inisialisasi tabel & seed data awal
    │   └── crm.sqlite    # File database SQLite (dibuat otomatis)
    ├── controllers/      # Penanganan request & response API
    │   ├── customerController.js
    │   ├── leadController.js
    │   └── dealController.js
    ├── models/           # Layer interaksi query database (CRUD)
    │   ├── customerModel.js
    │   ├── leadModel.js
    │   └── dealModel.js
    ├── routes/           # Definisi endpoint rute Express
    │   ├── index.js      # Agregasi seluruh rute
    │   ├── customerRoutes.js
    │   ├── leadRoutes.js
    │   └── dealRoutes.js
    └── middlewares/      # Middleware Express
        ├── errorHandler.js # Penanganan error terpusat
        └── logger.js       # Logging request HTTP
```

---

## 🚀 Fitur Utama & Paket yang Digunakan

- **Express.js**: Framework minimalis dan fleksibel untuk membuat REST API.
- **SQLite3**: Database embedded ringan berbasis file, tanpa perlu instalasi server database eksternal.
- **CORS**: Memungkinkan akses API dari frontend (React, Vue, Angular, mobile app, dll).
- **Dotenv**: Pengelolaan konfigurasi environment (`.env`).
- **Nodemon**: Auto-reload server selama proses development.

---

## 🛠️ Cara Menjalankan Proyek

### 1. Inisialisasi Database (Opsional, server juga otomatis menjalankannya saat start)
```bash
npm run db:init
```

### 2. Mode Pengembangan (Development dengan auto-reload)
```bash
npm run dev
```

### 3. Mode Produksi
```bash
npm start
```

Server default akan berjalan di: `http://localhost:5000`

### 🌐 Akses Tampilan Aplikasi
- **Frontend Dashboard CRM**: Buka browser di [http://localhost:5000](http://localhost:5000)
- **REST API Base**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📡 Daftar Endpoint API

### Health Check & Info
- `GET /api` - Cek status API & daftar rute

### 1. Customers (`/api/customers`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/customers` | Mengambil seluruh data pelanggan |
| `GET` | `/api/customers/:id` | Mengambil detail pelanggan berdasarkan ID |
| `POST` | `/api/customers` | Menambahkan pelanggan baru |
| `PUT` | `/api/customers/:id` | Memperbarui data pelanggan |
| `DELETE` | `/api/customers/:id` | Menghapus data pelanggan |

**Contoh Payload POST / PUT Customer:**
```json
{
  "name": "PT Sinar Harapan",
  "email": "info@sinarharapan.co.id",
  "phone": "08123456789",
  "company": "Sinar Harapan Group",
  "status": "active"
}
```

---

### 2. Leads (`/api/leads`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | Mengambil seluruh calon prospek |
| `GET` | `/api/leads/:id` | Mengambil detail lead berdasarkan ID |
| `POST` | `/api/leads` | Menambahkan lead baru |
| `PUT` | `/api/leads/:id` | Memperbarui data lead |
| `DELETE` | `/api/leads/:id` | Menghapus lead |

---

### 3. Deals (`/api/deals`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/deals` | Mengambil seluruh peluang transaksi |
| `GET` | `/api/deals/:id` | Mengambil detail deal berdasarkan ID |
| `POST` | `/api/deals` | Menambahkan deal baru |
| `PUT` | `/api/deals/:id` | Memperbarui deal |
| `DELETE` | `/api/deals/:id` | Menghapus deal |
