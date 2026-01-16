import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Eye, EyeOff, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, clearError, isLoading: authLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(formData);

            if (result.success) {
                // Success will be handled by AuthContext
                console.log('Login successful');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        clearError();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Back to Home */}
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Roadmap
                </Link>

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-success-500 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Sign in to track your learning progress
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="•••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || authLoading}
                            className="w-full bg-gradient-to-r from-primary-500 to-success-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-600 hover:to-success-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {(isLoading || authLoading) ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-2">Signing in...</span>
                                </span>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                type="button"
                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                title="Coming soon"
                            >
                                <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                type="button"
                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                title="Coming soon"
                            >
                                <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {/* Switch Mode */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Why Sign In?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                <Lock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="font-medium">Secure Login</span>
                            <span className="text-xs">Your data is protected</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-success-600 dark:text-success-400" />
                            </div>
                            <span className="font-medium">Progress Tracking</span>
                            <span className="text-xs">Save your learning journey</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                                <Eye className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                            </div>
                            <span className="font-medium">Analytics</span>
                            <span className="text-xs">Track your progress</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
