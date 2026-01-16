import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDatabase, db } from './database/sqlite.js';
import authRoutes from './routes/auth-sqlite.js';
import ProgressSQLite from './models/ProgressSQLite.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'SQLite',
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'SQLite backend is working!',
        port: PORT,
        database: 'SQLite',
    });
});

// Progress endpoints (basic implementation)
app.post('/api/progress', async (req, res) => {
    try {
        const progress = await ProgressSQLite.upsert(req.body);

        res.status(201).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating progress',
        });
    }
});

app.get('/api/progress/overview', async (req, res) => {
    try {
        // For now, return a mock response since we need user authentication
        res.status(200).json({
            success: true,
            data: {
                totalItems: 0,
                completedItems: 0,
                inProgressItems: 0,
                notStartedItems: 0,
                totalTimeSpent: 0,
                completionPercentage: 0,
                streak: { currentStreak: 0, longestStreak: 0 }
            }
        });
    } catch (error) {
        console.error('Progress overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress overview',
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SQLite server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: SQLite`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔒 Shutting down gracefully...');
    db.close();
    process.exit(0);
});

export default app;
