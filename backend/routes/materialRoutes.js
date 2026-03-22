const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, deleteMaterial, proxyMaterial, updateMaterial } = require('../controllers/materialController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .post(protect, admin, upload.single('file'), createMaterial);

router.route('/:subjectId')
    .get(getMaterials);

router.route('/:id')
    .put(protect, admin, upload.single('file'), updateMaterial)
    .delete(protect, admin, deleteMaterial);

router.route('/:id/proxy')
    .get(proxyMaterial);

module.exports = router;
