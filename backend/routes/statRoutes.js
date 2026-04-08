const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getDashboardStats);

module.exports = router;
