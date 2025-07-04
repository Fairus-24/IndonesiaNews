const fs = require("fs");
const path = require("path");
const { pool } = require("./db.cjs");

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  files.sort(); // jalankan berurutan

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Menjalankan migrasi: ${file}`);
    try {
      await pool.query(sql);
      console.log(`Sukses: ${file}`);
    } catch (err) {
      console.error(`Gagal migrasi ${file}:`, err);
      process.exit(1);
    }
  }
  console.log("Semua migrasi selesai!");
  process.exit(0);
}

runMigrations();
