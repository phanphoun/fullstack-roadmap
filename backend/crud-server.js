import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, db } from './database/sqlite.js';
import authRoutes from './routes/auth-sqlite.js';
import crudRoutes from './routes/crud.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', crudRoutes);

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
        message: 'SQLite CRUD backend is working!',
        port: PORT,
        database: 'SQLite',
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
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
    console.log(`🚀 SQLite CRUD server running on port ${PORT}`);
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
