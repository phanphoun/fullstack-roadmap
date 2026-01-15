import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProgressTracker from './components/ProgressTracker';
import SearchFilter from './components/SearchFilter';
import RoadmapSection from './components/RoadmapSection';
import Timeline from './components/Timeline';
import AboutMe from './components/AboutMe';
import Footer from './components/Footer';
import roadmapData from './data/roadmapData';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header
        roadmapData={roadmapData}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Hero Section */}
      <section id="overview" className="bg-gradient-to-br from-primary-500 via-primary-600 to-success-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            {roadmapData.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 animate-fade-in-up">
            {roadmapData.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <button
              onClick={() => scrollToSection('roadmap')}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Learning
            </button>
            <button
              onClick={() => scrollToSection('resources')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              View Resources
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">12</div>
              <div className="text-primary-100">Months of Learning</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">4</div>
              <div className="text-primary-100">Major Phases</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Skills & Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Tracker */}
        <ProgressTracker roadmapData={roadmapData} />

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'roadmap'
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              Detailed Roadmap
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'timeline'
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              Timeline View
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'roadmap' ? (
          <div id="roadmap">
            {/* Search and Filter */}
            <SearchFilter roadmapData={roadmapData} />

            {/* Roadmap Sections */}
            <div className="space-y-8">
              {roadmapData.phases.map((phase) => (
                <RoadmapSection
                  key={phase.id}
                  phase={phase}
                  roadmapData={roadmapData}
                />
              ))}
            </div>
          </div>
        ) : (
          <div id="timeline">
            <Timeline roadmapData={roadmapData} />
          </div>
        )}

        {/* Skills Overview */}
        <section id="skills" className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Skills You'll Master
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(roadmapData.skills).map(([category, skills]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {skills.map((skill, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Learning Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(roadmapData.resources).map(([category, resources]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                  {category}
                </h3>
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {resource.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${resource.type === 'free'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {resource.type}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* About Me Section */}
      <AboutMe />

      <Footer />
    </div>
  );
}

export default App;
