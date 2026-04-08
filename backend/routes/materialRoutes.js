const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, deleteMaterial, proxyMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, admin } = require('../middleware/auth');
// multer removed

router.route('/')
    .post(protect, admin, createMaterial);

router.route('/:subjectId')
    .get(getMaterials);

router.route('/:id')
    .put(protect, admin, updateMaterial)
    .delete(protect, admin, deleteMaterial);

router.route('/:id/proxy')
    .get(proxyMaterial);

module.exports = router;
