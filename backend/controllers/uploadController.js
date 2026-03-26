const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// @desc    Generate a Presigned URL for direct S3 upload
// @route   POST /api/upload/presigned-url
// @access  Private/Admin
const generatePresignedUrl = async (req, res) => {
    try {
        const { filename, fileType } = req.body;

        if (!filename || !fileType) {
            return res.status(400).json({ message: 'Filename and fileType are required' });
        }

        const ext = path.extname(filename);
        if (ext !== '.pdf') {
            return res.status(400).json({ message: 'Only PDF files are allowed' });
        }

        // Clean filename, timestamp it to make unique key
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `materials/${Date.now()}-${safeName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: fileType
        });

        // URL expires in 1 hour
        const uploadUrl = await getSignedUrl(s3Config, command, { expiresIn: 3600 });
        
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        res.json({
            uploadUrl,
            fileUrl
        });
    } catch (error) {
        console.error("Presigned URL error:", error);
        res.status(500).json({ message: 'Error generating upload URL' });
    }
};

module.exports = {
    generatePresignedUrl
};
