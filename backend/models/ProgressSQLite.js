import { runQuery, runQuerySingle, runQueryUpdate } from '../database/sqlite.js';

class ProgressSQLite {
    // Create or update progress
    static async upsert(progressData) {
        const { userId, itemId, phaseId, sectionId, status, notes, difficulty, rating, tags, timeSpent } = progressData;

        // Check if progress exists
        const existing = this.findByUserAndItem(userId, itemId);

        if (existing) {
            // Update existing progress
            return this.update(existing.id, {
                status,
                notes,
                difficulty,
                rating,
                tags,
                timeSpent: timeSpent || 0
            });
        } else {
            // Create new progress
            return this.create({
                userId,
                itemId,
                phaseId,
                sectionId,
                status,
                notes,
                difficulty,
                rating,
                tags,
                timeSpent: timeSpent || 0
            });
        }
    }

    // Create new progress
    static async create(progressData) {
        const { userId, itemId, phaseId, sectionId, status, notes, difficulty, rating, tags, timeSpent } = progressData;

        const now = new Date().toISOString();
        let startedAt = null;
        let completedAt = null;

        if (status === 'in-progress') {
            startedAt = now;
        } else if (status === 'completed') {
            startedAt = now;
            completedAt = now;
        }

        const query = `
      INSERT INTO progress (
        userId, itemId, phaseId, sectionId, status, startedAt, completedAt,
        notes, difficulty, rating, timeSpent, attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

        const result = runQueryUpdate(query, [
            userId, itemId, phaseId, sectionId, status, startedAt, completedAt,
            notes, difficulty, rating, timeSpent
        ]);

        const progress = this.findById(result.lastInsertRowid);

        // Add tags if provided
        if (tags && tags.length > 0) {
            await this.addTags(result.lastInsertRowid, tags);
        }

        return progress;
    }

    // Update progress
    static async update(id, updateData) {
        const { status, notes, difficulty, rating, tags, timeSpent } = updateData;

        const updates = [];
        const values = [];

        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);

            // Update timestamps based on status
            if (status === 'in-progress') {
                updates.push('startedAt = COALESCE(NULLIF(startedAt, \'\'), CURRENT_TIMESTAMP)');
            } else if (status === 'completed') {
                updates.push('completedAt = CURRENT_TIMESTAMP');
                updates.push('startedAt = COALESCE(NULLIF(startedAt, \'\'), CURRENT_TIMESTAMP)');
            } else if (status === 'not-started') {
                updates.push('startedAt = NULL');
                updates.push('completedAt = NULL');
            }
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }

        if (difficulty !== undefined) {
            updates.push('difficulty = ?');
            values.push(difficulty);
        }

        if (rating !== undefined) {
            updates.push('rating = ?');
            values.push(rating);
        }

        if (timeSpent !== undefined) {
            updates.push('timeSpent = timeSpent + ?');
            values.push(timeSpent);
        }

        updates.push('attempts = attempts + 1');
        updates.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `UPDATE progress SET ${updates.join(', ')} WHERE id = ?`;

        runQueryUpdate(query, values);

        // Update tags if provided
        if (tags !== undefined) {
            await this.updateTags(id, tags);
        }

        return this.findById(id);
    }

    // Find progress by ID
    static async findById(id) {
        const query = `
      SELECT p.*, GROUP_CONCAT(pt.tag) as tags
      FROM progress p
      LEFT JOIN progress_tags pt ON p.id = pt.progressId
      WHERE p.id = ?
      GROUP BY p.id
    `;

        const result = runQuerySingle(query, [id]);

        if (result && result.tags) {
            result.tags = result.tags.split(',');
        }

        return result;
    }

    // Find progress by user and item
    static async findByUserAndItem(userId, itemId) {
        const query = `
      SELECT p.*, GROUP_CONCAT(pt.tag) as tags
      FROM progress p
      LEFT JOIN progress_tags pt ON p.id = pt.progressId
      WHERE p.userId = ? AND p.itemId = ?
      GROUP BY p.id
    `;

        const result = runQuerySingle(query, [userId, itemId]);

        if (result && result.tags) {
            result.tags = result.tags.split(',');
        }

        return result;
    }

    // Get all progress for user
    static async findByUser(userId, options = {}) {
        const { phaseId, sectionId, status, page = 1, limit = 50 } = options;

        const conditions = ['userId = ?'];
        const values = [userId];

        if (phaseId) {
            conditions.push('phaseId = ?');
            values.push(phaseId);
        }

        if (sectionId) {
            conditions.push('sectionId = ?');
            values.push(sectionId);
        }

        if (status) {
            conditions.push('status = ?');
            values.push(status);
        }

        const offset = (page - 1) * limit;

        const query = `
      SELECT p.*, GROUP_CONCAT(pt.tag) as tags
      FROM progress p
      LEFT JOIN progress_tags pt ON p.id = pt.progressId
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY p.updatedAt DESC
      LIMIT ? OFFSET ?
    `;

        values.push(limit, offset);

        const progress = runQuery(query, values);

        // Format tags
        progress.forEach(item => {
            if (item.tags) {
                item.tags = item.tags.split(',');
            } else {
                item.tags = [];
            }
        });

        // Get total count
        const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM progress p
      WHERE ${conditions.join(' AND ')}
    `;

        const countResult = runQuerySingle(countQuery, values.slice(0, -2));

        return {
            progress,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        };
    }

