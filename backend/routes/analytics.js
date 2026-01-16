import express from 'express';
import Progress from '../models/Progress.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// @desc    Get user's learning analytics
// @route   GET /api/analytics/learning
// @access  Private
router.get('/learning', async (req, res) => {
    try {
        const { period = 'all' } = req.query;

        // Get progress statistics
        const progressStats = await Progress.aggregate([
            { $match: { user: req.user._id } },
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
                    phasesCompleted: { $addToSet: '$phaseId' },
                }
            }
        ]);

        // Get session statistics
        const sessionStats = await Session.getSessionStats(req.user.id, period);

        // Get learning streak
        const streakData = await Progress.getUserStreak(req.user.id);

        // Get activity by month
        const monthlyActivity = await Progress.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
                    itemsCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    timeSpent: { $sum: '$timeSpent' },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const result = progressStats[0] || {
            totalItems: 0,
            completedItems: 0,
            inProgressItems: 0,
            totalTimeSpent: 0,
            averageRating: 0,
            difficultyDistribution: [],
            phasesCompleted: [],
        };

        result.completionPercentage = result.totalItems > 0
            ? Math.round((result.completedItems / result.totalItems) * 100)
            : 0;

        result.phasesCompleted = result.phasesCompleted.length;

        // Calculate difficulty distribution
        const difficultyCounts = result.difficultyDistribution.reduce((acc, diff) => {
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                progress: {
                    ...result,
                    difficultyCounts,
                },
                sessions: sessionStats,
                streak: streakData,
                monthlyActivity,
            },
        });
    } catch (error) {
        console.error('Get learning analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching learning analytics',
        });
    }
});

// @desc    Get user's time analytics
// @route   GET /api/analytics/time
// @access  Private
router.get('/time', async (req, res) => {
    try {
        const { period = 'all' } = req.query;

        const sessionStats = await Session.getSessionStats(req.user.id, period);

        // Get daily time spent
        const dailyTimeSpent = await Session.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    totalTime: { $sum: '$duration' },
                    sessions: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get hourly distribution
        const hourlyDistribution = await Session.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: { $hour: '$startTime' },
                    totalTime: { $sum: '$duration' },
                    sessions: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get best learning days
        const bestDays = await Session.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: { $dayOfWeek: '$startTime' },
                    totalTime: { $sum: '$duration' },
                    sessions: { $sum: 1 },
                }
            },
            { $sort: { totalTime: -1 } }
        ]);

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const bestDaysNamed = bestDays.map(day => ({
            day: dayNames[day._id - 1],
            totalTime: day.totalTime,
            sessions: day.sessions,
        }));

        res.status(200).json({
            success: true,
            data: {
                summary: sessionStats.summary,
                daily: dailyTimeSpent,
                hourly: hourlyDistribution,
                bestDays: bestDaysNamed,
            },
        });
    } catch (error) {
        console.error('Get time analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching time analytics',
        });
    }
});

// @desc    Get user's progress trends
// @route   GET /api/analytics/trends
// @access  Private
router.get('/trends', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get completion trends
        const completionTrends = await Progress.aggregate([
            {
                $match: {
                    user: req.user._id,
                    status: 'completed',
                    completedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
                    completed: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get progress accumulation
        const progressAccumulation = await Progress.aggregate([
            {
                $match: {
                    user: req.user._id,
                    completedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
                    completed: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Calculate cumulative totals
        let cumulative = 0;
        const cumulativeData = progressAccumulation.map(item => {
            cumulative += item.completed;
            return {
                date: item._id,
                cumulative,
                daily: item.completed,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                completionTrends,
                progressAccumulation: cumulativeData,
            },
        });
    } catch (error) {
        console.error('Get progress trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress trends',
        });
    }
});

// @desc    Get user's skill analytics
// @route   GET /api/analytics/skills
// @access  Private
router.get('/skills', async (req, res) => {
    try {
        // Get progress by phase (representing different skill areas)
        const skillsByPhase = await Progress.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$phaseId',
                    totalItems: { $sum: 1 },
                    completedItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgressItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    averageRating: { $avg: '$rating' },
                }
            },
            { $sort: { completedItems: -1 } }
        ]);

        // Calculate skill proficiency
        const skillsWithProficiency = skillsByPhase.map(skill => ({
            ...skill,
            proficiency: skill.totalItems > 0
                ? Math.round((skill.completedItems / skill.totalItems) * 100)
                : 0,
        }));

        // Get difficulty distribution by skill
        const difficultyBySkill = await Progress.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: {
                        phaseId: '$phaseId',
                        difficulty: '$difficulty',
                    },
                    count: { $sum: 1 },
                }
            },
            {
                $group: {
                    _id: '$_id.phaseId',
                    difficulties: {
                        $push: {
                            difficulty: '$_id.difficulty',
                            count: '$count',
                        }
                    },
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                skills: skillsWithProficiency,
                difficultyAnalysis: difficultyBySkill,
            },
        });
    } catch (error) {
        console.error('Get skill analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching skill analytics',
        });
    }
});

// @desc    Get global analytics (admin only)
// @route   GET /api/analytics/global
// @access  Private (Admin only)
router.get('/global', adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalProgress = await Progress.countDocuments();
        const totalSessions = await Session.countDocuments();

        // User growth over time
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    newUsers: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Progress completion rates
        const completionRates = await Progress.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                }
            }
        ]);

        // Most popular items
        const popularItems = await Progress.aggregate([
            {
                $group: {
                    _id: '$itemId',
                    totalAttempts: { $sum: '$attempts' },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                }
            },
            { $sort: { totalAttempts: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalProgress,
                    totalSessions,
                },
                userGrowth,
                completionRates,
                popularItems,
            },
        });
    } catch (error) {
        console.error('Get global analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching global analytics',
        });
    }
});

export default router;
