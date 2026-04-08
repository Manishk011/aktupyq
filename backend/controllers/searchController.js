const Course = require('../models/Course');
const Branch = require('../models/Branch');
const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Material = require('../models/Material');
const Quantum = require('../models/Quantum');

// @desc    Global search for materials, pyqs, quantums, syllabus
// @route   GET /api/search
// @access  Public
const globalSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.json({ materials: [], quantums: [] });
        }

        const regex = new RegExp(query, 'i');

        // 1. Find matching courses
        const courses = await Course.find({ name: regex });
        const courseIds = courses.map(c => c._id);

        // 2. Find matching branches (by name OR by courseId)
        const branches = await Branch.find({
            $or: [
                { name: regex },
                { courseId: { $in: courseIds } }
            ]
        }).populate('courseId');
        const branchIds = branches.map(b => b._id);

        // 3. Find matching years
        const yearQuery = [ { branchId: { $in: branchIds } } ];
        // If query is a single digit 1-4, it could match yearNumber directly
        const numQuery = parseInt(query);
        if (!isNaN(numQuery) && numQuery >= 1 && numQuery <= 4) {
            yearQuery.push({ yearNumber: numQuery });
        }

        const years = await Year.find({ $or: yearQuery });
        const yearIds = years.map(y => y._id);

        // 4. Find matching subjects
        const subjects = await Subject.find({
            $or: [
                { name: regex },
                { code: regex },
                { yearId: { $in: yearIds } }
            ]
        });
        const subjectIds = subjects.map(s => s._id);

        // 5. Find Materials matching title, session, or subjectId
        const materials = await Material.find({
            $or: [
                { title: regex },
                { session: regex },
                { subjectId: { $in: subjectIds } }
            ]
        }).populate({
            path: 'subjectId',
            populate: {
                path: 'yearId',
                populate: {
                    path: 'branchId',
                    populate: {
                        path: 'courseId'
                    }
                }
            }
        }).limit(50); // Limit results to prevent massive payloads

        // 6. Find Quantums matching yearId or branchId (or a telegram link if we wanted, but mostly year/branch)
        const quantums = await Quantum.find({
            $or: [
                { yearId: { $in: yearIds } },
                { branchId: { $in: branchIds } }
            ]
        }).populate({
            path: 'yearId',
            populate: {
                path: 'branchId',
                populate: {
                    path: 'courseId'
                }
            }
        }).populate({
            path: 'branchId',
            populate: {
                path: 'courseId'
            }
        }).limit(20);

        res.json({
            courses,
            branches,
            materials,
            quantums
        });
    } catch (error) {
        console.error('Search ERROR:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

module.exports = {
    globalSearch
};
