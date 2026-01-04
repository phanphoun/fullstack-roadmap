import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Tag, BookOpen, Code, Target } from 'lucide-react';
import { calculatePhaseProgress } from '../utils/progressUtils';

const SearchFilter = ({ roadmapData, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique types from the roadmap
  const allTypes = useMemo(() => {
    const types = new Set();
    roadmapData.phases.forEach(phase => {
      phase.sections.forEach(section => {
        section.items.forEach(item => {
          types.add(item.type);
        });
      });
    });
    return Array.from(types);
  }, [roadmapData]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    const items = [];
    roadmapData.phases.forEach(phase => {
      phase.sections.forEach(section => {
        section.items.forEach(item => {
          const matchesSearch = searchTerm === '' || 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
          const matchesPhase = selectedPhases.length === 0 || selectedPhases.includes(phase.id);

          if (matchesSearch && matchesType && matchesPhase) {
            items.push({
              ...item,
              phaseId: phase.id,
              phaseTitle: phase.title,
              sectionId: section.id,
              sectionTitle: section.title,
              phaseColor: phase.color
            });
          }
        });
      });
    });
    return items;
  }, [roadmapData, searchTerm, selectedTypes, selectedPhases]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handlePhaseToggle = (phaseId) => {
    setSelectedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(p => p !== phaseId)
        : [...prev, phaseId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedPhases([]);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'skill':
        return <BookOpen className="w-4 h-4" />;
      case 'project':
        return <Code className="w-4 h-4" />;
      case 'professional':
        return <Target className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'skill':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'project':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getPhaseColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
      green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
      purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
      orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search skills, projects, or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {(selectedTypes.length > 0 || selectedPhases.length > 0) && (
            <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
              {selectedTypes.length + selectedPhases.length}
            </span>
          )}
        </button>

        {(selectedTypes.length > 0 || selectedPhases.length > 0 || searchTerm) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 space-y-4">
          {/* Type Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Content Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTypes.includes(type)
                      ? getTypeColor(type)
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phase Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Learning Phase
            </h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData.phases.map(phase => (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseToggle(phase.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedPhases.includes(phase.id)
                      ? getPhaseColor(phase.color)
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {phase.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {filteredItems.length === 0 ? (
          <span>No items match your search criteria.</span>
        ) : (
          <span>
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {(selectedTypes.length > 0 || selectedPhases.length > 0) && ' with active filters'}
          </span>
        )}
      </div>

      {/* Pass filtered results to parent component */}
      {onFilterChange && onFilterChange(filteredItems)}
    </div>
  );
};

export default SearchFilter;
