const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    // Auth
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    register: async (username, email, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Profile
    getProfile: async () => {
        const res = await fetch(`${API_URL}/profile`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    updateProfile: async (data) => {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
    },

    // Fitness
    logWorkout: async (workoutData) => {
        const res = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(workoutData),
        });
        if (!res.ok) throw new Error('Failed to log workout');
        return res.json();
    },

    getWorkouts: async () => {
        const res = await fetch(`${API_URL}/workouts`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch workouts');
        return res.json();
    },

    // Recommendations
    getRecommendations: async (data = {}) => {
        const res = await fetch(`${API_URL}/recommendations`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to get recommendations');
        return res.json();
    },

    // Chatbot
    chat: async (message, history = []) => {
        const res = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, history }),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Chat API Failed: ${res.status} ${res.statusText} - ${errText}`);
        }
        return res.json();
    }
};
