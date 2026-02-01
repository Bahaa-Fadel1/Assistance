const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const Parser = require("rss-parser");
const path = require("path");

const app = express();
const PORT = 3000;
const RSS_URL = "https://www.motqdmon.com/feeds/posts/default?alt=rss";

const parser = new Parser({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

/* =======================
   Database Connection
======================= */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "newsdb",
  charset: "utf8mb4"
});

db.getConnection(err => {
  if (err) {
    console.error("❌ Database error:", err);
    process.exit(1);
  }
  console.log("✅ Database Connected");
});

/* =======================
   Middleware
======================= */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.url}`);
  next();
});

/* =======================
   Scraper Function
======================= */
async function scrapeNews() {
  try {
    console.log("🔍 بدأ جلب الأخبار (RSS)...");

    const feed = await parser.parseURL(RSS_URL);

    let added = 0;

    for (const item of feed.items) {
      const title = item.title?.trim();
      const link = item.link?.trim();
      const published = item.pubDate
        ? new Date(item.pubDate)
        : new Date();

      if (!title || !link) continue;

      await db
        .promise()
        .query(
          `INSERT IGNORE INTO news 
          (title, link, created_at) 
          VALUES (?, ?, ?)`,
          [title, link, published]
        )
        .then(([result]) => {
          if (result.affectedRows > 0) {
            added++;
            console.log("➕ خبر أُضيف:", title);
          }
        });
    }

    console.log(`✅ تم فحص ${feed.items.length} خبر – أضيف ${added} جديد`);
  } catch (err) {
    console.log("⚠️ الموقع لم يستجب (سيتم المحاولة لاحقًا)");
  }
}

/* =======================
   Auto Scrape (every 10 min)
======================= */
setInterval(scrapeNews, 10 * 60 * 1000);
scrapeNews();

/* =======================
   API Route
======================= */
app.get("/api/news", async (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;

  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT id, title, link, likes, created_at
         FROM news
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );

    res.json({
      success: true,
      message: "News list",
      data: {
        items: rows
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =======================
   Start Server
======================= */
app.listen(PORT, () => {
  console.log("🚀 السيرفر شغال بنجاح");
  console.log(`🌍 الموقع: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/news`);
});