import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { UserProfileData } from '../types';

// Simplified types for the new backend
interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfileData | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshProfile = useCallback(async () => {
        try {
            const profile = await api.getProfile();
            // Map backend profile keys to frontend UserProfileData structure if needed.
            // Backend returns: { age, gender, weight, height, activity_level, goals, dietary_preferences }
            // Frontend types.ts expects: { bodyMetrics: { weight, height ... }, healthInfo: { ... } }
            // Mapping is required here or in api.js. Let's do a basic map here.

            const weight = Number(profile.weight);
            const height = Number(profile.height);
            let bmi = undefined;

            if (weight && height) {
                const heightInMeters = height / 100;
                bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
            }

            const mappedProfile: UserProfileData = {
                name: user?.username || '',
                email: user?.email || '',
                bodyMetrics: {
                    weight: weight || undefined,
                    height: height || undefined,
                    bmi: bmi
                },
                healthInfo: {
                    gender: profile.gender,
                    activityLevel: profile.activity_level,
                    fitnessGoals: profile.goals ? profile.goals.split(', ') : [],
                    dietaryRestrictions: profile.dietary_preferences ? profile.dietary_preferences.split(', ') : [],
                    doctorName: profile.doctor_name,
                    doctorContact: profile.doctor_contact,
                }
            };
            setUserProfile(mappedProfile);
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    }, [user]);

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // We should fetch profile here, but we need the user set first.
                // The next useEffect [user] handles it if we depend on it, 
                // but let's just trigger it once we confirm user is set.
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Fetch profile whenever user changes and is logged in
    useEffect(() => {
        if (user) {
            refreshProfile();
        } else {
            setUserProfile(null);
        }
    }, [user, refreshProfile]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.login(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            // Profile fetch will be triggered by useEffect
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.register(username, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserProfile(null);
    };

    const value = {
        user,
        userProfile,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
