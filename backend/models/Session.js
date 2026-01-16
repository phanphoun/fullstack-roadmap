import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endTime: {
        type: Date,
        default: null,
    },
    duration: {
        type: Number,
        default: 0, // in minutes
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    activities: [{
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
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            default: null,
        },
        duration: {
            type: Number,
            default: 0, // in minutes
        },
        type: {
            type: String,
            enum: ['viewed', 'started', 'completed', 'reviewed'],
            default: 'viewed',
        },
        notes: {
            type: String,
            maxlength: [500, 'Activity notes cannot exceed 500 characters'],
        },
    }],
    userAgent: {
        type: String,
        maxlength: [500, 'User agent cannot exceed 500 characters'],
    },
    ipAddress: {
        type: String,
        maxlength: [45, 'IP address cannot exceed 45 characters'],
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        default: 'desktop',
    },
    browser: {
        type: String,
        maxlength: [50, 'Browser name cannot exceed 50 characters'],
    },
    os: {
        type: String,
        maxlength: [50, 'OS name cannot exceed 50 characters'],
    },
}, {
    timestamps: true,
});

// Index for querying user sessions
sessionSchema.index({ user: 1, startTime: -1 });
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ startTime: -1 });

// Pre-save middleware to calculate duration
sessionSchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
    }
    next();
});

// Method to end session
sessionSchema.methods.endSession = function () {
    this.endTime = new Date();
    this.isActive = false;
    if (this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    }
    return this.save();
};

// Method to add activity
sessionSchema.methods.addActivity = function (activityData) {
    const activity = {
        ...activityData,
        startTime: activityData.startTime || new Date(),
    };

    if (activity.endTime && activity.startTime) {
        activity.duration = Math.round((activity.endTime - activity.startTime) / (1000 * 60));
    }

    this.activities.push(activity);
    return this.save();
};

// Method to update activity
sessionSchema.methods.updateActivity = function (activityId, updateData) {
    const activity = this.activities.id(activityId);
    if (activity) {
        Object.assign(activity, updateData);

        if (updateData.endTime && activity.startTime) {
            activity.duration = Math.round((updateData.endTime - activity.startTime) / (1000 * 60));
        }

        return this.save();
    }
    throw new Error('Activity not found');
};

// Static method to get active session for user
sessionSchema.statics.getActiveSession = function (userId) {
    return this.findOne({ user: userId, isActive: true })
        .populate('user', 'username displayName');
};

// Static method to get user's session history
sessionSchema.statics.getUserSessions = function (userId, options = {}) {
    const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'startTime',
        sortOrder = -1
    } = options;

    const query = { user: userId };

    if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
    }

    return this.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user', 'username displayName');
};

// Static method to get session statistics
sessionSchema.statics.getSessionStats = async function (userId, period = 'all') {
    const matchQuery = { user: mongoose.Types.ObjectId(userId) };

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

        matchQuery.startTime = { $gte: startDate };
    }

    const stats = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalTimeSpent: { $sum: '$duration' },
                averageSessionTime: { $avg: '$duration' },
                longestSession: { $max: '$duration' },
                shortestSession: { $min: '$duration' },
                totalActivities: { $sum: { $size: '$activities' } },
            }
        }
    ]);

    const dailyStats = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                sessions: { $sum: 1 },
                totalTime: { $sum: '$duration' },
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    return {
        summary: stats[0] || {
            totalSessions: 0,
            totalTimeSpent: 0,
            averageSessionTime: 0,
            longestSession: 0,
            shortestSession: 0,
            totalActivities: 0,
        },
        daily: dailyStats,
    };
};

// Static method to get device analytics
sessionSchema.statics.getDeviceAnalytics = async function (userId) {
    return this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$deviceType',
                count: { $sum: 1 },
                totalTime: { $sum: '$duration' },
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Static method to get activity heatmap data
sessionSchema.statics.getActivityHeatmap = async function (userId, days = 365) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                user: mongoose.Types.ObjectId(userId),
                startTime: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                activityCount: { $sum: 1 },
                totalTime: { $sum: '$duration' },
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
