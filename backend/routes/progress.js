import express from 'express';
import Progress from '../models/Progress.js';
import Session from '../models/Session.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All progress routes require authentication
router.use(protect);

// @desc    Get user's overall progress
// @route   GET /api/progress/overview
// @access  Private
router.get('/overview', async (req, res) => {
    try {
        const overallProgress = await Progress.getUserOverallProgress(req.user.id);
        const streakData = await Progress.getUserStreak(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                ...overallProgress,
                streak: streakData,
            },
        });
    } catch (error) {
        console.error('Get progress overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress overview',
        });
    }
});

// @desc    Get user's phase progress
// @route   GET /api/progress/phase/:phaseId
// @access  Private
router.get('/phase/:phaseId', async (req, res) => {
    try {
        const { phaseId } = req.params;
        const phaseProgress = await Progress.getUserPhaseProgress(req.user.id, phaseId);

        res.status(200).json({
            success: true,
            data: phaseProgress,
        });
    } catch (error) {
        console.error('Get phase progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching phase progress',
        });
    }
});

// @desc    Get user's progress for specific item
// @route   GET /api/progress/item/:itemId
// @access  Private
router.get('/item/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const progress = await Progress.findOne({
            user: req.user.id,
            itemId,
        });

        if (!progress) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('Get item progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching item progress',
        });
    }
});

// @desc    Get all user progress items
// @route   GET /api/progress
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { phaseId, sectionId, status, page = 1, limit = 50 } = req.query;

        const query = { user: req.user.id };

        if (phaseId) query.phaseId = phaseId;
        if (sectionId) query.sectionId = sectionId;
        if (status) query.status = status;

        const progress = await Progress.find(query)
            .sort({ updatedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Progress.countDocuments(query);

        res.status(200).json({
            success: true,
            data: progress,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get all progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress',
        });
    }
});

// @desc    Update or create progress for an item
// @route   POST /api/progress
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { itemId, phaseId, sectionId, status, notes, difficulty, rating, tags } = req.body;

        if (!itemId || !phaseId || !sectionId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide itemId, phaseId, sectionId, and status',
            });
        }

        const progress = await Progress.findOneAndUpdate(
            { user: req.user.id, itemId },
            {
                user: req.user.id,
                itemId,
                phaseId,
                sectionId,
                status,
                notes,
                difficulty,
                rating,
                tags: tags || [],
            },
            { upsert: true, new: true, runValidators: true }
        );

        // Update active session with activity
        const activeSession = await Session.getActiveSession(req.user.id);
        if (activeSession) {
            await activeSession.addActivity({
                itemId,
                phaseId,
                sectionId,
                type: status === 'completed' ? 'completed' : status === 'in-progress' ? 'started' : 'viewed',
            });
        }

        res.status(201).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('Update progress error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Progress entry already exists for this item',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error updating progress',
        });
    }
});

// @desc    Update progress for an item
// @route   PUT /api/progress/:itemId
// @access  Private
router.put('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status, notes, difficulty, rating, tags, timeSpent } = req.body;

        const progress = await Progress.findOne({
            user: req.user.id,
            itemId,
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress entry not found',
            });
        }

        // Update fields
        if (status !== undefined) progress.status = status;
        if (notes !== undefined) progress.notes = notes;
        if (difficulty !== undefined) progress.difficulty = difficulty;
        if (rating !== undefined) progress.rating = rating;
        if (tags !== undefined) progress.tags = tags;
        if (timeSpent !== undefined) progress.timeSpent += timeSpent;

        await progress.save();

        // Update active session with activity
        const activeSession = await Session.getActiveSession(req.user.id);
        if (activeSession) {
            await activeSession.addActivity({
                itemId,
                phaseId: progress.phaseId,
                sectionId: progress.sectionId,
                type: status === 'completed' ? 'completed' : status === 'in-progress' ? 'started' : 'viewed',
            });
        }

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating progress',
        });
    }
});

// @desc    Delete progress for an item
// @route   DELETE /api/progress/:itemId
// @access  Private
router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;

        const progress = await Progress.findOneAndDelete({
            user: req.user.id,
            itemId,
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress entry not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Progress entry deleted successfully',
        });
    } catch (error) {
        console.error('Delete progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting progress',
        });
    }
});

// @desc    Get recently completed items
// @route   GET /api/progress/recent
// @access  Private
router.get('/recent/completed', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const recentItems = await Progress.getRecentlyCompleted(req.user.id, parseInt(limit));

        res.status(200).json({
            success: true,
            data: recentItems,
        });
    } catch (error) {
        console.error('Get recent completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching recent completed items',
        });
    }
});

// @desc    Get progress statistics
// @route   GET /api/progress/stats
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const { period = 'all' } = req.query;

        const matchQuery = { user: req.user.id };

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

            matchQuery.updatedAt = { $gte: startDate };
        }

        const stats = await Progress.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    completedItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgressItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    averageRating: { $avg: '$rating' },
                    difficultyDistribution: {
                        $push: '$difficulty'
                    },
                }
            }
        ]);

        const result = stats[0] || {
            totalItems: 0,
            completedItems: 0,
            inProgressItems: 0,
            totalTimeSpent: 0,
            averageRating: 0,
            difficultyDistribution: [],
        };

        // Calculate difficulty distribution
        const difficultyCounts = result.difficultyDistribution.reduce((acc, diff) => {
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
        }, {});

        result.completionPercentage = result.totalItems > 0
            ? Math.round((result.completedItems / result.totalItems) * 100)
            : 0;

        result.difficultyCounts = difficultyCounts;

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Get progress stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress statistics',
        });
    }
});

export default router;
