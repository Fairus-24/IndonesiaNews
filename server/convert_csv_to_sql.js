// Script sederhana untuk konversi CSV ke SQL INSERT (Node.js)
// Jalankan: node convert_csv_to_sql.js users.csv users > users.sql
const fs = require('fs');
const path = require('path');

const [,, csvFile, tableName] = process.argv;
if (!csvFile || !tableName) {
  console.error('Usage: node convert_csv_to_sql.js <csvFile> <tableName>');
  process.exit(1);
}

const csv = fs.readFileSync(csvFile, 'utf8');
const [header, ...rows] = csv.trim().split('\n');
const columns = header.split(',');

const sqlLines = rows.map(row => {
  const values = row.split(',').map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
});

console.log(sqlLines.join('\n'));
