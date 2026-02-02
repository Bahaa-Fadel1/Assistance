// controllers/newsController.js
const db = require('../config/db');

exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const result = await db.query(
      'SELECT * FROM news ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({ status: true, data: result.rows });
  } catch (err) {
    console.error('Database error (getAllNews):', err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.searchByTitle = async (req, res) => {
  try {
    const title = req.query.title || '';
    const result = await db.query(
      'SELECT * FROM news WHERE title ILIKE $1 ORDER BY created_at DESC',
      [`%${title}%`]
    );
    res.json({ status: true, data: result.rows });
  } catch (err) {
    console.error('Database error (searchByTitle):', err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.searchByDate = async (req, res) => {
  try {
    const date = req.query.date; // expect 'YYYY-MM-DD'
    if (!date) return res.status(400).json({ status: false, message: 'Date required' });

    const result = await db.query(
      "SELECT * FROM news WHERE created_at::date = $1 ORDER BY created_at DESC",
      [date]
    );
    res.json({ status: true, data: result.rows });
  } catch (err) {
    console.error('Database error (searchByDate):', err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.likeNews = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('UPDATE news SET likes = likes + 1 WHERE id = $1', [id]);
    res.json({ status: true, message: 'Liked' });
  } catch (err) {
    console.error('Database error (likeNews):', err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};