const Course = require('../models/Course');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Material = require('../models/Material');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalCourses,
            totalBranches,
            totalSubjects,
            totalMaterials,
            materials
        ] = await Promise.all([
            Course.countDocuments(),
            Branch.countDocuments(),
            Subject.countDocuments(),
            Material.countDocuments(),
            Material.find({}, 'type createdAt').sort({ createdAt: -1 })
        ]);

        // Calculate materials distribution by type
        const materialsByType = {
            Notes: 0,
            PYQ: 0,
            Syllabus: 0,
            Quantum: 0
        };

        materials.forEach(m => {
            if (materialsByType[m.type] !== undefined) {
                materialsByType[m.type]++;
            }
        });

        // Get 5 most recent activities (we'll just use the latest materials as recent activity for now)
        const recentMaterials = materials.slice(0, 5);

        // System Stats
        const dbStats = await mongoose.connection.db.stats();
        const dbStorageSizeMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);
        
        const systemStatus = {
            isActive: mongoose.connection.readyState === 1,
            dbStorageUsedMB: parseFloat(dbStorageSizeMB),
            dbStorageLimitMB: 512, // 512MB assumed limits for free tier MongoDB
        };

        res.json({
            stats: {
                totalCourses,
                totalBranches,
                totalSubjects,
                totalMaterials
            },
            materialsByType,
            recentActivity: recentMaterials,
            systemStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
