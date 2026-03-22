const Branch = require('../models/Branch');

// @desc    Get branches by course
// @route   GET /api/branches/:courseId
// @access  Public
const getBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ courseId: req.params.courseId });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private/Admin
const createBranch = async (req, res) => {
    try {
        const { name, courseId } = req.body;

        const branchExists = await Branch.findOne({ name, courseId });
        if (branchExists) {
            return res.status(400).json({ message: 'Branch already exists in this course' });
        }

        const branch = new Branch({
            name,
            courseId,
        });

        const createdBranch = await branch.save();
        res.status(201).json(createdBranch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
const deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);

        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        await Branch.deleteOne({ _id: branch._id });
        // Optionally cascade delete years, subjects, materials here

        res.json({ message: 'Branch removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBranches,
    createBranch,
    deleteBranch,
};
