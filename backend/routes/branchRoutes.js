const express = require('express');
const router = express.Router();
const { getBranches, createBranch, deleteBranch } = require('../controllers/branchController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .post(protect, admin, createBranch);

router.route('/:courseId')
    .get(getBranches);

router.route('/:id')
    .delete(protect, admin, deleteBranch);

module.exports = router;
