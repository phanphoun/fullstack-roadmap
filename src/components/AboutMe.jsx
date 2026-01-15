import React from 'react';
import { Mail, Github, Linkedin, MapPin, Calendar, Briefcase, Award, Code, Heart, BookOpen, Users, Lightbulb } from 'lucide-react';

const AboutMe = () => {
    const skills = [
        { name: 'React', level: 90 },
        { name: 'JavaScript', level: 85 },
        { name: 'Node.js', level: 80 },
        { name: 'Python', level: 75 },
        { name: 'Tailwind CSS', level: 88 },
        { name: 'MongoDB', level: 70 }
    ];

    const interests = [
        { icon: Code, text: 'Clean Code Architecture' },
        { icon: Lightbulb, text: 'Problem Solving' },
        { icon: BookOpen, text: 'Continuous Learning' },
        { icon: Users, text: 'Team Collaboration' }
    ];

    const timeline = [
        {
            year: '2024',
            title: 'Full-Stack Developer',
            description: 'Building modern web applications with React and Node.js'
        },
        {
            year: '2023',
            title: 'Frontend Specialist',
            description: 'Focused on creating responsive and user-friendly interfaces'
        },
        {
            year: '2022',
            title: 'Journey Started',
            description: 'Began the path to becoming a full-stack developer'
        }
    ];

    return (
        <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        About Me
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Passionate full-stack developer dedicated to creating impactful digital experiences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-24">
                            <div className="text-center">
                                {/* Profile Image */}
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-success-500 rounded-full p-1">
                                        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <div className="w-28 h-28 bg-gradient-to-r from-primary-400 to-success-400 rounded-full flex items-center justify-center">
                                                <span className="text-white text-3xl font-bold">PM</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Phoun Phan
                                </h3>
                                <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
                                    Full-Stack Developer
                                </p>

                                <div className="flex items-center justify-center text-gray-600 dark:text-gray-300 mb-6">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>Phnom Penh, Cambodia</span>
                                </div>

                                {/* Bio */}
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    I'm a passionate developer who loves turning ideas into reality through code.
                                    My journey in web development has been driven by curiosity and a desire to create
                                    meaningful digital experiences that make a difference.
                                </p>

                                {/* Social Links */}
                                <div className="flex justify-center space-x-4">
                                    <a
                                        href="mailto:phounphan@example.com"
                                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors group"
                                    >
                                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                    </a>
                                    <a
                                        href="https://github.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors group"
                                    >
                                        <Github className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                    </a>
                                    <a
                                        href="https://linkedin.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors group"
                                    >
                                        <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">3+</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Years</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-success-600 dark:text-success-400">50+</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">100+</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Clients</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Story Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Heart className="w-6 h-6 mr-3 text-red-500" />
                                My Story
                            </h3>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    My journey into web development began with a simple curiosity about how websites work.
                                    What started as experimenting with HTML and CSS quickly evolved into a deep passion for
                                    creating interactive, user-centric applications.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Throughout my career, I've had the privilege of working with diverse teams and tackling
                                    challenges across various domains - from e-commerce platforms to educational tools.
                                    Each project has taught me valuable lessons about scalability, user experience, and
                                    the importance of clean, maintainable code.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Today, I specialize in the MERN stack and have a keen interest in emerging technologies
                                    like AI integration and progressive web apps. I believe in continuous learning and am
                                    always excited to take on new challenges that push the boundaries of what's possible on the web.
                                </p>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Code className="w-6 h-6 mr-3 text-blue-500" />
                                Technical Skills
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {skills.map((skill, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${skill.level}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interests Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Lightbulb className="w-6 h-6 mr-3 text-yellow-500" />
                                Interests & Passions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {interests.map((interest, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                            <interest.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-gray-900 dark:text-white font-medium">{interest.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Calendar className="w-6 h-6 mr-3 text-green-500" />
                                Journey Timeline
                            </h3>
                            <div className="space-y-6">
                                {timeline.map((item, index) => (
                                    <div key={index} className="flex space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                                                    {item.year.slice(-2)}
                                                </span>
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">{item.year}</p>
                                            <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
