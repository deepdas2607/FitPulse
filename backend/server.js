const express = require('express');
require('dotenv').config(); // Load env vars first
const cors = require('cors');
const { spawn } = require('child_process');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());

// KEEP-ALIVE: Prevent process from exiting if event loop is empty
setInterval(() => { }, 10000);
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Debugging crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Keep it alive for now to see the error? No, better to let it crash but log it first.
});
process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into DB
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        const user = result.rows[0];
        // Generate Token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        } else {
            res.status(403).json({ error: 'Invalid password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- PROFILE ROUTES ---

// Get Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.userId]);
        res.json(result.rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update/Create Profile
app.post('/api/profile', authenticateToken, async (req, res) => {
    const { age, gender, weight, height, activity_level, goals, dietary_preferences, doctor_name, doctor_contact } = req.body;
    const userId = req.user.userId;

    try {
        // Check if profile exists
        const check = await db.query('SELECT user_id FROM user_profiles WHERE user_id = $1', [userId]);

        if (check.rows.length > 0) {
            // Update
            const result = await db.query(
                `UPDATE user_profiles 
                 SET age = $1, gender = $2, weight = $3, height = $4, activity_level = $5, goals = $6, dietary_preferences = $7, doctor_name = $8, doctor_contact = $9, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $10 RETURNING *`,
                [age, gender, weight, height, activity_level, goals, dietary_preferences, doctor_name, doctor_contact, userId]
            );
            res.json(result.rows[0]);
        } else {
            // Insert
            const result = await db.query(
                `INSERT INTO user_profiles (user_id, age, gender, weight, height, activity_level, goals, dietary_preferences, doctor_name, doctor_contact)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [userId, age, gender, weight, height, activity_level, goals, dietary_preferences, doctor_name, doctor_contact]
            );
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- FITNESS ROUTES ---

// Log Workout
app.post('/api/workouts', authenticateToken, async (req, res) => {
    const { date, duration_minutes, notes, exercises } = req.body; // exercises is array of { name, sets, reps, weight }
    const userId = req.user.userId;

    try {
        // Start transaction
        await db.query('BEGIN');

        // Insert Workout
        console.log('Logging workout payload:', req.body);
        const workoutResult = await db.query(
            'INSERT INTO workouts (user_id, date, duration_minutes, notes) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, date || new Date(), duration_minutes, notes]
        );
        const workoutId = workoutResult.rows[0].id;

        // Insert Exercises
        if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
                await db.query(
                    'INSERT INTO workout_exercises (workout_id, exercise_name, sets, reps, weight_kg) VALUES ($1, $2, $3, $4, $5)',
                    [workoutId, ex.name, ex.sets, ex.reps, ex.weight]
                );
            }
        }

        await db.query('COMMIT');
        res.json({ message: 'Workout logged successfully', workoutId });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Workout History
app.get('/api/workouts', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT w.*, 
                    json_agg(json_build_object('name', we.exercise_name, 'sets', we.sets, 'reps', we.reps, 'weight', we.weight_kg)) as exercises
             FROM workouts w
             LEFT JOIN workout_exercises we ON w.id = we.workout_id
             WHERE w.user_id = $1
             GROUP BY w.id
             ORDER BY w.date DESC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- RECOMMENDATION ROUTES ---

// --- RECOMMENDATION ROUTES ---



// Generate Food Recommendation (MOCK MODE)
app.post('/api/recommendations', authenticateToken, async (req, res) => {
    const { workoutInfo, dietaryRestrictions: requestDietary, customGoals } = req.body;
    const userId = req.user.userId;

    try {
        const profileRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        const profile = profileRes.rows[0];

        if (!profile) {
            return res.status(400).json({ error: 'Please set up your profile first' });
        }

        // MOCK RECOMMENDATION GENERATOR
        const goal = (profile.goals || "").toLowerCase();
        let recommendation = "**Demo Mode**\n*(Note: Video submission has the proper API response. Live demo usage is limited.)*\n\n";

        if (goal.includes('loss') || goal.includes('cut')) {
            recommendation += "### 🥗 High-Protein Weight Loss Meal\n" +
                "**Grilled Chicken & Quinoa Salad**\n" +
                "- **Why:** High in protein to spare muscle, fiber-rich to keep you full.\n" +
                "- **Macros:** 35g Protein | 25g Carbs | 10g Fat\n\n" +
                "*Tip: Drink 500ml of water before eating!*";
        } else if (goal.includes('gain') || goal.includes('muscle') || goal.includes('bulk')) {
            recommendation += "### 💪 Muscle Building Power Bowl\n" +
                "**Steak, Sweet Potato & Broccoli**\n" +
                "- **Why:** Red meat for creatine/iron, complex carbs for sustained energy.\n" +
                "- **Macros:** 45g Protein | 60g Carbs | 18g Fat\n\n" +
                "*Tip: Add a protein shake post-workout.*";
        } else {
            recommendation += "### 🍏 Balanced Wellness Plate\n" +
                "**Baked Salmon with Asparagus & Brown Rice**\n" +
                "- **Why:** Omega-3 fatty acids for heart health and great recovery.\n" +
                "- **Macros:** 30g Protein | 40g Carbs | 15g Fat";
        }

        // Save recommendation
        await db.query(
            'INSERT INTO food_recommendations (user_id, recommendation_text) VALUES ($1, $2)',
            [req.user.userId, recommendation]
        );

        // Simulate delay
        setTimeout(() => {
            res.json({ recommendation });
        }, 1000);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Chatbot Endpoint (MOCK MODE)
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { message, history } = req.body;
    const userId = req.user.userId;

    try {
        // Fetch user profile for context
        const profileRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        const profile = profileRes.rows[0] || {};
        const userName = profile.username || "User";

        // MOCK LOGIC
        let responseText = "I'm currently running in Demo Mode. (Note: Video submission has the proper API response). ";

        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText += `Hello! I'm FitPulse AI. I see your goal is ${profile.goals || 'fitness'}. How can I help you today?`;
        } else if (lowerMsg.includes('diet') || lowerMsg.includes('food') || lowerMsg.includes('eat')) {
            responseText += "Nutrition is key! Based on your profile, I recommend focusing on whole foods, lean proteins, and plenty of vegetables. Since we are in demo mode, check out the Health Dashboard for specific meal plans!";
        } else if (lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
            responseText += "Consistency is everything. Try to mix cardio with strength training. Use the Exercise Tracker to log your squats and curls!";
        } else {
            responseText += "That's a great question! As an AI fitness assistant, I suggest staying consistent with your routine and listening to your body. (Note: Full AI responses will return when API quota is refreshed).";
        }

        // Simulate network delay for realism
        setTimeout(() => {
            res.json({ response: responseText });
        }, 800);

    } catch (err) {
        console.error("Chat Mock Error:", err);
        res.status(500).json({ error: 'Failed to generate response', details: err.message });
    }
});

function getFallbackRecommendation(profile) {
    const goal = (profile.goals || "").toLowerCase();
    if (goal.includes('loss') || goal.includes('cut')) {
        return "Focus on high-protein, calorie-deficit meals. Example: Grilled chicken salad with quinoa.";
    } else if (goal.includes('gain') || goal.includes('muscle')) {
        return "Focus on high-protein, calorie-surplus meals. Example: Steak with sweet potatoes and broccoli.";
    } else {
        return "Maintain a balanced diet with whole foods. Example: Salmon with roasted vegetables.";
    }
}

// --- EXISTING PREDICTION ROUTE ---

app.post('/predict', (req, res) => {
    const symptoms = req.body.symptoms;

    // Use 'python' instead of 'python3' for Windows
    const python = spawn('python', ['predict.py', JSON.stringify({ symptoms })]);

    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
        errorString += data.toString();
        // Don't log as error immediately, sometimes libraries print warnings to stderr
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error('Python process exited with code:', code);
            console.error('Error:', errorString);
            return res.status(500).json({ error: "Prediction error", details: errorString });
        }
        try {
            const prediction = dataString.trim();
            // Try parsing if it's JSON, otherwise send as string
            // The python script usually returns just the disease string, but let's be safe
            res.json({ disease: prediction });
        } catch (e) {
            res.json({ disease: dataString.trim() });
        }
    });

    python.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        res.status(500).json({ error: "Failed to start prediction process" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
