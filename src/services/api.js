const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized - token expired or invalid
                if (response.status === 401) {
                    this.setToken(null);
                    window.location.href = '/login';
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET',
        });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // Authentication methods
    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        if (response.success && response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setToken(null);
        }
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async updateProfile(profileData) {
        return this.put('/auth/profile', profileData);
    }

    async changePassword(passwordData) {
        return this.put('/auth/password', passwordData);
    }

    // Progress methods
    async getProgressOverview() {
        return this.get('/progress/overview');
    }

    async getPhaseProgress(phaseId) {
        return this.get(`/progress/phase/${phaseId}`);
    }

    async getItemProgress(itemId) {
        return this.get(`/progress/item/${itemId}`);
    }

    async getAllProgress(params = {}) {
        return this.get('/progress', params);
    }

    async updateProgress(progressData) {
        return this.post('/progress', progressData);
    }

    async updateItemProgress(itemId, progressData) {
        return this.put(`/progress/${itemId}`, progressData);
    }

    async deleteProgress(itemId) {
        return this.delete(`/progress/${itemId}`);
    }

    async getRecentlyCompleted(limit = 10) {
        return this.get('/progress/recent/completed', { limit });
    }

    async getProgressStats(period = 'all') {
        return this.get('/progress/stats', { period });
    }

    // User methods
    async getUserProfile(username) {
        return this.get(`/users/${username}`);
    }

    async searchUsers(query, page = 1, limit = 20) {
        return this.get('/users/search', { q: query, page, limit });
    }

    async getLeaderboard(type = 'completion', period = 'all', limit = 50) {
        return this.get('/users/leaderboard', { type, period, limit });
    }

    async getUserSessions(params = {}) {
        return this.get('/users/me/sessions', params);
    }

    async endSession() {
        return this.post('/users/me/sessions/end');
    }

    async getActivityHeatmap(days = 365) {
        return this.get('/users/me/activity', { days });
    }

    async getDeviceAnalytics() {
        return this.get('/users/me/analytics/devices');
    }

    // Analytics methods
    async getLearningAnalytics(period = 'all') {
        return this.get('/analytics/learning', { period });
    }

    async getTimeAnalytics(period = 'all') {
        return this.get('/analytics/time', { period });
    }

    async getProgressTrends(period = '30') {
        return this.get('/analytics/trends', { period });
    }

    async getSkillAnalytics() {
        return this.get('/analytics/skills');
    }

    async getGlobalAnalytics() {
        return this.get('/analytics/global');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
