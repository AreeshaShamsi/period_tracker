const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/database');

async function run() {
  const migrations = ['005_firebase_auth.sql', '006_firebase_auth_constraint.sql'];
  for (const m of migrations) {
    const filePath = path.join(__dirname, 'migrations', m);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Running migration ${m}...`);
      await pool.query(sql);
      console.log(`Migration ${m} applied successfully!`);
    }
  }
  await pool.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
