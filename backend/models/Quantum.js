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
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        type: {
            type: String,
            required: [true, 'Please select quantum type'],
            enum: ['link', 'file'],
            default: 'link',
        },
        telegramLink: {
            type: String,
            required: function() { return this.type === 'link'; },
        },
        fileUrl: {
            type: String,
            required: function() { return this.type === 'file' && !this.isGdrive; },
        },
        gdriveLink: {
            type: String,
            required: function() { return this.type === 'file' && this.isGdrive; },
        },
        isGdrive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Quantum', quantumSchema);
