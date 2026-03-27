const Course = require('../models/Course');
const Branch = require('../models/Branch');
const Year = require('../models/Year');

const BASE_URL = 'https://www.aktupyq.com';

// Format Date for Sitemap (YYYY-MM-DD)
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

exports.getSitemapIndex = async (req, res) => {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <sitemap>
      <loc>${BASE_URL}/sitemap.xml</loc>
      <lastmod>${getTodayDate()}</lastmod>
   </sitemap>
   <sitemap>
      <loc>${BASE_URL}/sitemap-materials.xml</loc>
      <lastmod>${getTodayDate()}</lastmod>
   </sitemap>
</sitemapindex>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemapIndex);
};

exports.getStaticSitemap = async (req, res) => {
    const staticUrls = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/syllabus', priority: '0.8', changefreq: 'weekly' },
        { url: '/about', priority: '0.5', changefreq: 'monthly' },
        { url: '/contact', priority: '0.5', changefreq: 'monthly' },
        { url: '/search', priority: '0.8', changefreq: 'weekly' }
    ];

    let urlsXml = staticUrls.map(item => `
    <url>
        <loc>${BASE_URL}${item.url}</loc>
        <lastmod>${getTodayDate()}</lastmod>
        <changefreq>${item.changefreq}</changefreq>
        <priority>${item.priority}</priority>
    </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
};

exports.getDynamicSitemap = async (req, res) => {
    try {
        const courses = await Course.find();
        let urlsXml = '';

        for (const course of courses) {
            const courseId = course.name.toLowerCase().replace('.', '');
            
            // Add Course page URL
            urlsXml += `
    <url>
        <loc>${BASE_URL}/course/${courseId}</loc>
        <lastmod>${getTodayDate()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;

            const branches = await Branch.find({ courseId: course._id });
            
            for (const branch of branches) {
                const branchId = branch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const branchUrl = `/course/${courseId}/${branchId}`;
                
                urlsXml += `
    <url>
        <loc>${BASE_URL}${branchUrl}</loc>
        <lastmod>${getTodayDate()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;

                const years = await Year.find({ branchId: branch._id });
                for (const year of years) {
                    const yearId = year.yearNumber.toString();
                    const yearUrl = `${branchUrl}/${yearId}`;
                    
                    urlsXml += `
    <url>
        <loc>${BASE_URL}${yearUrl}</loc>
        <lastmod>${getTodayDate()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;
                }
            }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send('Error generating sitemap');
    }
};
