import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, db } from './database/sqlite.js';
import authRoutes from './routes/auth-sqlite.js';
import crudRoutes from './routes/crud.js';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Database setup
const dbPath = path.join(__dirname, 'data', 'roadmap.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
console.log('🗄️ Initializing SQLite database...');

// Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Progress table
db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    itemId TEXT NOT NULL,
    phaseId TEXT NOT NULL,
    sectionId TEXT NOT NULL,
    status TEXT CHECK(status IN ('not-started', 'in-progress', 'completed')) DEFAULT 'not-started',
    startedAt DATETIME,
    completedAt DATETIME,
    timeSpent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(userId, itemId)
  )
`);

console.log('✅ SQLite database initialized successfully');
console.log(`📍 Database location: ${dbPath}`);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

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

// Basic auth endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get([email, username]);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists',
            });
        }

        // Insert user (password should be hashed in production)
        const stmt = db.prepare(`
      INSERT INTO users (username, email, password, displayName)
      VALUES (?, ?, ?, ?)
    `);

        const result = stmt.run([username, email, password, displayName || username]);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.lastInsertRowid,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1').get([email]);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate simple token (in production, use JWT)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});

// Progress endpoints
app.post('/api/progress', async (req, res) => {
    try {
        const { userId, itemId, phaseId, sectionId, status, notes } = req.body;

        const now = new Date().toISOString();
        let startedAt = null;
        let completedAt = null;

        if (status === 'in-progress') {
            startedAt = now;
        } else if (status === 'completed') {
            startedAt = now;
            completedAt = now;
        }

        // Check if progress exists
        const existing = db.prepare('SELECT id FROM progress WHERE userId = ? AND itemId = ?').get([userId, itemId]);

        let result;
        if (existing) {
            // Update existing progress
            const stmt = db.prepare(`
        UPDATE progress 
        SET status = ?, startedAt = ?, completedAt = ?, notes = ?, attempts = attempts + 1, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
            result = stmt.run([status, startedAt, completedAt, notes, existing.id]);
        } else {
            // Create new progress
            const stmt = db.prepare(`
        INSERT INTO progress (userId, itemId, phaseId, sectionId, status, startedAt, completedAt, notes, attempts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
            result = stmt.run([userId, itemId, phaseId, sectionId, status, startedAt, completedAt, notes]);
        }

        res.status(201).json({
            success: true,
            message: 'Progress updated successfully',
            progressId: result.lastInsertRowid,
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
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedItems,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as inProgressItems,
        SUM(timeSpent) as totalTimeSpent
      FROM progress 
      WHERE userId = ?
    `).get([userId]);

        const completionPercentage = stats.totalItems > 0
            ? Math.round((stats.completedItems / stats.totalItems) * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalItems: stats.totalItems || 0,
                completedItems: stats.completedItems || 0,
                inProgressItems: stats.inProgressItems || 0,
                notStartedItems: (stats.totalItems || 0) - (stats.completedItems || 0) - (stats.inProgressItems || 0),
                totalTimeSpent: stats.totalTimeSpent || 0,
                completionPercentage,
            },
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
