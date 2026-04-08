const express = require('express');
const router = express.Router();
const { generatePresignedUrl } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

router.route('/presigned-url')
    .post(protect, admin, generatePresignedUrl);

module.exports = router;
