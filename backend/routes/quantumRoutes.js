const express = require('express');
const router = express.Router();
const { getQuantums, createQuantum, deleteQuantum, proxyQuantum } = require('../controllers/quantumController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .post(protect, admin, upload.single('file'), createQuantum);

router.route('/subject/:subjectId')
    .get(getQuantums);

router.route('/:id')
    .delete(protect, admin, deleteQuantum);

router.route('/:id/proxy')
    .get(proxyQuantum);

module.exports = router;
