const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../config/db');

const RSS_URL = 'https://www.motqdmon.com/feeds/posts/default?alt=rss';

async function scrapeNews() {
  console.log('🔍 Fetching RSS news...');
  try {
    const response = await axios.get(RSS_URL, { timeout: 20000 });
    const parsed = await xml2js.parseStringPromise(response.data);

    let items = parsed?.rss?.channel?.[0]?.item;
    if (!items || items.length === 0) {
      console.log('⚠️ No news found');
      return;
    }

    if (!Array.isArray(items)) items = [items];

    let inserted = 0;

    for (const item of items.slice(0, 10)) { // أول 10 أخبار فقط
      const title = item.title?.[0];
      const link = item.link?.[0];
      let publishedAt = new Date();

      if (item.pubDate && item.pubDate[0]) {
        publishedAt = new Date(item.pubDate[0]);
      }

      if (!title || !link) continue;

      const sql = 
        `INSERT INTO news (title, link, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (title) DO NOTHING`
      ;

      await db.query(sql, [title, link, publishedAt]);
      inserted++;
      console.log('➕ Added news:', title);
    }

    console.log(`✅ Checked ${items.length} news – added ${inserted} new`);
  } catch (err) {
    console.error('❌ Error fetching RSS:', err.message);
  }
}

module.exports = scrapeNews;