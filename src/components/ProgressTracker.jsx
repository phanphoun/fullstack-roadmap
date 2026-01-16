import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, TrendingUp } from 'lucide-react';
import { calculateOverallProgress } from '../utils/progressUtils';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api.js';

const ProgressTracker = ({ roadmapData }) => {
  const [backendProgress, setBackendProgress] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch backend progress when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendProgress();
    } else {
      setBackendProgress(null);
    }
  }, [isAuthenticated]);

  const fetchBackendProgress = async () => {
    try {
      const response = await apiService.getProgressOverview();
      if (response.success) {
        setBackendProgress(response.data);
      }
    } catch (error) {
      console.error('Error fetching backend progress:', error);
      setBackendProgress(null);
    }
  };

  // Use backend data if available, otherwise fall back to localStorage
  const progress = backendProgress || calculateOverallProgress(roadmapData);

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'text-success-600 dark:text-success-400';
    if (percentage >= 50) return 'text-primary-600 dark:text-primary-400';
    if (percentage >= 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'from-success-500 to-success-600';
    if (percentage >= 50) return 'from-primary-500 to-primary-600';
    if (percentage >= 25) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" />
          Overall Progress
        </h2>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getStatusColor(progress.completionPercentage)}`}>
            {progress.completionPercentage}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {progress.completedItems} of {progress.totalItems} completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="progress-bar">
          <div
            className={`progress-fill bg-gradient-to-r ${getProgressColor(progress.completionPercentage)}`}
            style={{ width: `${progress.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {progress.completedItems}
          </div>
          <div className="text-sm text-success-700 dark:text-success-300">Completed</div>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {progress.inProgressItems}
          </div>
          <div className="text-sm text-primary-700 dark:text-primary-300">In Progress</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <Circle className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {progress.notStartedItems}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Not Started</div>
        </div>
      </div>

      {/* Progress Tips */}
      {progress.completionPercentage === 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 Ready to Start?</h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Begin with Phase 1: Foundation Building. Start with Month 1: Web Fundamentals to build a solid base.
          </p>
        </div>
      )}

      {progress.completionPercentage > 0 && progress.completionPercentage < 50 && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">💪 Great Start!</h3>
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            You're making good progress. Keep consistency and focus on completing one phase at a time.
          </p>
        </div>
      )}

      {progress.completionPercentage >= 50 && progress.completionPercentage < 80 && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">🎯 Almost There!</h3>
          <p className="text-primary-800 dark:text-primary-200 text-sm">
            You're more than halfway there! Focus on the remaining items and start preparing for job applications.
          </p>
        </div>
      )}

      {progress.completionPercentage >= 80 && (
        <div className="mt-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
          <h3 className="font-semibold text-success-900 dark:text-success-100 mb-2">🏆 Excellent Work!</h3>
          <p className="text-success-800 dark:text-success-200 text-sm">
            You've completed most of the roadmap! Time to apply for jobs and showcase your skills.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
