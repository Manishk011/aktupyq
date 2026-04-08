const mongoose = require('mongoose');

const branchSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a branch name'],
            trim: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Branch', branchSchema);
