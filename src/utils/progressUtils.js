import apiService from '../services/api.js';

// Progress tracking utilities - Backend Integration
// Fallback to localStorage for offline functionality
const getProgressFromStorage = () => {
  try {
    const saved = localStorage.getItem('roadmapProgress');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem('roadmapProgress', JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
};

// Get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
  } catch {
    return null;
  }
};

// Backend API functions
export const markItemAsCompleted = async (itemId, phaseId, sectionId) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return markItemAsCompletedOffline(itemId, phaseId, sectionId);
  }

  try {
    const response = await apiService.updateProgress({
      userId,
      itemId,
      phaseId,
      sectionId,
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    if (response.success) {
      // Update localStorage as backup
      const progress = getProgressFromStorage();
      if (!progress[phaseId]) progress[phaseId] = {};
      if (!progress[phaseId][sectionId]) progress[phaseId][sectionId] = {};

      progress[phaseId][sectionId][itemId] = {
        completed: true,
        completedAt: new Date().toISOString()
      };

      saveProgressToStorage(progress);
      return response.data;
    }

    throw new Error(response.message || 'Failed to mark item as completed');
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    // Fallback to localStorage
    return markItemAsCompletedOffline(itemId, phaseId, sectionId);
  }
};

export const markItemAsInProgress = async (itemId, phaseId, sectionId) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return markItemAsInProgressOffline(itemId, phaseId, sectionId);
  }

  try {
    const response = await apiService.updateProgress({
      userId,
      itemId,
      phaseId,
      sectionId,
      status: 'in-progress',
      startedAt: new Date().toISOString()
    });

    if (response.success) {
      // Update localStorage as backup
      const progress = getProgressFromStorage();
      if (!progress[phaseId]) progress[phaseId] = {};
      if (!progress[phaseId][sectionId]) progress[phaseId][sectionId] = {};

      progress[phaseId][sectionId][itemId] = {
        inProgress: true,
        startedAt: new Date().toISOString()
      };

      saveProgressToStorage(progress);
      return response.data;
    }

    throw new Error(response.message || 'Failed to mark item as in progress');
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    // Fallback to localStorage
    return markItemAsInProgressOffline(itemId, phaseId, sectionId);
  }
};

export const markItemAsNotStarted = async (itemId, phaseId, sectionId) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return markItemAsNotStartedOffline(itemId, phaseId, sectionId);
  }

  try {
    const response = await apiService.deleteProgress(itemId);

    if (response.success) {
      // Update localStorage as backup
      const progress = getProgressFromStorage();
      if (progress[phaseId] && progress[phaseId][sectionId]) {
        delete progress[phaseId][sectionId][itemId];

        // Clean up empty sections
        if (Object.keys(progress[phaseId][sectionId]).length === 0) {
          delete progress[phaseId][sectionId];
        }

        // Clean up empty phases
        if (Object.keys(progress[phaseId]).length === 0) {
          delete progress[phaseId];
        }
      }

      saveProgressToStorage(progress);
      return { success: true };
    }

    throw new Error(response.message || 'Failed to mark item as not started');
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    // Fallback to localStorage
    return markItemAsNotStartedOffline(itemId, phaseId, sectionId);
  }
};

// Offline fallback functions
const markItemAsCompletedOffline = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();

  if (!progress[phaseId]) progress[phaseId] = {};
  if (!progress[phaseId][sectionId]) progress[phaseId][sectionId] = {};

  progress[phaseId][sectionId][itemId] = {
    completed: true,
    completedAt: new Date().toISOString()
  };

  saveProgressToStorage(progress);
  return progress;
};

const markItemAsInProgressOffline = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();

  if (!progress[phaseId]) progress[phaseId] = {};
  if (!progress[phaseId][sectionId]) progress[phaseId][sectionId] = {};

  progress[phaseId][sectionId][itemId] = {
    inProgress: true,
    startedAt: new Date().toISOString()
  };

  saveProgressToStorage(progress);
  return progress;
};

const markItemAsNotStartedOffline = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();

  if (progress[phaseId] && progress[phaseId][sectionId]) {
    delete progress[phaseId][sectionId][itemId];

    // Clean up empty sections
    if (Object.keys(progress[phaseId][sectionId]).length === 0) {
      delete progress[phaseId][sectionId];
    }

    // Clean up empty phases
    if (Object.keys(progress[phaseId]).length === 0) {
      delete progress[phaseId];
    }
  }

  saveProgressToStorage(progress);
  return progress;
};

// Get item progress (tries backend first, then localStorage)
export const getItemProgress = async (itemId, phaseId, sectionId) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return getItemProgressOffline(itemId, phaseId, sectionId);
  }

  try {
    const response = await apiService.getItemProgress(itemId);

    if (response.success && response.data) {
      // Convert backend format to frontend format
      const backendProgress = response.data;
      return {
        completed: backendProgress.status === 'completed',
        inProgress: backendProgress.status === 'in-progress',
        completedAt: backendProgress.completedAt,
        startedAt: backendProgress.startedAt,
        timeSpent: backendProgress.timeSpent,
        notes: backendProgress.notes,
        difficulty: backendProgress.difficulty,
        rating: backendProgress.rating
      };
    }

    // Fallback to localStorage
    return getItemProgressOffline(itemId, phaseId, sectionId);
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    return getItemProgressOffline(itemId, phaseId, sectionId);
  }
};

