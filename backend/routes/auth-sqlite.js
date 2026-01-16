import express from 'express';
import jwt from 'jsonwebtoken';
import UserSQLite from '../models/UserSQLite.js';
import SessionSQLite from '../models/SessionSQLite.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Check if user exists
        const existingUser = await UserSQLite.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        const existingUsername = await UserSQLite.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken',
            });
        }

        // Create user
        const user = await UserSQLite.create({
            username,
            email,
            password,
            displayName: displayName || username,
        });

        // Create initial session
        await SessionSQLite.create({
            userId: user.id,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            deviceType: 'desktop',
            browser: 'unknown',
            os: 'unknown'
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                preferences: {
                    darkMode: user.darkMode === 1,
                    emailNotifications: user.emailNotifications === 1,
                    publicProfile: user.publicProfile === 1,
                },
                stats: {
                    totalSessions: user.totalSessions,
                    totalTimeSpent: user.totalTimeSpent,
                    itemsCompleted: user.itemsCompleted,
                    streakDays: user.streakDays,
                    longestStreak: user.longestStreak,
                },
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find user
        const user = await UserSQLite.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check password
        const isPasswordValid = await UserSQLite.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated',
            });
        }

        // Update last login
        await UserSQLite.updateLastLogin(user.id);

        // Create session
        await SessionSQLite.create({
            userId: user.id,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            deviceType: 'desktop',
            browser: 'unknown',
            os: 'unknown'
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                preferences: {
                    darkMode: user.darkMode === 1,
                    emailNotifications: user.emailNotifications === 1,
                    publicProfile: user.publicProfile === 1,
                },
                stats: {
                    totalSessions: user.totalSessions,
                    totalTimeSpent: user.totalTimeSpent,
                    itemsCompleted: user.itemsCompleted,
                    streakDays: user.streakDays,
                    longestStreak: user.longestStreak,
                },
                lastLogin: user.lastLogin,
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await UserSQLite.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get user stats
        const stats = await UserSQLite.getUserStats(user.id);

        res.status(200).json({
            success: true,
            user: {
                ...user,
                preferences: {
                    darkMode: user.darkMode === 1,
                    emailNotifications: user.emailNotifications === 1,
                    publicProfile: user.publicProfile === 1,
                },
                stats,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const {
            displayName,
            bio,
            location,
            website,
            github,
            linkedin,
            preferences,
        } = req.body;

        const user = await UserSQLite.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update fields
        const updateData = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        if (github !== undefined) updateData.github = github;
        if (linkedin !== undefined) updateData.linkedin = linkedin;

        if (preferences !== undefined) {
            if (preferences.darkMode !== undefined) updateData.darkMode = preferences.darkMode ? 1 : 0;
            if (preferences.emailNotifications !== undefined) updateData.emailNotifications = preferences.emailNotifications ? 1 : 0;
            if (preferences.publicProfile !== undefined) updateData.publicProfile = preferences.publicProfile ? 1 : 0;
        }

        const updatedUser = await UserSQLite.updateProfile(req.user.id, updateData);

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
                github: updatedUser.github,
                linkedin: updatedUser.linkedin,
                avatar: updatedUser.avatar,
                preferences: {
                    darkMode: updatedUser.darkMode === 1,
                    emailNotifications: updatedUser.emailNotifications === 1,
                    publicProfile: updatedUser.publicProfile === 1,
                },
                stats: {
                    totalSessions: updatedUser.totalSessions,
                    totalTimeSpent: updatedUser.totalTimeSpent,
                    itemsCompleted: updatedUser.itemsCompleted,
                    streakDays: updatedUser.streakDays,
                    longestStreak: updatedUser.longestStreak,
                },
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
        });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // End active session
        const activeSession = await SessionSQLite.getActiveSession(req.user.id);

        if (activeSession) {
            await SessionSQLite.endSession(activeSession.id);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
        });
    }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }

        const user = await UserSQLite.findByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const isCurrentPasswordValid = await UserSQLite.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        await UserSQLite.updatePassword(user.id, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change',
        });
    }
});

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password to confirm account deletion',
            });
        }

        const user = await UserSQLite.findByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const isPasswordValid = await UserSQLite.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect',
            });
        }

        // Delete user (soft delete)
        await UserSQLite.delete(user.id);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during account deletion',
        });
    }
});

export default router;
