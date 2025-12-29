import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User,
    UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign up a new user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @param name - User's full name
 * @returns UserCredential from Firebase
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, {
            name,
            email,
            createdAt: new Date().toISOString(),
        });

        return userCredential;
    } catch (error: any) {
        console.error('Error signing up:', error);
        throw error;
    }
};

/**
 * Sign in an existing user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns UserCredential from Firebase
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        console.error('Error signing in:', error);
        throw error;
    }
};

/**
 * Sign in with Google OAuth
 * @returns UserCredential from Firebase
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);

        // Create user profile if it's a new user
        // Check if profile exists, if not create one
        await createUserProfile(userCredential.user.uid, {
            name: userCredential.user.displayName || 'User',
            email: userCredential.user.email || '',
            avatarUrl: userCredential.user.photoURL || undefined,
            createdAt: new Date().toISOString(),
        });

        return userCredential;
    } catch (error: any) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Get the current authenticated user
 * @returns Current user or null
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Get a user-friendly error message from Firebase error codes
 * @param errorCode - Firebase error code
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use a stronger password.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled.';
        default:
            return 'An error occurred. Please try again.';
    }
};
