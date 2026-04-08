const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .post(protect, admin, createSubject);

router.route('/:yearId')
    .get(getSubjects);

router.route('/:id')
    .delete(protect, admin, deleteSubject);

module.exports = router;
