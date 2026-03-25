const Quantum = require('../models/Quantum');
const https = require('https');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// @desc    Get quantum links by subject
// @route   GET /api/quantum/subject/:subjectId
const mongoose = require('mongoose');

const getQuantums = async (req, res) => {
    try {
        const subject = await mongoose.model('Subject').findById(req.params.subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        
        const sameNameSubjects = await mongoose.model('Subject').find({ name: subject.name });
        const subjectIds = sameNameSubjects.map(s => s._id);

        const quantums = await Quantum.find({
            subjectId: { $in: subjectIds },
        }).populate('subjectId', 'name code').sort({ createdAt: -1 });

        res.json({ materials: quantums });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update a quantum link/file
// @route   POST /api/quantum
// @access  Private/Admin
const createQuantum = async (req, res) => {
    try {
        const { branchId, yearId, subjectId, type, telegramLink, isGdrive, gdriveLink, id } = req.body;

        const isGdriveBool = isGdrive === 'true' || isGdrive === true;
        const quantumType = type || 'link';

        if (!subjectId) {
            return res.status(400).json({ message: 'Subject is required' });
        }

        if (quantumType === 'file') {
            if (!isGdriveBool && !req.file && !id) {
                return res.status(400).json({ message: 'Please upload a file or provide a GDrive link' });
            }
            if (isGdriveBool && !gdriveLink) {
                return res.status(400).json({ message: 'Please provide a GDrive link' });
            }
        } else if (quantumType === 'link' && !telegramLink) {
            return res.status(400).json({ message: 'Please provide a Telegram link' });
        }

        let quantum;
        
        if (id) {
            quantum = await Quantum.findById(id);
            if (!quantum) {
                return res.status(404).json({ message: 'Quantum not found' });
            }
            
            // If replacing an old local file, delete it from S3
            if (quantum.type === 'file' && !quantum.isGdrive && quantum.fileUrl) {
                if (quantumType === 'link' || isGdriveBool || req.file) {
                    try {
                        const urlObj = new URL(quantum.fileUrl);
                        const key = decodeURIComponent(urlObj.pathname.substring(1));
                        await s3Config.send(new DeleteObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: key,
                        }));
                    } catch (err) {
                        console.error("Failed to delete old S3 quantum file:", err);
                    }
                }
            }
        } else {
            quantum = new Quantum({ branchId, yearId, subjectId });
        }

        quantum.type = quantumType;
        quantum.subjectId = subjectId;

        if (quantumType === 'link') {
            quantum.telegramLink = telegramLink;
            quantum.fileUrl = undefined;
            quantum.gdriveLink = undefined;
            quantum.isGdrive = false;
        } else {
            quantum.isGdrive = isGdriveBool;
            quantum.telegramLink = undefined;
            if (isGdriveBool) {
                quantum.gdriveLink = gdriveLink;
                quantum.fileUrl = undefined;
            } else if (req.file) {
                quantum.fileUrl = req.file.location;
                quantum.gdriveLink = undefined;
            }
        }

        const savedQuantum = await quantum.save();
        res.status(id ? 200 : 201).json(savedQuantum);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Quantum
// @route   DELETE /api/quantum/:id
// @access  Private/Admin
const deleteQuantum = async (req, res) => {
    try {
        const quantum = await Quantum.findById(req.params.id);

        if (!quantum) {
            return res.status(404).json({ message: 'Quantum resource not found' });
        }

        if (quantum.type === 'file' && !quantum.isGdrive && quantum.fileUrl) {
            try {
                const urlObj = new URL(quantum.fileUrl);
                const key = decodeURIComponent(urlObj.pathname.substring(1));
                await s3Config.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                }));
            } catch (err) {
                console.error("Failed to delete S3 quantum file on delete:", err);
            }
        }

        await quantum.deleteOne();
        res.status(200).json({ message: 'Quantum removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Proxy quantum (GDrive or local)
// @route   GET /api/quantum/:id/proxy
// @access  Public
const proxyQuantum = async (req, res) => {
    try {
        const material = await Quantum.findById(req.params.id);
        const action = req.query.action === 'view' ? 'inline' : 'attachment';

        if (!material || material.type !== 'file') {
            return res.status(404).json({ message: 'Quantum file not found' });
        }

        if (material.isGdrive) {
            const urlMatch = material.gdriveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || material.gdriveLink.match(/id=([a-zA-Z0-9_-]+)/);
            if (!urlMatch) {
                return res.status(400).json({ message: 'Invalid GDrive link format' });
            }
            const fileId = urlMatch[1];
            const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

            https.get(directUrl, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    https.get(response.headers.location, (redirectResponse) => {
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', `${action}; filename="Quantum_${material._id}.pdf"`);
                        redirectResponse.pipe(res);
                    }).on('error', (e) => res.status(500).json({ message: 'Error fetching from redirect: ' + e.message }));
                } else {
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `${action}; filename="Quantum_${material._id}.pdf"`);
                    response.pipe(res);
                }
            }).on('error', (e) => res.status(500).json({ message: 'Error proxying GDrive file: ' + e.message }));
        } else {
            if (material.fileUrl && material.fileUrl.includes('s3')) {
                try {
                    const urlObj = new URL(material.fileUrl);
                    const key = decodeURIComponent(urlObj.pathname.substring(1));
                    const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key });
                    const response = await s3Config.send(command);
                    res.setHeader('Content-Type', response.ContentType || 'application/pdf');
                    res.setHeader('Content-Disposition', `${action}; filename="Quantum_${material._id}.pdf"`);
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

module.exports = {
    getQuantums,
    createQuantum,
    deleteQuantum,
    proxyQuantum
};
