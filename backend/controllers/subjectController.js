const Subject = require('../models/Subject');

// @desc    Get subjects by year
// @route   GET /api/subjects/:yearId
// @access  Public
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ yearId: req.params.yearId });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    try {
        const { name, code, yearId } = req.body;

        const subjectExists = await Subject.findOne({ code, yearId });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject with this code already exists in this year' });
        }

        const subject = new Subject({
            name,
            code,
            yearId,
        });

        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        await Subject.deleteOne({ _id: subject._id });
        // Optionally cascade delete materials here

        res.json({ message: 'Subject removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    deleteSubject,
};
