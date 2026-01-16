import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '../data/roadmap.db');

// Create database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export const initializeDatabase = () => {
    console.log('🗄️ Initializing SQLite database...');

    // Users table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT,
      avatar TEXT,
      bio TEXT,
      location TEXT,
      website TEXT,
      github TEXT,
      linkedin TEXT,
      isActive INTEGER DEFAULT 1,
      isVerified INTEGER DEFAULT 0,
      lastLogin DATETIME,
      darkMode INTEGER DEFAULT 0,
      emailNotifications INTEGER DEFAULT 1,
      publicProfile INTEGER DEFAULT 1,
      totalSessions INTEGER DEFAULT 0,
      totalTimeSpent INTEGER DEFAULT 0,
      itemsCompleted INTEGER DEFAULT 0,
      streakDays INTEGER DEFAULT 0,
      longestStreak INTEGER DEFAULT 0,
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
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(userId, itemId)
    )
  `);

    // Sessions table
    db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      duration INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      userAgent TEXT,
      ipAddress TEXT,
      deviceType TEXT CHECK(deviceType IN ('desktop', 'mobile', 'tablet')) DEFAULT 'desktop',
      browser TEXT,
      os TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // Session activities table
    db.exec(`
    CREATE TABLE IF NOT EXISTS session_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      phaseId TEXT NOT NULL,
      sectionId TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      duration INTEGER DEFAULT 0,
      type TEXT CHECK(type IN ('viewed', 'started', 'completed', 'reviewed')) DEFAULT 'viewed',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES sessions (id) ON DELETE CASCADE
    )
  `);

    // Tags table for progress items
    db.exec(`
    CREATE TABLE IF NOT EXISTS progress_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      progressId INTEGER NOT NULL,
      tag TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (progressId) REFERENCES progress (id) ON DELETE CASCADE
    )
  `);

    // Custom phases table
    db.exec(`
    CREATE TABLE IF NOT EXISTS custom_phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order INTEGER DEFAULT 0,
      color TEXT DEFAULT '#primary-500',
      icon TEXT DEFAULT 'book',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // Custom sections table
    db.exec(`
    CREATE TABLE IF NOT EXISTS custom_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      phaseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (phaseId) REFERENCES custom_phases (id) ON DELETE CASCADE
    )
  `);

    // Custom items table
    db.exec(`
    CREATE TABLE IF NOT EXISTS custom_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      phaseId INTEGER NOT NULL,
      sectionId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
      estimatedTime INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      resources TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (phaseId) REFERENCES custom_phases (id) ON DELETE CASCADE,
      FOREIGN KEY (sectionId) REFERENCES custom_sections (id) ON DELETE CASCADE
    )
  `);

    // User notes table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      content TEXT NOT NULL,
      isPrivate INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // User ratings table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // User bookmarks table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      collectionId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // User collections table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      isPublic INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // Collection items table
    db.exec(`
    CREATE TABLE IF NOT EXISTS collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collectionId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collectionId) REFERENCES user_collections (id) ON DELETE CASCADE
    )
  `);

    // Comments table
    db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      content TEXT NOT NULL,
      parentId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // Likes table
    db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      itemId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

    // Create indexes for better performance
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);
    
    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(userId);
    CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
    CREATE INDEX IF NOT EXISTS idx_progress_phase ON progress(phaseId);
    CREATE INDEX IF NOT EXISTS idx_progress_item ON progress(itemId);
    CREATE INDEX IF NOT EXISTS idx_progress_completed ON progress(completedAt);
    
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(isActive);
    CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(startTime);
    
    CREATE INDEX IF NOT EXISTS idx_activities_session ON session_activities(sessionId);
    CREATE INDEX IF NOT EXISTS idx_activities_item ON session_activities(itemId);
    
    CREATE INDEX IF NOT EXISTS idx_tags_progress ON progress_tags(progressId);
  `);

    console.log('✅ SQLite database initialized successfully');
    console.log(`📍 Database location: ${dbPath}`);
};

// Helper functions for common operations
export const runQuery = (query, params = []) => {
    try {
        const stmt = db.prepare(query);
        return stmt.all(params);
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export const runQuerySingle = (query, params = []) => {
    try {
        const stmt = db.prepare(query);
        return stmt.get(params);
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export const runQueryUpdate = (query, params = []) => {
    try {
        const stmt = db.prepare(query);
        const result = stmt.run(params);
        return {
            success: true,
            changes: result.changes,
            lastInsertRowid: result.lastInsertRowid
        };
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

// Close database connection
export const closeDatabase = () => {
    db.close();
    console.log('🔒 Database connection closed');
};

export default db;
