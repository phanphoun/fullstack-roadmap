import React from 'react';
import { Github, Heart, Coffee, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const resources = [
    { name: 'React Documentation', url: 'https://react.dev/' },
    { name: 'Node.js Guide', url: 'https://nodejs.org/docs/' },
    { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Full-Stack Roadmap
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your path to becoming a developer
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A comprehensive, interactive roadmap designed to guide you through 
              becoming a job-ready full-stack developer in 2026.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Coffee className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#overview" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#resources" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#timeline" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Timeline
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Helpful Resources
            </h4>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center"
                  >
                    {resource.name}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} Full-Stack Developer Roadmap. Created with{' '}
            <Heart className="w-4 h-4 inline text-red-500" /> for aspiring developers.
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm mt-4 md:mt-0">
            Built with React + Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
