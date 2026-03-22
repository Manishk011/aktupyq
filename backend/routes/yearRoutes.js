const express = require('express');
const router = express.Router();
const { getYears, createYear, deleteYear } = require('../controllers/yearController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .post(protect, admin, createYear);

router.route('/:branchId')
    .get(getYears);

router.route('/:id')
    .delete(protect, admin, deleteYear);

module.exports = router;
