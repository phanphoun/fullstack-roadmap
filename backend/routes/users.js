import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Session from '../models/Session.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get public user profile
// @route   GET /api/users/:username
// @access  Public
router.get('/:username', optionalAuth, async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({
            username,
            isActive: true,
            preferences: { publicProfile: true }
        }).select('-password -email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or profile is private',
            });
        }

        // Get user's public progress stats
        const progressStats = await Progress.getUserOverallProgress(user._id);
        const streakData = await Progress.getUserStreak(user._id);

        // Check if this is the user's own profile
        const isOwnProfile = req.user && req.user.id.toString() === user._id.toString();

        const response = {
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    github: user.github,
                    linkedin: user.linkedin,
                    stats: user.stats,
                    createdAt: user.createdAt,
                },
                progress: {
                    ...progressStats,
                    streak: streakData,
                },
                isOwnProfile,
            },
        };

        // Add additional data for own profile
        if (isOwnProfile) {
            response.data.user.email = user.email;
            response.data.user.preferences = user.preferences;
            response.data.user.lastLogin = user.lastLogin;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile',
        });
    }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }

        const searchRegex = new RegExp(q, 'i');

        const users = await User.find({
            $and: [
                { isActive: true },
                { preferences: { publicProfile: true } },
                {
                    $or: [
                        { username: searchRegex },
                        { displayName: searchRegex },
                        { bio: searchRegex },
                    ],
                },
            ],
        })
            .select('username displayName avatar bio location stats')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ 'stats.itemsCompleted': -1 });

        const total = await User.countDocuments({
            $and: [
                { isActive: true },
                { preferences: { publicProfile: true } },
                {
                    $or: [
                        { username: searchRegex },
                        { displayName: searchRegex },
                        { bio: searchRegex },
                    ],
                },
            ],
        });

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching users',
        });
    }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { type = 'completion', period = 'all', limit = 50 } = req.query;

        let matchQuery = { isActive: true, preferences: { publicProfile: true } };

        // For time-based leaderboards, we'd need to implement progress tracking over time
        // For now, we'll use overall stats

        let sortField;
        switch (type) {
            case 'completion':
                sortField = 'stats.itemsCompleted';
                break;
            case 'streak':
                sortField = 'stats.streakDays';
                break;
            case 'time':
                sortField = 'stats.totalTimeSpent';
                break;
            default:
                sortField = 'stats.itemsCompleted';
        }

        const users = await User.find(matchQuery)
            .select('username displayName avatar stats')
            .sort({ [sortField]: -1 })
            .limit(parseInt(limit));

        // Add rank to each user
        const leaderboard = users.map((user, index) => ({
            ...user.toJSON(),
            rank: index + 1,
            score: user.stats[sortField.replace('stats.', '')] || 0,
        }));

        res.status(200).json({
            success: true,
            data: leaderboard,
            type,
            period,
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching leaderboard',
        });
    }
});

// @desc    Get user's sessions
// @route   GET /api/users/me/sessions
// @access  Private
router.get('/me/sessions', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;

        const sessions = await Session.getUserSessions(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit),
            startDate,
            endDate,
        });

        const total = await Session.countDocuments({ user: req.user.id });

        res.status(200).json({
            success: true,
            data: sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get user sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user sessions',
        });
    }
});

// @desc    End active session
// @route   POST /api/users/me/sessions/end
// @access  Private
router.post('/me/sessions/end', protect, async (req, res) => {
    try {
        const activeSession = await Session.getActiveSession(req.user.id);

        if (!activeSession) {
            return res.status(404).json({
                success: false,
                message: 'No active session found',
            });
        }

        await activeSession.endSession();

        res.status(200).json({
            success: true,
            message: 'Session ended successfully',
            data: activeSession,
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error ending session',
        });
    }
});

// @desc    Get user's activity heatmap
// @route   GET /api/users/me/activity
// @access  Private
router.get('/me/activity', protect, async (req, res) => {
    try {
        const { days = 365 } = req.query;

        const heatmapData = await Session.getActivityHeatmap(req.user.id, parseInt(days));

        res.status(200).json({
            success: true,
            data: heatmapData,
        });
    } catch (error) {
        console.error('Get activity heatmap error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching activity heatmap',
        });
    }
});

// @desc    Get user's device analytics
// @route   GET /api/users/me/analytics/devices
// @access  Private
router.get('/me/analytics/devices', protect, async (req, res) => {
    try {
        const deviceAnalytics = await Session.getDeviceAnalytics(req.user.id);

        res.status(200).json({
            success: true,
            data: deviceAnalytics,
        });
    } catch (error) {
        console.error('Get device analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching device analytics',
        });
    }
});

export default router;
