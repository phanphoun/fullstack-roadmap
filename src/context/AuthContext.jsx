import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api.js';

// Initial state
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    LOAD_USER_START: 'LOAD_USER_START',
    LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
    LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
    UPDATE_PROFILE_START: 'UPDATE_PROFILE_START',
    UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
    UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
        case AUTH_ACTIONS.LOAD_USER_START:
        case AUTH_ACTIONS.UPDATE_PROFILE_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
        case AUTH_ACTIONS.LOAD_USER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user },
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
        case AUTH_ACTIONS.LOAD_USER_FAILURE:
        case AUTH_ACTIONS.UPDATE_PROFILE_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user on initial render and token change
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token or user found' });
                return;
            }

            try {
                dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

                // Set token in API service
                apiService.setToken(token);

                // Parse user from localStorage
                const parsedUser = JSON.parse(user);

                dispatch({
                    type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                    payload: {
                        user: parsedUser,
                        token,
                    },
                });
            } catch (error) {
                console.error('Load user error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                apiService.setToken(null);
                dispatch({
                    type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                    payload: error.message || 'Failed to load user',
                });
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });

            const response = await apiService.login(credentials);

            if (response.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));

                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        user: response.user,
                        token: response.token,
                    },
                });
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message || 'Login failed',
            });
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.REGISTER_START });

            const response = await apiService.register(userData);

            if (response.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));

                dispatch({
                    type: AUTH_ACTIONS.REGISTER_SUCCESS,
                    payload: {
                        user: response.user,
                        token: response.token,
                    },
                });
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: error.message || 'Registration failed',
            });
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE_START });

            const response = await apiService.updateProfile(profileData);

            if (response.success) {
                // Update user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));

                dispatch({
                    type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
                    payload: {
                        user: response.user,
                    },
                });
                return { success: true, user: response.user };
            } else {
                throw new Error(response.message || 'Profile update failed');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
                payload: error.message || 'Profile update failed',
            });
            return { success: false, error: error.message };
        }
    };

    // Change password function
    const changePassword = async (passwordData) => {
        try {
            const response = await apiService.changePassword(passwordData);

            if (response.success) {
                return { success: true };
            } else {
                throw new Error(response.message || 'Password change failed');
            }
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: error.message };
        }
    };

    // Delete account function
    const deleteAccount = async (password) => {
        try {
            const response = await apiService.delete('/auth/account', {
                method: 'DELETE',
                body: JSON.stringify({ password }),
            });

            if (response.success) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
                return { success: true };
            } else {
                throw new Error(response.message || 'Account deletion failed');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            return { success: false, error: error.message };
        }
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
