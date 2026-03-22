const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: __dirname + '/../.env' });

connectDB();

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@aktupyq.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const admin = new User({
            name: 'Admin User',
            email: 'admin@aktupyq.com',
            password: 'adminpassword123',
            role: 'admin',
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@aktupyq.com');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error(`Error with seeding: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
