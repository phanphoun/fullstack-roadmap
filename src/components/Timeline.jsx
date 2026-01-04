import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { calculateOverallProgress, getItemProgress } from '../utils/progressUtils';

const Timeline = ({ roadmapData }) => {
  const overallProgress = calculateOverallProgress(roadmapData);

  // Flatten all items with their phases and sections
  const allItems = [];
  roadmapData.phases.forEach(phase => {
    phase.sections.forEach(section => {
      section.items.forEach(item => {
        allItems.push({
          ...item,
          phaseId: phase.id,
          phaseTitle: phase.title,
          sectionId: section.id,
          sectionTitle: section.title,
          phaseColor: phase.color
        });
      });
    });
  });

  // Sort items by their natural order (phase order, then section order, then item order)
  const sortedItems = allItems;

  const getItemStatus = (item) => {
    const progress = getItemProgress(item.id, item.phaseId, item.sectionId);
    if (progress?.completed) return 'completed';
    if (progress?.inProgress) return 'inProgress';
    return 'notStarted';
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />;
      case 'inProgress':
        return <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-400" />;
    }
  };

  const getItemTypeColor = (type) => {
    switch (type) {
      case 'skill':
        return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200';
      case 'project':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-200';
      case 'professional':
        return 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Learning Timeline
        </h2>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {overallProgress.completedItems} of {overallProgress.totalItems} completed
          </div>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>

        <div className="space-y-6">
          {sortedItems.map((item, index) => {
            const status = getItemStatus(item);
            
            return (
              <div key={item.id} className="timeline-item">
                <div className="flex items-start space-x-4">
                  {/* Timeline icon */}
                  <div className="flex-shrink-0">
                    {getTimelineIcon(status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getItemTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{item.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                              <span>{item.phaseTitle}</span>
                            </div>
                          </div>

                          {/* Resources preview */}
                          {item.resources && item.resources.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {item.resources.slice(0, 3).map((resource, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded"
                                  >
                                    {resource.name}
                                  </span>
                                ))}
                                {item.resources.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                    +{item.resources.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status indicator */}
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ml-4 ${
                          status === 'completed' 
                            ? 'bg-success-500' 
                            : status === 'inProgress' 
                              ? 'bg-primary-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
