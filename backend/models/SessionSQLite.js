import { runQuery, runQuerySingle, runQueryUpdate } from '../database/sqlite.js';

class SessionSQLite {
    // Create new session
    static async create(sessionData) {
        const { userId, userAgent, ipAddress, deviceType, browser, os } = sessionData;

        const query = `
      INSERT INTO sessions (
        userId, startTime, userAgent, ipAddress, deviceType, browser, os
      ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
    `;

        const result = runQueryUpdate(query, [
            userId, userAgent, ipAddress, deviceType, browser, os
        ]);

        return this.findById(result.lastInsertRowid);
    }

    // Find session by ID
    static async findById(id) {
        const query = `
      SELECT s.*, u.username, u.displayName
      FROM sessions s
      JOIN users u ON s.userId = u.id
      WHERE s.id = ?
    `;

        return runQuerySingle(query, [id]);
    }

    // Get active session for user
    static async getActiveSession(userId) {
        const query = `
      SELECT s.*, u.username, u.displayName
      FROM sessions s
      JOIN users u ON s.userId = u.id
      WHERE s.userId = ? AND s.isActive = 1
      ORDER BY s.startTime DESC
      LIMIT 1
    `;

        return runQuerySingle(query, [userId]);
    }

    // Get user sessions
    static async getUserSessions(userId, options = {}) {
        const { page = 1, limit = 10, startDate, endDate, sortBy = 'startTime', sortOrder = 'DESC' } = options;

        const conditions = ['userId = ?'];
        const values = [userId];

        if (startDate || endDate) {
            if (startDate) {
                conditions.push('startTime >= ?');
                values.push(startDate);
            }
            if (endDate) {
                conditions.push('startTime <= ?');
                values.push(endDate);
            }
        }

        const offset = (page - 1) * limit;

        const query = `
      SELECT s.*, u.username, u.displayName
      FROM sessions s
      JOIN users u ON s.userId = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

        values.push(limit, offset);

        const sessions = runQuery(query, values);

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM sessions s
      WHERE ${conditions.join(' AND ')}
    `;

        const countResult = runQuerySingle(countQuery, values.slice(0, -2));

        return {
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        };
    }

    // End session
    static async endSession(id) {
        const query = `
      UPDATE sessions 
      SET endTime = CURRENT_TIMESTAMP, 
          duration = (julianday(CURRENT_TIMESTAMP) - julianday(startTime)) * 24 * 60,
          isActive = 0,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

        runQueryUpdate(query, [id]);

        return this.findById(id);
    }

    // Add activity to session
    static async addActivity(activityData) {
        const { sessionId, itemId, phaseId, sectionId, type, notes } = activityData;

        const query = `
      INSERT INTO session_activities (
        sessionId, itemId, phaseId, sectionId, startTime, type, notes
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
    `;

        const result = runQueryUpdate(query, [
            sessionId, itemId, phaseId, sectionId, type, notes
        ]);

        return this.findActivityById(result.lastInsertRowid);
    }

    // Update activity
    static async updateActivity(id, updateData) {
        const { endTime, notes } = updateData;

        const updates = [];
        const values = [];

        if (endTime !== undefined) {
            updates.push('endTime = ?');
            values.push(endTime);
            updates.push('duration = (julianday(?) - julianday(startTime)) * 24 * 60');
            values.push(endTime);
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);

        const query = `UPDATE session_activities SET ${updates.join(', ')} WHERE id = ?`;

        runQueryUpdate(query, values);

        return this.findActivityById(id);
    }

    // Find activity by ID
    static async findActivityById(id) {
        const query = `
      SELECT sa.*, s.userId
      FROM session_activities sa
      JOIN sessions s ON sa.sessionId = s.id
      WHERE sa.id = ?
    `;

        return runQuerySingle(query, [id]);
    }

    // Get session statistics
    static async getSessionStats(userId, period = 'all') {
        let dateCondition = '';
        const values = [userId];

        if (period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }

            dateCondition = 'AND startTime >= ?';
            values.push(startDate.toISOString());
        }

        // Overall stats
        const statsQuery = `
      SELECT 
        COUNT(*) as totalSessions,
        SUM(duration) as totalTimeSpent,
        AVG(duration) as averageSessionTime,
        MAX(duration) as longestSession,
        MIN(duration) as shortestSession
      FROM sessions 
      WHERE userId = ? ${dateCondition}
    `;

        const stats = runQuerySingle(statsQuery, values);

        // Daily stats
        const dailyQuery = `
      SELECT 
        DATE(startTime) as date,
        COUNT(*) as sessions,
        SUM(duration) as totalTime
      FROM sessions 
      WHERE userId = ? ${dateCondition}
      GROUP BY DATE(startTime)
      ORDER BY date
    `;

        const daily = runQuery(dailyQuery, values);

        return {
            summary: stats || {
                totalSessions: 0,
                totalTimeSpent: 0,
                averageSessionTime: 0,
                longestSession: 0,
                shortestSession: 0
            },
            daily
        };
    }

    // Get device analytics
    static async getDeviceAnalytics(userId) {
        const query = `
      SELECT 
        deviceType,
        COUNT(*) as count,
        SUM(duration) as totalTime
      FROM sessions 
      WHERE userId = ?
      GROUP BY deviceType
      ORDER BY count DESC
    `;

        return runQuery(query, [userId]);
    }

    // Get activity heatmap data
    static async getActivityHeatmap(userId, days = 365) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const query = `
      SELECT 
        DATE(startTime) as date,
        COUNT(*) as activityCount,
        SUM(duration) as totalTime
      FROM sessions 
      WHERE userId = ? AND startTime >= ?
      GROUP BY DATE(startTime)
      ORDER BY date
    `;

        return runQuery(query, [userId, startDate.toISOString()]);
    }

    // Get session activities
    static async getSessionActivities(sessionId) {
        const query = `
      SELECT *
      FROM session_activities
      WHERE sessionId = ?
      ORDER BY startTime
    `;

        return runQuery(query, [sessionId]);
    }

    // Get all sessions (for admin)
    static async findAll(options = {}) {
        const { page = 1, limit = 20, sortBy = 'startTime', sortOrder = 'DESC' } = options;

        const offset = (page - 1) * limit;

        const query = `
      SELECT s.*, u.username, u.displayName
      FROM sessions s
      JOIN users u ON s.userId = u.id
      ORDER BY s.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

        const sessions = runQuery(query, [limit, offset]);

        // Get total count
        const countQuery = 'SELECT COUNT(*) as total FROM sessions';
        const countResult = runQuerySingle(countQuery);

        return {
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        };
    }

    // Clean up old inactive sessions
    static async cleanupOldSessions(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const query = `
      DELETE FROM sessions 
      WHERE isActive = 0 AND endTime < ?
    `;

        const result = runQueryUpdate(query, [cutoffDate.toISOString()]);

        return result.changes;
    }
}

export default SessionSQLite;
