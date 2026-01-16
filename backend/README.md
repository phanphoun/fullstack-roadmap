# 🚀 Full-Stack Roadmap Backend API

A comprehensive backend API for tracking user progress, sessions, and learning analytics for the Full-Stack Roadmap application.

## 📋 Features

- **User Authentication**: Registration, login, profile management
- **Progress Tracking**: Track learning progress with detailed analytics
- **Session Management**: Monitor user sessions and activity
- **Analytics Dashboard**: Comprehensive learning analytics and insights
- **User Profiles**: Public profiles with leaderboards and social features
- **Real-time Tracking**: Session-based activity tracking

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-roadmap/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/roadmap-tracker
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### Progress Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/progress/overview` | Get overall progress | Yes |
| GET | `/api/progress/phase/:phaseId` | Get phase progress | Yes |
| GET | `/api/progress/item/:itemId` | Get item progress | Yes |
| GET | `/api/progress` | Get all progress | Yes |
| POST | `/api/progress` | Create/update progress | Yes |
| PUT | `/api/progress/:itemId` | Update progress | Yes |
| DELETE | `/api/progress/:itemId` | Delete progress | Yes |
| GET | `/api/progress/recent/completed` | Recent completed items | Yes |
| GET | `/api/progress/stats` | Progress statistics | Yes |

### User Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:username` | Get public profile | No |
| GET | `/api/users/search` | Search users | No |
| GET | `/api/users/leaderboard` | Get leaderboard | No |
| GET | `/api/users/me/sessions` | Get user sessions | Yes |
| POST | `/api/users/me/sessions/end` | End active session | Yes |
| GET | `/api/users/me/activity` | Get activity heatmap | Yes |
| GET | `/api/users/me/analytics/devices` | Get device analytics | Yes |

### Analytics Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/learning` | Learning analytics | Yes |
| GET | `/api/analytics/time` | Time analytics | Yes |
| GET | `/api/analytics/trends` | Progress trends | Yes |
| GET | `/api/analytics/skills` | Skill analytics | Yes |
| GET | `/api/analytics/global` | Global analytics (admin) | Yes (Admin) |

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  displayName: String,
  avatar: String,
  bio: String,
  location: String,
  website: String,
  github: String,
  linkedin: String,
  preferences: {
    darkMode: Boolean,
    emailNotifications: Boolean,
    publicProfile: Boolean
  },
  stats: {
    totalSessions: Number,
    totalTimeSpent: Number,
    itemsCompleted: Number,
    streakDays: Number,
    longestStreak: Number
  }
}
```

### Progress Model
```javascript
{
  user: ObjectId,
  itemId: String,
  phaseId: String,
  sectionId: String,
  status: String, // 'not-started', 'in-progress', 'completed'
  startedAt: Date,
  completedAt: Date,
  timeSpent: Number,
  attempts: Number,
  notes: String,
  difficulty: String,
  rating: Number,
  tags: [String]
}
```

### Session Model
```javascript
{
  user: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  isActive: Boolean,
  activities: [{
    itemId: String,
    phaseId: String,
    sectionId: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    type: String,
    notes: String
  }],
  userAgent: String,
  ipAddress: String,
  deviceType: String,
  browser: String,
  os: String
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Register**: Receive a JWT token
2. **Authorization**: Include token in `Authorization: Bearer <token>` header
3. **Protected Routes**: Token verified in middleware

## 📊 Analytics Features

- **Learning Analytics**: Progress tracking, completion rates, skill proficiency
- **Time Analytics**: Session duration, daily/hourly distribution, best learning days
- **Progress Trends**: Completion trends, accumulation over time
- **Skill Analytics**: Performance by skill area, difficulty analysis
- **Global Analytics**: Platform-wide statistics (admin only)

## 🚀 Deployment

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadmap-tracker

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── controllers/     # Route controllers (optional)
├── utils/          # Utility functions
├── config/         # Configuration files
├── uploads/        # File uploads
├── server.js       # Server entry point
├── package.json    # Dependencies
└── README.md       # Documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please open an issue in the repository.
