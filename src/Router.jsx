import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route component (redirects to app if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRouter = () => {
    return (
        <Router>
            <AuthProvider>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />

                        {/* Protected routes */}
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <App />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
};

export default AppRouter;
