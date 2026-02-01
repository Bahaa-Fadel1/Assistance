const db = require('../config/db'); // هذا ملف الاتصال بالقاعدة

// جلب كل الأخبار مع Pagination
exports.getAllNews = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  db.query(
    'SELECT * FROM news ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset],
    (err, result) => {
      if (err) return res.status(500).json({ status: false, message: err.message });
      res.json({ status: true, data: result.rows });
    }
  );
};

// البحث حسب العنوان
exports.searchByTitle = (req, res) => {
  db.query(
    'SELECT * FROM news WHERE title ILIKE $1 ORDER BY created_at DESC',
    [`%${req.query.title}%`],
    (err, result) => {
      if (err) return res.status(500).json({ status: false, message: err.message });
      res.json({ status: true, data: result.rows });
    }
  );
};

// زيادة اللايك
exports.likeNews = (req, res) => {
  db.query(
    'UPDATE news SET likes = likes + 1 WHERE id = $1 RETURNING *',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ status: false, message: err.message });
      res.json({ status: true, message: 'Liked', data: result.rows[0] });
    }
  );
};
