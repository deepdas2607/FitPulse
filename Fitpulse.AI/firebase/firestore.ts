import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfileData, BodyMetrics, HealthInfo, EmergencyContact } from '../types';

// Firestore collection names
const COLLECTIONS = {
    USERS: 'users',
    HEALTH_METRICS: 'healthMetrics',
    FITNESS_DATA: 'fitnessData',
};

/**
 * Create or update a user profile in Firestore
 * @param userId - User's Firebase Auth UID
 * @param data - User profile data
 */
export const createUserProfile = async (
    userId: string,
    data: Partial<UserProfileData>
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userDoc = await getDoc(userRef);

        // Only create if doesn't exist (prevents overwriting on Google sign-in)
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

/**
 * Get a user's profile from Firestore
 * @param userId - User's Firebase Auth UID
 * @returns User profile data or null
 */
export const getUserProfile = async (userId: string): Promise<any | null> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Update a user's profile
 * @param userId - User's Firebase Auth UID
 * @param data - Partial user data to update
 */
export const updateUserProfile = async (
    userId: string,
    data: Partial<UserProfileData>
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        // Remove any undefined fields (Firestore rejects undefined values)
        const removeUndefined = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (Array.isArray(obj)) return obj.map(removeUndefined);
            if (typeof obj !== 'object') return obj;
            return Object.entries(obj).reduce((acc: any, [k, v]) => {
                if (v === undefined) return acc;
                const cleaned = removeUndefined(v);
                // Only set if cleaned is not undefined
                if (cleaned !== undefined) acc[k] = cleaned;
                return acc;
            }, {});
        };

        const sanitized = removeUndefined(data);

        await updateDoc(userRef, {
            ...sanitized,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Save health metrics for a user
 * @param userId - User's Firebase Auth UID
 * @param metrics - Health metrics data
 */
export const saveHealthMetrics = async (
    userId: string,
    metrics: {
        heartRate?: number;
        sleepScore?: number;
        hydration?: number;
        temperature?: number;
        date?: string;
    }
): Promise<void> => {
    try {
        const metricsRef = doc(db, COLLECTIONS.HEALTH_METRICS, userId);
        await setDoc(
            metricsRef,
            {
                ...metrics,
                date: metrics.date || new Date().toISOString().split('T')[0],
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error saving health metrics:', error);
        throw error;
    }
};

/**
 * Get health metrics for a user
 * @param userId - User's Firebase Auth UID
 * @returns Health metrics data or null
 */
export const getHealthMetrics = async (userId: string): Promise<any | null> => {
    try {
        const metricsRef = doc(db, COLLECTIONS.HEALTH_METRICS, userId);
        const metricsDoc = await getDoc(metricsRef);

        if (metricsDoc.exists()) {
            return { id: metricsDoc.id, ...metricsDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting health metrics:', error);
        throw error;
    }
};

/**
 * Save fitness data for a user
 * @param userId - User's Firebase Auth UID
 * @param data - Fitness data
 */
export const saveFitnessData = async (
    userId: string,
    data: {
        steps?: number;
        calories?: number;
        activeMinutes?: number;
        workouts?: any[];
        date?: string;
    }
): Promise<void> => {
    try {
        const fitnessRef = doc(db, COLLECTIONS.FITNESS_DATA, userId);
        await setDoc(
            fitnessRef,
            {
                ...data,
                date: data.date || new Date().toISOString().split('T')[0],
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error saving fitness data:', error);
        throw error;
    }
};

/**
 * Get fitness data for a user
 * @param userId - User's Firebase Auth UID
 * @returns Fitness data or null
 */
export const getFitnessData = async (userId: string): Promise<any | null> => {
    try {
        const fitnessRef = doc(db, COLLECTIONS.FITNESS_DATA, userId);
        const fitnessDoc = await getDoc(fitnessRef);

        if (fitnessDoc.exists()) {
            return { id: fitnessDoc.id, ...fitnessDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting fitness data:', error);
        throw error;
    }
};
