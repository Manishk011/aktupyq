const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a subject name'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Please add a subject code'],
            trim: true,
            uppercase: true,
        },
        yearId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Year',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Subject', subjectSchema);
