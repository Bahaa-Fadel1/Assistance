// server.js
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg"); // اتصال Postgres
const Parser = require("rss-parser"); // جلب الأخبار
const newsRoutes = require("./routes/newsRoutes");
const path = require("path");

const app = express();
const parser = new Parser();

// ======================= Database ======================
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // مهم للاتصال مع Supabase
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
  console.log("✅ Database Connected");
});

// ======================= Middleware ======================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.url}`);
  next();
});

// ======================= Scraper Function ======================
async function scrapeNews() {
  try {
    console.log("🔍 Fetching RSS news...");
    const feed = await parser.parseURL(process.env.RSS_URL);
    let added = 0;

    for (const item of feed.items) {
      const title = item.title?.trim();
      const link = item.link?.trim();
      const published = item.pubDate ? new Date(item.pubDate) : new Date();

      if (!title || !link) continue;

      const query = 
        `INSERT INTO news (title, link, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (title) DO NOTHING`
      ;
      const values = [title, link, published];

      const result = await db.query(query, values);
      if (result.rowCount > 0) {
        added++;
        console.log("➕ News added:", title);
      }
    }

    console.log(`✅ Checked ${feed.items.length} items – Added ${added} new`);
  } catch (err) {
    console.error("⚠️ Error fetching RSS:", err.message);
  }
}

// ======================= Auto Scrape ======================
setInterval(scrapeNews, 10 * 60 * 1000); // كل 10 دقائق
scrapeNews();

// ======================= Routes ======================
app.use("/api/news", newsRoutes);

// ======================= Start Server ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 API: http://localhost:${PORT}/api/news`);
});

// Export db للـ controllers
module.exports = db;