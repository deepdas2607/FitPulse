# FitPulse - AI-Powered Fitness & Health Platform

## 🎯 Implemented MVP Features

### 1. ✅ AI Posture Detection & Form Correction
**Status:** Fully Implemented

**Technology:** MediaPipe Pose (Google)

**Features:**
- Real-time pose detection using device camera
- Joint angle calculations for form analysis
- Exercise-specific form validation (squats, bicep curls, push-ups, crunches, etc.)
- Visual feedback with skeleton overlay on video feed
- Form quality scoring (0-100)
- Severity-based issue detection (low, medium, high)

**Files:**
- `utils/formAnalyzer.ts` - Core form analysis logic
- `components/ExerciseTracker.tsx` - Real-time tracking UI

**How it works:**
1. User starts an exercise session
2. MediaPipe Pose detects 33 body landmarks in real-time
3. Custom algorithms calculate joint angles and body alignment
4. Issues are flagged with specific tips for correction
5. Form score is calculated based on issue severity and frequency

---

### 2. ✅ Rep Counting
**Status:** Fully Implemented

**Technology:** MediaPipe Pose + Custom State Machine

**Features:**
- Automatic rep counting based on movement patterns
- Exercise-specific rep detection logic
- Debouncing to prevent false counts
- Real-time rep display during workout
- Set tracking with per-set rep counts

**Files:**
- `utils/formAnalyzer.ts` - Rep detection algorithms
- `components/ExerciseTracker.tsx` - Rep counter UI

**How it works:**
1. Tracks key joint positions (e.g., hip-knee distance for squats)
2. Detects movement thresholds indicating rep completion
3. Uses time-based debouncing to avoid double-counting
4. Updates rep count in real-time on screen

---

### 3. ✅ Post-Workout Visual Summary
**Status:** Fully Implemented

**Technology:** React + Recharts

**Features:**
- Comprehensive workout summary with stats
- Form issue breakdown by type
- Visual form score with color coding
- Improvement suggestions based on detected issues
- Set and rep breakdown
- Duration and calorie estimates

**Files:**
- `components/ExerciseSummary.tsx` - Summary UI
- `utils/weeklyReport.ts` - Report generation logic

**How it works:**
1. Collects all form issues during workout
2. Calculates form score (100 - penalties for issues)
3. Groups issues by type (alignment, posture, range-of-motion, speed)
4. Generates personalized improvement tips
5. Displays visual summary with charts

---

### 4. ✅ Virtual Spotter (HELP Keyword Detection)
**Status:** Fully Implemented

**Technology:** Web Speech API (Browser-based, no API key needed)

**Features:**
- Continuous voice monitoring during workouts
- Emergency word detection: "help", "emergency", "stop", "ambulance", "911"
- Automatic workout pause on detection
- Emergency alert modal with quick actions
- Visual indicator when listening is active

**Files:**
- `utils/speechRecognition.ts` - Speech recognition engine
- `components/EmergencyAlert.tsx` - Emergency UI
- `components/ExerciseTracker.tsx` - Integration

**How it works:**
1. Starts listening when workout begins
2. Continuously processes speech in background
3. Matches against emergency keywords
4. Immediately pauses workout and shows alert
5. Provides emergency contact options

---

### 5. ✅ Emergency Assistance Automation
**Status:** Fully Implemented

**Technology:** Web APIs + Tel Protocol

**Features:**
- Emergency contact quick dial
- Pre-filled emergency numbers (911, etc.)
- User's emergency contact from profile
- One-tap calling via tel: protocol
- Emergency alert modal with clear actions

**Files:**
- `components/EmergencyAlert.tsx` - Emergency UI
- `types.ts` - EmergencyContact type definition

**How it works:**
1. Triggered by voice command or manual activation
2. Displays emergency contact options
3. Uses tel: protocol for instant dialing
4. Accesses user's saved emergency contact from profile

---

### 6. ✅ Adaptive Workout Intensity
**Status:** Fully Implemented

**Technology:** Rule-based AI System

**Features:**
- Pre-workout feedback collection (stress, fatigue, soreness, sleep, motivation)
- Intelligent intensity recommendation (rest, light, moderate, intense)
- Personalized suggestions based on user state
- Overtraining detection
- Recovery recommendations

**Files:**
- `utils/adaptiveWorkout.ts` - Intensity calculation engine
- `components/WorkoutFeedbackModal.tsx` - Feedback collection UI
- `components/IntensityRecommendation.tsx` - Recommendation display

**How it works:**
1. User rates 5 factors before workout (1-5 scale)
2. Algorithm calculates intensity score (0-100)
3. Deducts points for high stress, fatigue, soreness, poor sleep
4. Adds points for high motivation
5. Recommends appropriate intensity level with reasoning

