import React, { useState } from 'react';
import { Moon, Sun, Menu, X, Github, ExternalLink, User, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateOverallProgress } from '../utils/progressUtils';
import { useAuth } from '../context/AuthContext';

const Header = ({ roadmapData, darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const progress = calculateOverallProgress(roadmapData);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Full-Stack Roadmap
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                2026 Edition
              </p>
            </div>
          </div>

          {/* Right side - Auth and Navigation */}
          <div className="flex items-center space-x-4">
            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.displayName || user?.username}
                  </span>
                </div>
                <button
                  onClick={() => scrollToSection('profile')}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Profile"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection('overview')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection('roadmap')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Roadmap
              </button>
              <button
                onClick={() => scrollToSection('timeline')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Timeline
              </button>
              <button
                onClick={() => scrollToSection('skills')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Skills
              </button>
              <button
                onClick={() => scrollToSection('resources')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                About
              </button>

              {/* Mobile auth section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.displayName || user?.username}
                      </span>
                    </div>
                    <button
                      onClick={() => scrollToSection('profile')}
                      className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile progress summary */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-around text-center">
                <div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {progress.completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-success-600 dark:text-success-400">
                    {progress.completedItems}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Done</div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
