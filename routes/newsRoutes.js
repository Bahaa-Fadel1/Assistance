// routes/newsRoutes.js
const express = require('express');
const router = express.Router();

// استدعاء الكنترولر
const newsController = require('../controllers/newsController');

// تأكد أن الدوال موجودة
router.get('/', newsController.getAllNews);
router.get('/search/title', newsController.searchByTitle);
router.get('/search/date', newsController.searchByDate);
router.post('/like/:id', newsController.likeNews);

module.exports = router;