**Scoring System:**
- Stress Level 4-5: -30 points
- Fatigue Level 4-5: -35 points
- Muscle Soreness 4-5: -30 points
- Poor Sleep (1-2): -25 points
- High Motivation (4-5): +10 points

---

### 7. ✅ Food Lens with OCR
**Status:** Fully Implemented

**Technology:** Tesseract.js (OCR Library)

**Features:**
- Camera-based food label scanning
- Image upload support
- Automatic nutrition extraction (calories, protein, carbs, fat, fiber, sugar, sodium)
- Progress indicator during scanning
- Serving size detection
- Raw text extraction for manual review

**Files:**
- `utils/ocrScanner.ts` - OCR processing engine
- `components/FoodScanner.tsx` - Scanner UI

**How it works:**
1. User captures or uploads food label image
2. Tesseract.js performs OCR on image
3. Regex patterns extract nutrition values
4. Parsed data displayed in clean format
5. Can scan multiple items in succession

---

### 8. ✅ Diet Suitability Checker
**Status:** Fully Implemented

**Technology:** Rule-based Evaluation System

**Features:**
- Evaluates food against user's dietary goals
- Suitability score (0-100)
- Warnings for exceeding limits
- Positive recommendations
- Diet-specific checks (keto, high-protein, low-carb, balanced)
- Color-coded feedback (green = good, yellow = caution)

**Files:**
- `utils/ocrScanner.ts` - Evaluation logic
- `components/FoodScanner.tsx` - Results display

**How it works:**
1. Compares scanned nutrition against user goals
2. Checks: calories, protein, carbs, fat, sugar, sodium
3. Deducts points for violations
4. Provides specific warnings and tips
5. Displays suitability score with recommendations

**Scoring System:**
- Base score: 100
- High calories: -20 points
- Low protein: -10 points
- High carbs: -15 points
- High sugar: -15 points
- High sodium: -10 points
- Keto violation: -25 points

---

### 9. ✅ Overtraining / Recovery Detection
**Status:** Fully Implemented

**Technology:** Workout Log Analysis

**Features:**
- Analyzes workout frequency and intensity
- Detects consecutive high-intensity sessions
- Identifies overworked muscle groups
- Monitors form degradation over time
- Risk level assessment (low, medium, high)
- Specific recovery recommendations

**Files:**
- `utils/adaptiveWorkout.ts` - Overtraining detection logic

**Detection Criteria:**
- 6+ workouts per week without rest
- 3+ consecutive intense sessions
- Same muscle group 4+ times in 5 workouts
- Declining form quality
- Persistent high fatigue/soreness

---

### 10. ✅ Weekly Health & Fitness Reports
**Status:** Fully Implemented

**Technology:** Data Aggregation + Recharts

**Features:**
- Comprehensive weekly statistics
- Workout distribution by day
- Top exercises ranking
- Form quality trends
- Achievement badges
- Improvement areas identification
- Personalized recommendations
- Overall score (0-100)

**Files:**
- `utils/weeklyReport.ts` - Report generation
- `components/WeeklyReportView.tsx` - Report UI

**Report Includes:**
- Total workouts, duration, reps, sets
- Average form score
- Calories burned estimate
- Most common form issues
- Workout frequency by day
- Health metrics (sleep, stress, hydration)
- Achievements and improvements

**Overall Score Breakdown:**
- Workout frequency: 30 points
- Form quality: 25 points
- Sleep quality: 20 points
- Hydration: 15 points
- Stress management: 10 points

---

### 11. ✅ Habit Builder
**Status:** Fully Implemented

**Technology:** Browser Notifications API + Timers

**Features:**
- Pre-configured healthy habits (hydration, stretching, posture, eye rest, breathing)
- Customizable reminder intervals
- Browser notifications (works even when app is closed)
- Enable/disable individual habits
- Visual habit status indicators
- Frequency customization (hourly, daily, custom intervals)

**Files:**
- `utils/habitBuilder.ts` - Habit scheduling engine
- `components/HabitManager.tsx` - Habit management UI

**Default Habits:**
- 💧 Drink Water - Every hour
- 🧘 Stretch Break - Every 2 hours
- 🪑 Check Posture - Every 30 minutes
- 👁️ Eye Rest (20-20-20 rule) - Every 20 minutes
- 🌬️ Deep Breathing - Every 3 hours

**How it works:**
1. User enables desired habits
2. Scheduler sets up intervals
3. Browser notifications trigger at intervals
4. Notifications persist even when app is closed
5. Habits can be toggled on/off anytime

---

## 🚀 How to Use

### Starting a Workout

1. Go to **Fitness Dashboard**
2. Click **"Launch Session"** on AI Form Correction card
3. Complete the **"How are you feeling?"** feedback form
4. Review your **Intensity Recommendation**
5. Select an exercise from the list
6. Grant camera and microphone permissions
7. Start exercising with real-time feedback

### Scanning Food Labels

