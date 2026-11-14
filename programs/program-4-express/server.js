const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Check environment variables
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
    console.error('Please configure JWT_SECRET and MONGODB_URI in your .env file.');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// MongoDB Shipment Schema
const shipmentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    receiver: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Transit', 'Delivered']
    }
}, {
    timestamps: true
});

// MongoDB User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    }
}, {
    timestamps: true
});

// Create MongoDB Models
const Shipment = mongoose.model('Shipment', shipmentSchema);
const User = mongoose.model('User', userSchema);

// Read existing JSON data for migration
const dataDirectory = path.join(__dirname, 'data');
const shipmentFile = path.join(dataDirectory, 'shipments.json');
const userFile = path.join(dataDirectory, 'users.json');

function readData(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Import existing JSON records into MongoDB without overwriting
// records that are already present in the database.
async function migrateLegacyData() {
    const oldShipments = readData(shipmentFile);
    const oldUsers = readData(userFile);

    for (const shipment of oldShipments) {
        if (
            shipment.id &&
            shipment.receiver &&
            shipment.destination &&
            ['Pending', 'In Transit', 'Delivered'].includes(shipment.status)
        ) {
            await Shipment.updateOne(
                { id: shipment.id },
                {
                    $setOnInsert: {
                        id: shipment.id,
                        receiver: shipment.receiver,
                        destination: shipment.destination,
                        status: shipment.status
                    }
                },
                { upsert: true }
            );
        }
    }

    for (const user of oldUsers) {
        if (user.username && user.password) {
            await User.updateOne(
                { username: user.username },
                {
                    $setOnInsert: {
                        username: user.username,
                        password: user.password
                    }
                },
                { upsert: true }
            );
        }
    }

    console.log('Legacy JSON data migration completed.');
}

// Shipment validation middleware
function validateShipment(req, res, next) {
    const { receiver, destination, status } = req.body;
    const id = req.params.id || req.body.id;

    if (
        typeof id !== 'string' || !id.trim() ||
        typeof receiver !== 'string' || !receiver.trim() ||
        typeof destination !== 'string' || !destination.trim() ||
        typeof status !== 'string' ||
        !['Pending', 'In Transit', 'Delivered'].includes(status)
    ) {
        return res.status(400).json({
            message: 'Provide a valid ID, receiver, destination and status.'
        });
    }

    next();
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Authentication token required.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: 'Invalid or expired token.'
            });
        }

        req.user = user;
        next();
    });
}

// Register a user with a hashed password
app.post('/api/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' || !username.trim() ||
            typeof password !== 'string' || password.length < 8
        ) {
            return res.status(400).json({
                message: 'Username is required and password must have at least 8 characters.'
            });
        }

        const existingUser = await User.findOne({
            username: username.trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Username already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username: username.trim(),
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully.'
        });
    } catch (error) {
        next(error);
    }
});

// Login and receive a JWT
app.post('/api/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                message: 'Username and password are required.'
            });
        }

        const user = await User.findOne({
            username: username.trim()
        }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: 'Invalid username or password.'
            });
        }

        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful.',
            token
        });
    } catch (error) {
        next(error);
    }
});

// Protected route
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'You accessed a protected route.',
        user: req.user
    });
});

// GET: Retrieve all shipments
app.get('/api/shipments', async (req, res, next) => {
    try {
        const shipments = await Shipment.find().sort({ createdAt: -1 });
        res.json(shipments);
    } catch (error) {
        next(error);
    }
});

// GET: Retrieve one shipment
app.get('/api/shipments/:id', async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({
            id: req.params.id
        });

        if (!shipment) {
            return res.status(404).json({
                message: 'Shipment not found.'
            });
        }

        res.json(shipment);
    } catch (error) {
        next(error);
    }
});

// POST: Create a shipment
app.post('/api/shipments', validateShipment, async (req, res, next) => {
    try {
        const newShipment = await Shipment.create({
            id: req.body.id.trim(),
            receiver: req.body.receiver.trim(),
            destination: req.body.destination.trim(),
            status: req.body.status
        });

        res.status(201).json({
            message: 'Shipment created successfully.',
            shipment: newShipment
        });
    } catch (error) {
        next(error);
    }
});

// PUT: Update a shipment
app.put('/api/shipments/:id', validateShipment, async (req, res, next) => {
    try {
        const updatedShipment = await Shipment.findOneAndUpdate(
            { id: req.params.id },
            {
                receiver: req.body.receiver.trim(),
                destination: req.body.destination.trim(),
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedShipment) {
            return res.status(404).json({
                message: 'Shipment not found.'
            });
        }

        res.json({
            message: 'Shipment updated successfully.',
            shipment: updatedShipment
        });
    } catch (error) {
        next(error);
    }
});

// DELETE: Remove a shipment
app.delete('/api/shipments/:id', async (req, res, next) => {
    try {
        const deletedShipment = await Shipment.findOneAndDelete({
            id: req.params.id
        });

        if (!deletedShipment) {
            return res.status(404).json({
                message: 'Shipment not found.'
            });
        }

        res.json({
            message: 'Shipment deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
});

// Centralized error-handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error.message);

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            message: 'Invalid JSON request body.'
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: 'A record with this ID or username already exists.'
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed.',
            error: error.message
        });
    }

    res.status(500).json({
        message: 'Internal server error.'
    });
});

// Connect to MongoDB and start the Express server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Successfully connected to MongoDB Atlas.');

        await migrateLegacyData();

        app.listen(PORT, () => {
            console.log(`SwiftTrack Express server running at http://localhost:${PORT}`);
            console.log('Shipment API: http://localhost:3002/api/shipments');
        });
    } catch (error) {
        console.error('Unable to start SwiftTrack:', error.message);
        process.exit(1);
    }
}

startServer();