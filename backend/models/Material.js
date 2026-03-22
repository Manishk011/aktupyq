const mongoose = require('mongoose');

const materialSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a material title'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Please select material type'],
            enum: ['notes', 'pyq', 'syllabus'],
        },
        fileUrl: {
            type: String,
            required: function() { return !this.isGdrive; },
        },
        gdriveLink: {
            type: String,
            required: function() { return this.isGdrive; },
        },
        isGdrive: {
            type: Boolean,
            default: false,
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Material', materialSchema);
