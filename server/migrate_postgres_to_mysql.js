// Script migrasi data dari PostgreSQL ke MySQL secara langsung
// Pastikan sudah install: npm install pg mysql2

import { Client } from 'pg';
import mysql from 'mysql2/promise';

// Konfigurasi koneksi PostgreSQL
const pgClient = new Client({
  connectionString: 'postgresql://neondb_owner:npg_XiHCe6A9RQDp@ep-delicate-frost-a21etxv3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

// Konfigurasi koneksi MySQL
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // ganti jika ada password
  database: 'indonesianews',
};

// Daftar tabel yang ingin dimigrasi
const tables = [
  'users',
  'categories',
  'articles',
  'comments',
  'likes',
  'bookmarks',
];

async function migrateTable(table) {
  console.log(`Migrasi tabel: ${table}`);
  // Ambil data dari PostgreSQL
  const res = await pgClient.query(`SELECT * FROM "${table}"`);
  const rows = res.rows;
  if (rows.length === 0) return;

  // Siapkan kolom dan value
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(',');
  const insertSQL = `INSERT INTO \`${table}\` (${columns.map(col => `\`${col}\``).join(',')}) VALUES (${placeholders})`;

  // Insert ke MySQL
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  for (const row of rows) {
    const values = columns.map(col => row[col]);
    try {
      await mysqlConn.execute(insertSQL, values);
    } catch (err) {
      console.error(`Gagal insert ke ${table}:`, err.message);
    }
  }
  await mysqlConn.end();
  console.log(`Selesai migrasi tabel: ${table}`);
}

async function ensureAdminAndDeveloper(mysqlConn) {
  // Cek apakah sudah ada user dengan role ADMIN
  const [admins] = await mysqlConn.query("SELECT * FROM users WHERE role = 'ADMIN'");
  if (admins.length === 0) {
    await mysqlConn.query(
      "INSERT INTO users (username, email, password, fullName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        'admin',
        'admin@example.com',
        '$2b$10$w8Qw6Qw6Qw6Qw6Qw6Qw6QOQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6', // hash untuk 'admin123'
        'Administrator',
        'ADMIN',
        1,
      ]
    );
    console.log('Akun ADMIN default dibuat: admin@example.com / password: admin123');
  }
  // Cek apakah sudah ada user dengan role DEVELOPER
  const [devs] = await mysqlConn.query("SELECT * FROM users WHERE role = 'DEVELOPER'");
  if (devs.length === 0) {
    await mysqlConn.query(
      "INSERT INTO users (username, email, password, fullName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        'developer',
        'developer@example.com',
        '$2b$10$Qw6Qw6Qw6Qw6Qw6Qw6Qw6uQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6', // hash untuk 'dev123'
        'Developer',
        'DEVELOPER',
        1,
      ]
    );
    console.log('Akun DEVELOPER default dibuat: developer@example.com / password: dev123');
  }
  // Cek apakah sudah ada user demo
  const [demos] = await mysqlConn.query("SELECT * FROM users WHERE email = 'demo@example.com'");
  if (demos.length === 0) {
    await mysqlConn.query(
      "INSERT INTO users (username, email, password, fullName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        'demo',
        'demo@example.com',
        '$2b$10$w8Qw6Qw6Qw6Qw6Qw6Qw6QOQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6', // hash untuk 'demo123'
        'Demo User',
        'USER',
        1,
      ]
    );
    console.log('Akun DEMO default dibuat: demo@example.com / password: demo123');
  }
}

async function main() {
  await pgClient.connect();
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  for (const table of tables) {
    await migrateTable(table);
  }
  // Pastikan akun admin dan developer ada
  await ensureAdminAndDeveloper(mysqlConn);
  await mysqlConn.end();
  await pgClient.end();
  console.log('Migrasi selesai!');
}

main().catch(err => {
  console.error('Error migrasi:', err);
  process.exit(1);
});
