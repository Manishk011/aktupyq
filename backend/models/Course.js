const mongoose = require('mongoose');

const courseSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a course name'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

courseSchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().split(' ').join('-');
    }
});

module.exports = mongoose.model('Course', courseSchema);
