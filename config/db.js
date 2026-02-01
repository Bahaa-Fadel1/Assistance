const { Pool } = require("pg");

const pool = new Pool({
  host: "xyzcompany.supabase.co",  // انسخ host من Supabase
  user: "postgres",
  password: "2312617@BBBBB@",     // كلمة السر اللي أنشأتها
  database: "postgres",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

pool.connect(err => {
  if (err) console.error("❌ Database Connection Error:", err);
  else console.log("✅ Supabase Connected");
});

module.exports = pool;
