const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../config/db');

const RSS_URL = 'https://www.motqdmon.com/feeds/posts/default?alt=rss';

async function scrapeNews() {
  console.log('🔍 بدأ جلب الأخبار (RSS)...');

  try {
    const response = await axios.get(RSS_URL, { timeout: 20000 });
    const parsed = await xml2js.parseStringPromise(response.data);

    let items = parsed?.rss?.channel?.[0]?.item;

    if (!items || items.length === 0) {
      console.log('⚠️ لم يتم العثور على أخبار');
      return;
    }

    if (!Array.isArray(items)) {
      items = [items];
    }

    let inserted = 0;

    items.forEach(item => {
      const title = item.title?.[0];
      const link = item.link?.[0];

      let publishedAt = new Date();
      if (item.pubDate && item.pubDate[0]) {
        publishedAt = new Date(item.pubDate[0]);
      }

      if (!title || !link) return;

      const sql = 
        `INSERT IGNORE INTO news (title, link, published_at, likes)
        VALUES (?, ?, ?, 0)`
      ;

      db.query(sql, [title, link, publishedAt], (err, result) => {
        if (err) {
          console.error('❌ DB Error:', err.message);
          return;
        }

        if (result.affectedRows > 0) {
          inserted++;
          console.log('➕ خبر أُضيف:', title);
        }
      });
    });

    console.log(`✅ تم فحص ${items.length} خبر – أضيف ${inserted} جديد`);

  } catch (err) {
    console.error('❌ خطأ أثناء الجلب:', err.message);
  }
}

module.exports = scrapeNews;