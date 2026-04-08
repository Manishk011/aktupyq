const Year = require('../models/Year');

// @desc    Get years by branch
// @route   GET /api/years/:branchId
// @access  Public
const getYears = async (req, res) => {
    try {
        const years = await Year.find({ branchId: req.params.branchId }).sort({ yearNumber: 1 });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a year
// @route   POST /api/years
// @access  Private/Admin
const createYear = async (req, res) => {
    try {
        const { yearNumber, branchId } = req.body;

        const yearExists = await Year.findOne({ yearNumber, branchId });
        if (yearExists) {
            return res.status(400).json({ message: 'Year already exists in this branch' });
        }

        const year = new Year({
            yearNumber,
            branchId,
        });

        const createdYear = await year.save();
        res.status(201).json(createdYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a year
// @route   DELETE /api/years/:id
// @access  Private/Admin
const deleteYear = async (req, res) => {
    try {
        const year = await Year.findById(req.params.id);

        if (!year) {
            return res.status(404).json({ message: 'Year not found' });
        }

        await Year.deleteOne({ _id: year._id });
        // Optionally cascade delete subjects, materials here

        res.json({ message: 'Year removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getYears,
    createYear,
    deleteYear,
};
