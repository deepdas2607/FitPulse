import React, { createContext, useContext, useState } from 'react';
import { User } from 'firebase/auth';

import { EmergencyContact, BodyMetrics, HealthInfo } from '../types';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt?: string;
    emergencyContact?: EmergencyContact;
    bodyMetrics?: BodyMetrics;
    healthInfo?: HealthInfo;
}

interface AuthContextType {
    user: User | null | undefined;
    userProfile: UserProfile | null;
    loading: boolean;
    error: Error | undefined;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    error: undefined,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Mock mode - bypasses Firebase authentication
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Mock user for testing
    const [mockUser] = useState<any>({
        uid: 'mock-user-123',
        email: 'demo@fitpulse.com',
        displayName: 'Demo User',
    });

    const [mockProfile] = useState<UserProfile>({
        id: 'mock-user-123',
        name: 'Demo User',
        email: 'demo@fitpulse.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        createdAt: new Date().toISOString(),
    });

    const value = {
        user: mockUser,
        userProfile: mockProfile,
        loading: false,
        error: undefined,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