const getItemProgressOffline = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();

  if (progress[phaseId] &&
    progress[phaseId][sectionId] &&
    progress[phaseId][sectionId][itemId]) {
    return progress[phaseId][sectionId][itemId];
  }

  return null;
};

// Calculate overall progress (tries backend first, then localStorage)
export const calculateOverallProgress = async (roadmapData) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return calculateOverallProgressOffline(roadmapData);
  }

  try {
    const response = await apiService.getProgressOverview();

    if (response.success && response.data) {
      const backendData = response.data;
      return {
        totalItems: backendData.totalItems,
        completedItems: backendData.completedItems,
        inProgressItems: backendData.inProgressItems,
        notStartedItems: backendData.notStartedItems,
        completionPercentage: backendData.completionPercentage,
        streak: backendData.streak
      };
    }

    // Fallback to localStorage calculation
    return calculateOverallProgressOffline(roadmapData);
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    return calculateOverallProgressOffline(roadmapData);
  }
};

const calculateOverallProgressOffline = (roadmapData) => {
  const progress = getProgressFromStorage();
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;

  roadmapData.phases.forEach(phase => {
    phase.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        const itemProgress = getItemProgressOffline(item.id, phase.id, section.id);

        if (itemProgress?.completed) {
          completedItems++;
        } else if (itemProgress?.inProgress) {
          inProgressItems++;
        }
      });
    });
  });

  return {
    totalItems,
    completedItems,
    inProgressItems,
    notStartedItems: totalItems - completedItems - inProgressItems,
    completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  };
};

// Calculate phase progress (tries backend first, then localStorage)
export const calculatePhaseProgress = async (phase, roadmapData) => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, using localStorage fallback');
    return calculatePhaseProgressOffline(phase, roadmapData);
  }

  try {
    const response = await apiService.getPhaseProgress(phase.id);

    if (response.success && response.data) {
      const phaseSections = response.data;
      let totalItems = 0;
      let completedItems = 0;
      let inProgressItems = 0;

      phaseSections.forEach(section => {
        totalItems += section.totalItems;
        completedItems += section.completedItems;
        inProgressItems += section.inProgressItems;
      });

      return {
        totalItems,
        completedItems,
        inProgressItems,
        notStartedItems: totalItems - completedItems - inProgressItems,
        completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };
    }

    // Fallback to localStorage calculation
    return calculatePhaseProgressOffline(phase, roadmapData);
  } catch (error) {
    console.error('Backend error, using localStorage fallback:', error);
    return calculatePhaseProgressOffline(phase, roadmapData);
  }
};

const calculatePhaseProgressOffline = (phase, roadmapData) => {
  const progress = getProgressFromStorage();
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;

  phase.sections.forEach(section => {
    section.items.forEach(item => {
      totalItems++;
      const itemProgress = getItemProgressOffline(item.id, phase.id, section.id);

      if (itemProgress?.completed) {
        completedItems++;
      } else if (itemProgress?.inProgress) {
        inProgressItems++;
      }
    });
  });

  return {
    totalItems,
    completedItems,
    inProgressItems,
    notStartedItems: totalItems - completedItems - inProgressItems,
    completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  };
};

// Sync localStorage progress with backend
export const syncProgressWithBackend = async () => {
  const userId = getCurrentUserId();

  if (!userId) {
    console.warn('No user logged in, cannot sync progress');
    return { success: false, error: 'No user logged in' };
  }

  try {
    const localProgress = getProgressFromStorage();
    const syncedItems = [];

    // Get all progress from backend
    const response = await apiService.getAllProgress();

    if (response.success) {
      const backendProgress = response.data;

      // Sync each item
      for (const [phaseId, phaseData] of Object.entries(localProgress)) {
        for (const [sectionId, sectionData] of Object.entries(phaseData)) {
          for (const [itemId, itemData] of Object.entries(sectionData)) {
            // Check if this item exists in backend
            const backendItem = backendProgress.find(p =>
              p.itemId === itemId && p.phaseId === phaseId && p.sectionId === sectionId
            );

            if (!backendItem) {
              // Item exists locally but not in backend, sync it
              const status = itemData.completed ? 'completed' :
                itemData.inProgress ? 'in-progress' : 'not-started';

              await apiService.updateProgress({
                userId,
                itemId,
                phaseId,
                sectionId,
                status,
                completedAt: itemData.completedAt,
                startedAt: itemData.startedAt
              });

              syncedItems.push(itemId);
            }
          }
        }
      }
    }

    return { success: true, syncedItems };
  } catch (error) {
    console.error('Sync progress error:', error);
    return { success: false, error: error.message };
  }
};

// Legacy functions for backward compatibility
export { getProgressFromStorage, saveProgressToStorage };
