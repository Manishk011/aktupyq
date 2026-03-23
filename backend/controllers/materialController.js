const Material = require('../models/Material');
const fs = require('fs');
const https = require('https');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// @desc    Get materials by subject
// @route   GET /api/materials/:subjectId
// @access  Public
const getMaterials = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const type = req.query.type;

        const query = { subjectId: req.params.subjectId };
        if (type) {
            query.type = type;
        }

        const count = await Material.countDocuments(query);
        const materials = await Material.find(query)
            .populate('uploadedBy', 'name')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ materials, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = async (req, res) => {
    try {
        const { title, type, session, subjectId, isGdrive, gdriveLink } = req.body;

        const isGdriveBool = isGdrive === 'true' || isGdrive === true;

        if (!isGdriveBool && !req.file) {
            return res.status(400).json({ message: 'Please upload a file or provide a GDrive link' });
        }

        if (isGdriveBool && !gdriveLink) {
            return res.status(400).json({ message: 'Please provide a GDrive link' });
        }

        let materialData = {
            title,
            type,
            session,
            subjectId,
            uploadedBy: req.user._id,
            isGdrive: isGdriveBool
        };

        if (isGdriveBool) {
            materialData.gdriveLink = gdriveLink;
        } else {
            // Provided by multer-s3
            materialData.fileUrl = req.file.location;
        }

        const material = new Material(materialData);
        const createdMaterial = await material.save();

        res.status(201).json(createdMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Remove file from S3 bucket if not a GDrive link
        if (!material.isGdrive && material.fileUrl) {
            try {
                // Determine the key from the fileUrl
                // e.g., https://my-bucket.s3.region.amazonaws.com/materials/file-123.pdf
                // The key is what comes after the bucket domain
                const urlObj = new URL(material.fileUrl);
                const key = decodeURIComponent(urlObj.pathname.substring(1)); // Remove leading slash
                
                const deleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                };
                
                await s3Config.send(new DeleteObjectCommand(deleteParams));
            } catch (err) {
                console.error("Failed to delete from S3:", err);
            }
        }

        await Material.deleteOne({ _id: material._id });
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Proxy material (GDrive or local)
// @route   GET /api/materials/:id/proxy
// @access  Public
const proxyMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        const action = req.query.action === 'view' ? 'inline' : 'attachment';

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        if (material.isGdrive) {
            // Extract file ID from GDrive link
            const urlMatch = material.gdriveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || material.gdriveLink.match(/id=([a-zA-Z0-9_-]+)/);
            if (!urlMatch) {
                return res.status(400).json({ message: 'Invalid GDrive link format' });
            }
            const fileId = urlMatch[1];
            const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

            https.get(directUrl, (response) => {
                // Handle redirects (Google Drive often redirects)
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    https.get(response.headers.location, (redirectResponse) => {
                        res.setHeader('Content-Type', 'application/pdf'); // Force PDF for syllabus/notes/pyqs
                        res.setHeader('Content-Disposition', `${action}; filename="${material.title}.pdf"`);
                        redirectResponse.pipe(res);
                    }).on('error', (e) => {
                        res.status(500).json({ message: 'Error fetching from redirect: ' + e.message });
                    });
                } else {
                    res.setHeader('Content-Type', 'application/pdf'); // Force PDF
                    res.setHeader('Content-Disposition', `${action}; filename="${material.title}.pdf"`);
                    response.pipe(res);
                }
            }).on('error', (e) => {
                res.status(500).json({ message: 'Error proxying GDrive file: ' + e.message });
            });
        } else {
            // For AWS S3 / Local files
            if (material.fileUrl && material.fileUrl.includes('s3')) {
                try {
                    const urlObj = new URL(material.fileUrl);
                    const key = decodeURIComponent(urlObj.pathname.substring(1));
                    
                    const command = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: key
                    });
                    
                    const response = await s3Config.send(command);
                    res.setHeader('Content-Type', response.ContentType || 'application/pdf');
                    // Ensure the title is safe for filenames
                    const safeTitle = material.title.replace(/[^a-zA-Z0-9_-]/g, '_');
                    res.setHeader('Content-Disposition', `${action}; filename="${safeTitle}.pdf"`);
                    
                    // response.Body is a readable stream in Node.js
                    response.Body.pipe(res);
                } catch (s3Error) {
                    console.error("S3 proxy error:", s3Error);
                    res.status(500).json({ message: 'Error proxying S3 file' });
                }
            } else {
                res.redirect(material.fileUrl);
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const { title, type, session, subjectId, isGdrive, gdriveLink } = req.body;
        const isGdriveBool = isGdrive === 'true' || isGdrive === true;

        material.title = title || material.title;
        material.type = type || material.type;
        if (session !== undefined) {
            material.session = session;
        }
        material.subjectId = subjectId || material.subjectId;

        // If they provided a new file or changed the GDrive link
        if (isGdriveBool) {
            if (gdriveLink && gdriveLink !== material.gdriveLink) {
                // If switching from local to gdrive or changing gdrive link

                // If it was local before, we should delete the old S3 file
                if (!material.isGdrive && material.fileUrl) {
                    try {
                        const urlObj = new URL(material.fileUrl);
                        const key = decodeURIComponent(urlObj.pathname.substring(1));
                        await s3Config.send(new DeleteObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: key,
                        }));
                    } catch (err) {
                        console.error("Failed to delete from S3:", err);
                    }
                    material.fileUrl = undefined;
                }

                material.isGdrive = true;
                material.gdriveLink = gdriveLink;
            } else if (!material.isGdrive) {
                // Switching from local to GDrive without changing link? (Shouldn't happen, but catch)
                material.isGdrive = true;
                material.gdriveLink = gdriveLink;
            }
        } else {
            // It's local file
            if (req.file) {
                // They uploaded a new local file. Delete the old one from S3 if it existed.
                if (!material.isGdrive && material.fileUrl) {
                    try {
                        const urlObj = new URL(material.fileUrl);
                        const key = decodeURIComponent(urlObj.pathname.substring(1));
                        await s3Config.send(new DeleteObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: key,
                        }));
                    } catch (err) {
                        console.error("Failed to delete from S3:", err);
                    }
                }

                material.isGdrive = false;
                material.gdriveLink = undefined;
                material.fileUrl = req.file.location;
            } else if (material.isGdrive) {
                return res.status(400).json({ message: 'Must provide a file when switching from GDrive to Local' });
            }
            // else they kept the same local file
        }

        const updatedMaterial = await material.save();
        res.json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMaterials,
    createMaterial,
    deleteMaterial,
    proxyMaterial,
    updateMaterial
};
