import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    itemId: {
        type: String,
        required: true,
    },
    phaseId: {
        type: String,
        required: true,
    },
    sectionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
    },
    startedAt: {
        type: Date,
        default: null,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    timeSpent: {
        type: Number,
        default: 0, // in minutes
    },
    attempts: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
    tags: [{
        type: String,
        maxlength: [20, 'Tag cannot exceed 20 characters'],
    }],
}, {
    timestamps: true,
});

// Compound index for unique user-item combinations
progressSchema.index({ user: 1, itemId: 1 }, { unique: true });

// Index for querying user progress
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ user: 1, phaseId: 1 });
progressSchema.index({ user: 1, completedAt: -1 });

// Pre-save middleware to update timestamps based on status
progressSchema.pre('save', function (next) {
    const now = new Date();

    if (this.isModified('status')) {
        if (this.status === 'in-progress' && !this.startedAt) {
            this.startedAt = now;
            this.attempts += 1;
        } else if (this.status === 'completed' && !this.completedAt) {
            this.completedAt = now;
            if (!this.startedAt) {
                this.startedAt = now;
            }
        } else if (this.status === 'not-started') {
            this.startedAt = null;
            this.completedAt = null;
        }
    }

    next();
});

// Static method to get user's overall progress
progressSchema.statics.getUserOverallProgress = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
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
                notStartedItems: {
                    $sum: { $cond: [{ $eq: ['$status', 'not-started'] }, 1, 0] }
                },
                totalTimeSpent: { $sum: '$timeSpent' },
                averageDifficulty: {
                    $avg: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                                { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                                { case: { $eq: ['$difficulty', 'hard'] }, then: 3 },
                            ],
                            default: 2,
                        }
                    }
                },
                averageRating: { $avg: '$rating' },
            }
        }
    ]);

    const result = stats[0] || {
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        notStartedItems: 0,
        totalTimeSpent: 0,
        averageDifficulty: 0,
        averageRating: 0,
    };

    result.completionPercentage = result.totalItems > 0
        ? Math.round((result.completedItems / result.totalItems) * 100)
        : 0;

    return result;
};

// Static method to get user's phase progress
progressSchema.statics.getUserPhaseProgress = async function (userId, phaseId) {
    const stats = await this.aggregate([
        {
            $match: {
                user: mongoose.Types.ObjectId(userId),
                phaseId: phaseId
            }
        },
        {
            $group: {
                _id: '$sectionId',
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

    return stats;
};

// Static method to get recently completed items
progressSchema.statics.getRecentlyCompleted = async function (userId, limit = 10) {
    return this.find({
        user: userId,
        status: 'completed',
        completedAt: { $exists: true }
    })
        .sort({ completedAt: -1 })
        .limit(limit)
        .populate('user', 'username displayName');
};

// Static method to get learning streak
progressSchema.statics.getUserStreak = async function (userId) {
    const completedItems = await this.find({
        user: userId,
        status: 'completed',
        completedAt: { $exists: true }
    }).sort({ completedAt: -1 });

    if (completedItems.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = completedItems.map(item => item.completedAt.toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < uniqueDates.length; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
            break; // No activity today, streak is broken
        } else {
            break;
        }
    }

    // Calculate longest streak
    const sortedDates = uniqueDates.sort().reverse();
    tempStreak = 1;

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
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
