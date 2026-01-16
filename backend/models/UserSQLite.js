import bcrypt from 'bcryptjs';
import { runQuery, runQuerySingle, runQueryUpdate } from '../database/sqlite.js';

class UserSQLite {
    // Create new user
    static async create(userData) {
        const { username, email, password, displayName } = userData;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const query = `
      INSERT INTO users (
        username, email, password, displayName, darkMode, 
        emailNotifications, publicProfile
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const result = runQueryUpdate(query, [
            username,
            email,
            hashedPassword,
            displayName || username,
            0, // darkMode
            1, // emailNotifications
            1  // publicProfile
        ]);

        return this.findById(result.lastInsertRowid);
    }

    // Find user by ID
    static async findById(id) {
        const query = `
      SELECT id, username, email, displayName, avatar, bio, location, website, 
             github, linkedin, isActive, isVerified, lastLogin,
             darkMode, emailNotifications, publicProfile,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak,
             createdAt, updatedAt
      FROM users 
      WHERE id = ? AND isActive = 1
    `;

        return runQuerySingle(query, [id]);
    }

    // Find user by email
    static async findByEmail(email) {
        const query = `
      SELECT id, username, email, password, displayName, avatar, bio, location, website, 
             github, linkedin, isActive, isVerified, lastLogin,
             darkMode, emailNotifications, publicProfile,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak,
             createdAt, updatedAt
      FROM users 
      WHERE email = ? AND isActive = 1
    `;

        return runQuerySingle(query, [email]);
    }

    // Find user by username
    static async findByUsername(username) {
        const query = `
      SELECT id, username, email, displayName, avatar, bio, location, website, 
             github, linkedin, isActive, isVerified, lastLogin,
             darkMode, emailNotifications, publicProfile,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak,
             createdAt, updatedAt
      FROM users 
      WHERE username = ? AND isActive = 1
    `;

        return runQuerySingle(query, [username]);
    }

    // Update user profile
    static async updateProfile(id, updateData) {
        const allowedFields = [
            'displayName', 'avatar', 'bio', 'location', 'website', 'github', 'linkedin',
            'darkMode', 'emailNotifications', 'publicProfile'
        ];

        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        runQueryUpdate(query, values);

        return this.findById(id);
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const query = `
      UPDATE users 
      SET password = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

        runQueryUpdate(query, [hashedPassword, id]);

        return true;
    }

    // Compare password
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update last login
    static async updateLastLogin(id) {
        const query = `
      UPDATE users 
      SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

        runQueryUpdate(query, [id]);

        return true;
    }

    // Get user stats
    static async getUserStats(id) {
        // Progress stats
        const progressQuery = `
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedItems,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as inProgressItems,
        SUM(timeSpent) as totalTimeSpent,
        AVG(rating) as averageRating
      FROM progress 
      WHERE userId = ?
    `;

        const progressStats = runQuerySingle(progressQuery, [id]);

        // Session stats
        const sessionQuery = `
      SELECT 
        COUNT(*) as totalSessions,
        SUM(duration) as totalTimeSpent,
        AVG(duration) as averageSessionTime,
        MAX(duration) as longestSession
      FROM sessions 
      WHERE userId = ?
    `;

        const sessionStats = runQuerySingle(sessionQuery, [id]);

        return {
            progress: progressStats || { totalItems: 0, completedItems: 0, inProgressItems: 0, totalTimeSpent: 0, averageRating: 0 },
            sessions: sessionStats || { totalSessions: 0, totalTimeSpent: 0, averageSessionTime: 0, longestSession: 0 }
        };
    }

    // Search users
    static async search(searchTerm, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const query = `
      SELECT id, username, displayName, avatar, bio, location,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak,
             createdAt
      FROM users 
      WHERE isActive = 1 AND publicProfile = 1 AND (
        username LIKE ? OR 
        displayName LIKE ? OR 
        bio LIKE ?
      )
      ORDER BY itemsCompleted DESC
      LIMIT ? OFFSET ?
    `;

        const searchPattern = `%${searchTerm}%`;
        const users = runQuery(query, [searchPattern, searchPattern, searchPattern, limit, offset]);

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      WHERE isActive = 1 AND publicProfile = 1 AND (
        username LIKE ? OR 
        displayName LIKE ? OR 
        bio LIKE ?
      )
    `;

        const countResult = runQuerySingle(countQuery, [searchPattern, searchPattern, searchPattern]);

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        };
    }

    // Get leaderboard
    static async getLeaderboard(type = 'completion', limit = 50) {
        let orderBy;

        switch (type) {
            case 'completion':
                orderBy = 'itemsCompleted DESC';
                break;
            case 'streak':
                orderBy = 'streakDays DESC';
                break;
            case 'time':
                orderBy = 'totalTimeSpent DESC';
                break;
            default:
                orderBy = 'itemsCompleted DESC';
        }

        const query = `
      SELECT id, username, displayName, avatar, location,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak
      FROM users 
      WHERE isActive = 1 AND publicProfile = 1
      ORDER BY ${orderBy}
      LIMIT ?
    `;

        const users = runQuery(query, [limit]);

        return users.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: user[type === 'completion' ? 'itemsCompleted' : type === 'streak' ? 'streakDays' : 'totalTimeSpent']
        }));
    }

    // Delete user (soft delete)
    static async delete(id) {
        const query = `
      UPDATE users 
      SET isActive = 0, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

        runQueryUpdate(query, [id]);

        return true;
    }

    // Get all active users
    static async findActiveUsers() {
        const query = `
      SELECT id, username, email, displayName, avatar, bio, location, website, 
             github, linkedin, isActive, isVerified, lastLogin,
             darkMode, emailNotifications, publicProfile,
             totalSessions, totalTimeSpent, itemsCompleted, streakDays, longestStreak,
             createdAt, updatedAt
      FROM users 
      WHERE isActive = 1
      ORDER BY createdAt DESC
    `;

        return runQuery(query);
    }
}

export default UserSQLite;