    // Get user's overall progress
    static async getUserOverallProgress(userId) {
        const query = `
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedItems,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as inProgressItems,
        COUNT(CASE WHEN status = 'not-started' THEN 1 END) as notStartedItems,
        SUM(timeSpent) as totalTimeSpent,
        AVG(rating) as averageRating
      FROM progress 
      WHERE userId = ?
    `;

        const result = runQuerySingle(query, [userId]);

        if (!result) {
            return {
                totalItems: 0,
                completedItems: 0,
                inProgressItems: 0,
                notStartedItems: 0,
                totalTimeSpent: 0,
                averageRating: 0,
                completionPercentage: 0
            };
        }

        result.completionPercentage = result.totalItems > 0
            ? Math.round((result.completedItems / result.totalItems) * 100)
            : 0;

        return result;
    }

    // Get user's phase progress
    static async getUserPhaseProgress(userId, phaseId) {
        const query = `
      SELECT 
        sectionId,
        COUNT(*) as totalItems,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedItems,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as inProgressItems
      FROM progress 
      WHERE userId = ? AND phaseId = ?
      GROUP BY sectionId
    `;

        return runQuery(query, [userId, phaseId]);
    }

    // Get recently completed items
    static async getRecentlyCompleted(userId, limit = 10) {
        const query = `
      SELECT p.*, u.username, u.displayName
      FROM progress p
      JOIN users u ON p.userId = u.id
      WHERE p.userId = ? AND p.status = 'completed' AND p.completedAt IS NOT NULL
      ORDER BY p.completedAt DESC
      LIMIT ?
    `;

        return runQuery(query, [userId, limit]);
    }

    // Get progress statistics
    static async getProgressStats(userId, period = 'all') {
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

            dateCondition = 'AND updatedAt >= ?';
            values.push(startDate.toISOString());
        }

        const query = `
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedItems,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as inProgressItems,
        SUM(timeSpent) as totalTimeSpent,
        AVG(rating) as averageRating,
        difficulty
      FROM progress 
      WHERE userId = ? ${dateCondition}
      GROUP BY difficulty
    `;

        const results = runQuery(query, values);

        // Calculate overall stats and difficulty distribution
        let totalItems = 0;
        let completedItems = 0;
        let inProgressItems = 0;
        let totalTimeSpent = 0;
        let totalRating = 0;
        let ratingCount = 0;
        const difficultyCounts = {};

        results.forEach(row => {
            totalItems += row.totalItems;
            completedItems += row.completedItems;
            inProgressItems += row.inProgressItems;
            totalTimeSpent += row.totalTimeSpent;

            if (row.averageRating) {
                totalRating += row.averageRating * row.totalItems;
                ratingCount += row.totalItems;
            }

            difficultyCounts[row.difficulty] = (difficultyCounts[row.difficulty] || 0) + row.totalItems;
        });

        return {
            totalItems,
            completedItems,
            inProgressItems,
            notStartedItems: totalItems - completedItems - inProgressItems,
            totalTimeSpent,
            averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
            completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
            difficultyCounts
        };
    }

    // Get user's learning streak
    static async getUserStreak(userId) {
        // Get completed dates
        const query = `
      SELECT DATE(completedAt) as completedDate
      FROM progress 
      WHERE userId = ? AND status = 'completed' AND completedAt IS NOT NULL
      ORDER BY completedDate DESC
    `;

        const results = runQuery(query, [userId]);

        if (results.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        const dates = results.map(row => row.completedDate);
        const uniqueDates = [...new Set(dates)];

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (let i = 0; i < uniqueDates.length; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (uniqueDates.includes(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                break;
            } else {
                break;
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        const sortedDates = uniqueDates.sort().reverse();
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const dayDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return { currentStreak, longestStreak };
    }

    // Delete progress
    static async delete(id) {
        const query = 'DELETE FROM progress WHERE id = ?';
        runQueryUpdate(query, [id]);
        return true;
    }

    // Tag management
    static async addTags(progressId, tags) {
        if (!tags || tags.length === 0) return;

        const query = 'INSERT INTO progress_tags (progressId, tag) VALUES (?, ?)';

        tags.forEach(tag => {
            runQueryUpdate(query, [progressId, tag]);
        });
    }

    static async updateTags(progressId, tags) {
        // Remove existing tags
        runQueryUpdate('DELETE FROM progress_tags WHERE progressId = ?', [progressId]);

        // Add new tags
        if (tags && tags.length > 0) {
            await this.addTags(progressId, tags);
        }
    }
}

export default ProgressSQLite;
