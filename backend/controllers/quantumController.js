const Quantum = require('../models/Quantum');

// @desc    Get quantum link by branch and year
// @route   GET /api/quantum/:branchId/:yearId
// @access  Public
const getQuantum = async (req, res) => {
    try {
        const quantum = await Quantum.findOne({
            branchId: req.params.branchId,
            yearId: req.params.yearId,
        });

        if (!quantum) {
            return res.status(404).json({ message: 'Quantum resource not found' });
        }

        res.json(quantum);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a quantum link
// @route   POST /api/quantum
// @access  Private/Admin
const createQuantum = async (req, res) => {
    try {
        const { branchId, yearId, telegramLink } = req.body;

        const quantumExists = await Quantum.findOne({ branchId, yearId });
        if (quantumExists) {
            return res.status(400).json({ message: 'Quantum resource already exists for this branch and year' });
        }

        const quantum = new Quantum({
            branchId,
            yearId,
            telegramLink,
        });

        const createdQuantum = await quantum.save();
        res.status(201).json(createdQuantum);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuantum,
    createQuantum,
};
