const express = require('express');
const router = express.Router();
const { getQuantum, createQuantum } = require('../controllers/quantumController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .post(protect, admin, createQuantum);

router.route('/:branchId/:yearId')
    .get(getQuantum);

module.exports = router;