1. Go to **Health Dashboard**
2. Click **"Scan Food Label"** button
3. Choose **Take Photo** or **Upload Image**
4. Point camera at nutrition label
5. Wait for OCR processing
6. Review nutrition facts and suitability score

### Managing Habits

1. Go to **Health Dashboard**
2. Click **"Habits"** button in top right
3. Enable notification permissions
4. Toggle habits on/off
5. Receive automatic reminders

### Viewing Weekly Report

1. Go to **Fitness Dashboard**
2. Click **"Weekly Report"** button
3. Review your stats, achievements, and recommendations

---

## 🛠️ Technical Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via index.css)
- **Recharts** - Data visualization

### AI/ML Libraries
- **MediaPipe Pose** - Pose detection
- **Tesseract.js** - OCR for food labels

### Browser APIs
- **Web Speech API** - Voice recognition
- **Notifications API** - Habit reminders
- **MediaDevices API** - Camera access
- **Canvas API** - Video overlay rendering

### Backend
- **Firebase** - Authentication & Firestore database

---

## 📱 Browser Compatibility

### Fully Supported
- Chrome 90+
- Edge 90+
- Safari 14+ (limited speech recognition)
- Firefox 88+

### Required Permissions
- Camera (for pose detection and food scanning)
- Microphone (for emergency voice detection)
- Notifications (for habit reminders)

---

## 🔒 Privacy & Security

- All pose detection runs **locally** in browser (no video uploaded)
- OCR processing happens **client-side** (no images sent to servers)
- Speech recognition uses **browser's built-in API** (no external services)
- User data stored in **Firebase with authentication**
- No third-party analytics or tracking

---

## 🎨 Key Features Summary

| Feature | Status | Technology | API Key Required |
|---------|--------|------------|------------------|
| Posture Detection | ✅ | MediaPipe Pose | No |
| Rep Counting | ✅ | Custom Logic | No |
| Post-Workout Summary | ✅ | React + Recharts | No |
| Virtual Spotter | ✅ | Web Speech API | No |
| Emergency Assistance | ✅ | Tel Protocol | No |
| Adaptive Intensity | ✅ | Rule-based AI | No |
| Food OCR | ✅ | Tesseract.js | No |
| Diet Checker | ✅ | Rule-based | No |
| Overtraining Detection | ✅ | Analytics | No |
| Weekly Reports | ✅ | Data Aggregation | No |
| Habit Builder | ✅ | Notifications API | No |

---

## 🚧 Future Enhancements (Not in MVP)

### Planned Features
- **Food Recognition** - Visual food identification (requires ML model)
- **Symptom-to-Risk Analyzer** - Health risk assessment (requires medical ML model)
- **Audio Stress Detection** - Voice tone analysis (requires audio ML model)
- **Multi-Language Support** - i18n implementation
- **Social Features** - Workout sharing and challenges
- **Wearable Integration** - Smartwatch sync
- **Advanced Analytics** - ML-based predictions

---

## 📖 Code Structure

```
src/
├── components/
│   ├── ExerciseTracker.tsx          # Main workout tracking
│   ├── ExerciseSummary.tsx          # Post-workout summary
│   ├── FoodScanner.tsx              # OCR food scanning
│   ├── WorkoutFeedbackModal.tsx     # Pre-workout feedback
│   ├── IntensityRecommendation.tsx  # Adaptive intensity
│   ├── WeeklyReportView.tsx         # Weekly reports
│   ├── HabitManager.tsx             # Habit builder
│   └── EmergencyAlert.tsx           # Emergency assistance
├── utils/
│   ├── formAnalyzer.ts              # Pose analysis logic
│   ├── speechRecognition.ts         # Voice detection
│   ├── ocrScanner.ts                # OCR & diet checker
│   ├── adaptiveWorkout.ts           # Intensity & overtraining
│   ├── weeklyReport.ts              # Report generation
│   └── habitBuilder.ts              # Habit scheduling
├── pages/
│   ├── DashboardFitness.tsx         # Fitness dashboard
│   └── DashboardHealth.tsx          # Health dashboard
└── types.ts                         # TypeScript definitions
```

---

## 🎯 MVP Achievement

**All 6 core MVP features + 5 bonus features implemented!**

✅ 1. Posture Detection  
✅ 2. Rep Counting  
✅ 3. Post-Workout Visual Summary  
✅ 4. Virtual Spotter  
✅ 5. Adaptive Workout Intensity  
✅ 6. OCR Food Detection  

**Bonus:**
✅ Emergency Assistance  
✅ Diet Suitability Checker  
✅ Overtraining Detection  
✅ Weekly Reports  
✅ Habit Builder  

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Note:** Make sure to configure Firebase credentials in `.env` file before running.

---

## 📝 License

This project is part of FitPulse - AI-Powered Fitness & Health Platform.
