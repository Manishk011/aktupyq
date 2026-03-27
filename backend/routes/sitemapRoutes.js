const express = require('express');
const router = express.Router();
const { getSitemapIndex, getStaticSitemap, getDynamicSitemap } = require('../controllers/sitemapController');

router.get('/sitemap_index.xml', getSitemapIndex);
router.get('/sitemap.xml', getStaticSitemap);
router.get('/sitemap-materials.xml', getDynamicSitemap);

module.exports = router;
