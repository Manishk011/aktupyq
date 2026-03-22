const mongoose = require('mongoose');

const quantumSchema = mongoose.Schema(
    {
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        yearId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Year',
            required: true,
        },
        telegramLink: {
            type: String,
            required: [true, 'Please add a telegram link'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Quantum', quantumSchema);
