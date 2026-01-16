import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password in queries by default
    },
    avatar: {
        type: String,
        default: null,
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
        type: String,
        maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    website: {
        type: String,
        validate: [validator.isURL, 'Please provide a valid website URL'],
    },
    github: {
        type: String,
        maxlength: [39, 'GitHub username cannot exceed 39 characters'],
    },
    linkedin: {
        type: String,
        maxlength: [100, 'LinkedIn URL cannot exceed 100 characters'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    preferences: {
        darkMode: {
            type: Boolean,
            default: false,
        },
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        publicProfile: {
            type: Boolean,
            default: true,
        },
    },
    stats: {
        totalSessions: {
            type: Number,
            default: 0,
        },
        totalTimeSpent: {
            type: Number,
            default: 0, // in minutes
        },
        itemsCompleted: {
            type: Number,
            default: 0,
        },
        streakDays: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for user's progress
userSchema.virtual('progress', {
    ref: 'Progress',
    localField: '_id',
    foreignField: 'user',
});

// Virtual for user's sessions
userSchema.virtual('sessions', {
    ref: 'Session',
    localField: '_id',
    foreignField: 'user',
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Method to get user stats
userSchema.methods.getStats = async function () {
    const Progress = mongoose.model('Progress');
    const Session = mongoose.model('Session');

    const progressStats = await Progress.aggregate([
        { $match: { user: this._id } },
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
            }
        }
    ]);

    const sessionStats = await Session.aggregate([
        { $match: { user: this._id } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalTimeSpent: { $sum: '$duration' },
                averageSessionTime: { $avg: '$duration' },
            }
        }
    ]);

    return {
        progress: progressStats[0] || { totalItems: 0, completedItems: 0, inProgressItems: 0 },
        sessions: sessionStats[0] || { totalSessions: 0, totalTimeSpent: 0, averageSessionTime: 0 },
    };
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
    return this.find({ isActive: true }).select('-password');
};

const User = mongoose.model('User', userSchema);

export default User;
