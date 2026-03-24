const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/years', require('./routes/yearRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/quantum', require('./routes/quantumRoutes'));
app.use('/api/stats', require('./routes/statRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
