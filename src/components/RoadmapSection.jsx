import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  ExternalLink, 
  Calendar,
  Target,
  Lightbulb,
  Code
} from 'lucide-react';
import { 
  markItemAsCompleted, 
  markItemAsInProgress, 
  markItemAsNotStarted,
  getItemProgress,
  calculatePhaseProgress 
} from '../utils/progressUtils';

const RoadmapSection = ({ phase, roadmapData }) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const phaseProgress = calculatePhaseProgress(phase, roadmapData);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (item) => {
    const itemProgress = getItemProgress(item.id, phase.id, item.id.includes('-') ? item.id.split('-')[0] : '');
    
    if (itemProgress?.completed) {
      return <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />;
    }
    if (itemProgress?.inProgress) {
      return <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const handleStatusChange = (item, newStatus) => {
    switch (newStatus) {
      case 'completed':
        markItemAsCompleted(item.id, phase.id, item.id.includes('-') ? item.id.split('-')[0] : '');
        break;
      case 'inProgress':
        markItemAsInProgress(item.id, phase.id, item.id.includes('-') ? item.id.split('-')[0] : '');
        break;
      case 'notStarted':
        markItemAsNotStarted(item.id, phase.id, item.id.includes('-') ? item.id.split('-')[0] : '');
        break;
    }
    // Force re-render by updating a state (in real app, you'd use context or state management)
    window.location.reload();
  };

  const getPhaseColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
    };
    return colors[color] || colors.blue;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'skill':
        return <Lightbulb className="w-4 h-4" />;
      case 'project':
        return <Code className="w-4 h-4" />;
      case 'professional':
        return <Target className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'skill':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'professional':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="roadmap-section mb-8">
      {/* Phase Header */}
      <div className={`bg-gradient-to-r ${getPhaseColor(phase.color)} p-6 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{phase.title}</h2>
            <p className="text-white/90 mb-2">{phase.description}</p>
            <div className="flex items-center text-white/80">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{phase.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {phaseProgress.completionPercentage}%
            </div>
            <div className="text-white/80 text-sm">
              {phaseProgress.completedItems} / {phaseProgress.totalItems}
            </div>
          </div>
        </div>
        
        {/* Phase Progress Bar */}
        <div className="mt-4">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${phaseProgress.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Phase Content */}
      <div className="p-6">
        {phase.sections.map((section) => (
          <div key={section.id} className="mb-6 last:mb-0">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {section.duration}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {section.items.length} items
              </div>
            </button>

            {/* Section Content */}
            {expandedSections.has(section.id) && (
              <div className="mt-4 space-y-4">
                {section.items.map((item) => {
                  const itemProgress = getItemProgress(item.id, phase.id, section.id);
                  const isCompleted = itemProgress?.completed;
                  const isInProgress = itemProgress?.inProgress;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`roadmap-item ${isCompleted ? 'completed' : isInProgress ? 'in-progress' : ''}`}
                    >
                      {/* Status and Type */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (isCompleted) {
                              handleStatusChange(item, 'notStarted');
                            } else {
                              handleStatusChange(item, 'completed');
                            }
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          {getStatusIcon(item)}
                        </button>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {item.description}
                        </p>
                        
                        {/* Duration */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{item.duration}</span>
                        </div>

                        {/* Resources */}
                        {item.resources && item.resources.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Resources:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {item.resources.map((resource, index) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                                >
                                  <span>{resource.name}</span>
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {item.projects && item.projects.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Project Ideas:
                            </h5>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              {item.projects.map((project, index) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                  {project}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Status Actions */}
                        <div className="mt-3 flex space-x-2">
                          {!isInProgress && !isCompleted && (
                            <button
                              onClick={() => handleStatusChange(item, 'inProgress')}
                              className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {isInProgress && !isCompleted && (
                            <button
                              onClick={() => handleStatusChange(item, 'completed')}
                              className="text-xs px-3 py-1 bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 rounded hover:bg-success-200 dark:hover:bg-success-800 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                          {(isInProgress || isCompleted) && (
                            <button
                              onClick={() => handleStatusChange(item, 'notStarted')}
                              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapSection;
