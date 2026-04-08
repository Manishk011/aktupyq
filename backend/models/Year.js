const mongoose = require('mongoose');

const yearSchema = mongoose.Schema(
    {
        yearNumber: {
            type: Number,
            required: [true, 'Please add a year number (1, 2, 3, 4)'],
            min: 1,
            max: 4,
        },
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Year', yearSchema);
