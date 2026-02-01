const db = require('../config/db');

exports.getAllNews = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query('SELECT COUNT(*) AS total FROM news', (err, countResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'DB Error' });
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    db.query(
      'SELECT id, title, link, summary, image, likes, created_at FROM news LIMIT ? OFFSET ?',
      [limit, offset],
      (err, items) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'DB Error' });
        }

        res.json({
          success: true,
          message: 'News list',
          data: {
            page,
            limit,
            total,
            totalPages,
            items
          }
        });
      }
    );
  });
};