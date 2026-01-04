// Progress tracking utilities
export const getProgressFromStorage = () => {
  try {
    const saved = localStorage.getItem('roadmapProgress');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem('roadmapProgress', JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
};

export const markItemAsCompleted = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();
  
  if (!progress[phaseId]) {
    progress[phaseId] = {};
  }
  if (!progress[phaseId][sectionId]) {
    progress[phaseId][sectionId] = {};
  }
  
  progress[phaseId][sectionId][itemId] = {
    completed: true,
    completedAt: new Date().toISOString()
  };
  
  saveProgressToStorage(progress);
  return progress;
};

export const markItemAsInProgress = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();
  
  if (!progress[phaseId]) {
    progress[phaseId] = {};
  }
  if (!progress[phaseId][sectionId]) {
    progress[phaseId][sectionId] = {};
  }
  
  progress[phaseId][sectionId][itemId] = {
    inProgress: true,
    startedAt: new Date().toISOString()
  };
  
  saveProgressToStorage(progress);
  return progress;
};

export const markItemAsNotStarted = (itemId, phaseId, sectionId) => {
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

export const getItemProgress = (itemId, phaseId, sectionId) => {
  const progress = getProgressFromStorage();
  
  if (progress[phaseId] && 
      progress[phaseId][sectionId] && 
      progress[phaseId][sectionId][itemId]) {
    return progress[phaseId][sectionId][itemId];
  }
  
  return null;
};

export const calculateOverallProgress = (roadmapData) => {
  const progress = getProgressFromStorage();
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  
  roadmapData.phases.forEach(phase => {
    phase.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        const itemProgress = getItemProgress(item.id, phase.id, section.id);
        
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

export const calculatePhaseProgress = (phase, roadmapData) => {
  const progress = getProgressFromStorage();
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  
  phase.sections.forEach(section => {
    section.items.forEach(item => {
      totalItems++;
      const itemProgress = getItemProgress(item.id, phase.id, section.id);
      
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
