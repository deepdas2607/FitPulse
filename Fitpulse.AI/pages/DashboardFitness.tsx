import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Timer, Trophy, FileText, Activity, AlertCircle, X, Utensils } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import PosePlaceholder from '../components/Placeholder/PosePlaceholder';
import ExerciseSelection from '../components/ExerciseSelection';
import ExerciseTracker from '../components/ExerciseTracker';
import ExerciseSummary from '../components/ExerciseSummary';
import WorkoutFeedbackModal from '../components/WorkoutFeedbackModal';
import IntensityRecommendation from '../components/IntensityRecommendation';
import WeeklyReportView from '../components/WeeklyReportView';
import { weeklyActivity } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Exercise, ExerciseSession } from '../types';
import { WorkoutFeedback, IntensityRecommendation as IntensityRec } from '../utils/adaptiveWorkout';
import { generateWeeklyReport, WeeklyReport } from '../utils/weeklyReport';

type ViewState = 'dashboard' | 'selection' | 'tracking' | 'summary';

const DashboardFitness: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [completedSession, setCompletedSession] = useState<ExerciseSession | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [intensityRecommendation, setIntensityRecommendation] = useState<IntensityRec | null>(null);
    const [showWeeklyReport, setShowWeeklyReport] = useState(false);
    const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
    const { userProfile, user } = useAuth();

    // Store completed sessions (fetched from database)
    const [completedSessions, setCompletedSessions] = useState<ExerciseSession[]>([]);
    const [recentWorkoutsList, setRecentWorkoutsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState<any | null>(null);

    // Fetch workouts on load
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const workouts = await api.getWorkouts();
                // Map backend workouts to frontend format if needed
                // For now assuming simple display list
                // explicit sort to ensure latest first (by ID descending for same-day workouts)
                const sortedWorkouts = workouts.sort((a: any, b: any) => b.id - a.id);
                setRecentWorkoutsList(sortedWorkouts);
            } catch (err) {
                console.error("Failed to fetch workouts", err);
            }
        };
        fetchWorkouts();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getUserName = () => {
        if (userProfile?.name) {
            return userProfile.name.split(' ')[0]; // First name only
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'there';
    };

    const handleStartExercise = () => {
        setShowFeedbackModal(true);
    };

    const handleFeedbackSubmit = (feedback: WorkoutFeedback, recommendation: IntensityRec) => {
        setShowFeedbackModal(false);
        setIntensityRecommendation(recommendation);
    };

    const handleAcceptRecommendation = () => {
        setIntensityRecommendation(null);
        setCurrentView('selection');
    };

    const handleDismissRecommendation = () => {
        setIntensityRecommendation(null);
    };

    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setCurrentView('tracking');
    };

    const handleExerciseComplete = async (session: ExerciseSession) => {
        setCompletedSession(session);
        setCompletedSessions(prev => [...prev, session]);

        // Log to Backend
        try {
            await api.logWorkout({
                date: new Date().toISOString(),
                duration: Math.round(session.duration / 60), // Duration in minutes
                exercises: [{
                    name: session.exerciseId,
                    sets: session.sets,
                    reps: session.reps.reduce((acc, rep) => acc + rep, 0),
                    weight: 0 // Weight not currently tracked in ExerciseTracker
                }]
            });
            // Refresh list
            const workouts = await api.getWorkouts();
            setRecentWorkoutsList(workouts);
        } catch (err) {
            console.error("Failed to log workout", err);
            setError("Failed to save workout to history");
        }

        setCurrentView('summary');
    };

    const handleExerciseCancel = () => {
        setSelectedExercise(null);
        setCurrentView('selection');
    };

    const handleSummaryClose = () => {
        setCompletedSession(null);
        setSelectedExercise(null);
        setCurrentView('dashboard');
    };

    const handleStartNew = () => {
        setCompletedSession(null);
        setSelectedExercise(null);
        setShowFeedbackModal(true);
    };

    const handleViewWeeklyReport = () => {
        // Convert history (recentWorkoutsList) to ExerciseSession format for the report generator
        const allSessions: ExerciseSession[] = recentWorkoutsList.flatMap(workout => {
            if (!workout.exercises || workout.exercises.length === 0) return [];

            // Map each exercise within a workout to a "Session" for statistical analysis
            return workout.exercises.map((ex: any) => ({
                exerciseId: ex.name.toLowerCase().replace(/\s+/g, '-'),
                exerciseName: ex.name,
                sets: ex.sets || 1,
                reps: Array(ex.sets || 1).fill(Math.round((ex.reps || 0) / (ex.sets || 1))), // Distribute total reps across sets
                formIssues: [], // Historical form issues not currently saved in simplified DB schema
                startTime: new Date(workout.date),
                endTime: new Date(new Date(workout.date).getTime() + (workout.duration_minutes * 60 * 1000)),
                duration: (workout.duration_minutes * 60) / workout.exercises.length // Distribute duration strictly for stats
            }));
        });

        // Add currently completed sessions from this active window if not already in history
        // (Optional, but good for completeness if they haven't refreshed)

        const report = generateWeeklyReport(allSessions, {
            avgSleepHours: 7.5,
            avgStressLevel: 3,
            hydrationGoalsMet: 85,
            proteinIntake: 120,
        });
        setWeeklyReport(report);
        setShowWeeklyReport(true);
    };

    // Render different views
    if (currentView === 'selection') {
        return <ExerciseSelection onSelectExercise={handleSelectExercise} />;
    }

    if (currentView === 'tracking' && selectedExercise) {
        return (
            <ExerciseTracker
                exercise={selectedExercise}
                onComplete={handleExerciseComplete}
                onCancel={handleExerciseCancel}
            />
        );
    }

    if (currentView === 'summary' && completedSession) {
        return (
            <ExerciseSummary
                session={completedSession}
                onClose={handleSummaryClose}
                onStartNew={handleStartNew}
            />
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Fitness Tracker" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Welcome Message */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    {getGreeting()}, {getUserName()}! 💪
                                </h2>
                                <p className="text-slate-600 mt-1">Ready to crush your fitness goals today?</p>
                            </div>
                            <button
                                onClick={handleViewWeeklyReport}
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg font-semibold text-slate-700 hover:text-primary-700 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Weekly Report
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Meal Recommendation Hint */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between text-emerald-800 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <Utensils className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Finished your workout?</p>
                                    <p className="text-xs text-emerald-600">Get personalized post-workout meal suggestions on the Health Dashboard.</p>
                                </div>
                            </div>

                        </div>

                        {/* AI Form Correction Section - The Hero Feature */}
                        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 bg-primary-500 rounded text-[10px] font-bold uppercase tracking-wider">Beta Feature</div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">AI Form Correction</h2>
                                    <p className="text-slate-300 mb-6 max-w-lg">
                                        Use your device's camera to analyze your squat, deadlift, and yoga poses in real-time. Our computer vision model provides instant feedback on posture safety.
                                    </p>
                                    <button
                                        onClick={handleStartExercise}
                                        className="px-5 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                                    >
                                        Launch Session
                                    </button>
                                </div>
                                <div className="w-full md:w-1/2 lg:w-1/3">
                                    <PosePlaceholder />
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Activity Chart */}
                            <div className="lg:col-span-2">
                                <Card title="Weekly Activity" action={
                                    <select className="text-sm border-none bg-slate-100 rounded-md px-2 py-1 focus:ring-0">
                                        <option>Steps</option>
                                        <option>Calories</option>
                                    </select>
                                }>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyActivity}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="steps" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            {/* Recent Workouts */}
                            <div className="lg:col-span-1">
                                <Card title="Recent Workouts" className="h-full">
                                    {recentWorkoutsList.length > 0 ? (
                                        <div className="space-y-4 mt-2">
                                            {recentWorkoutsList.slice(0, 3).map((workout, index) => (
                                                <div
                                                    key={workout.id || index}
                                                    onClick={() => setSelectedHistoryWorkout(workout)}
                                                    className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group cursor-pointer"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                                                        <Trophy className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-800">Workout #{workout.id}</h4>
                                                        <p className="text-xs text-slate-500">{new Date(workout.date).toLocaleDateString()} • {workout.duration} min</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-2 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-100 hover:bg-primary-50 rounded-lg transition-colors">
                                                View History
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-center py-4">No recent workouts found.</p>
                                    )}
                                </Card>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Modals */}
            {showFeedbackModal && (
                <WorkoutFeedbackModal
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            {intensityRecommendation && (
                <IntensityRecommendation
                    recommendation={intensityRecommendation}
                    onAccept={handleAcceptRecommendation}
                    onDismiss={handleDismissRecommendation}
                />
            )}

            {showWeeklyReport && weeklyReport && (
                <WeeklyReportView
                    report={weeklyReport}
                    onClose={() => setShowWeeklyReport(false)}
                />
            )}

            {/* History Detail Modal */}
            {selectedHistoryWorkout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Workout Details</h3>
                                <p className="text-sm text-slate-500">
                                    {new Date(selectedHistoryWorkout.date).toLocaleDateString(undefined, {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedHistoryWorkout(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                    <div className="text-sm text-blue-600 font-medium mb-1">Duration</div>
                                    <div className="text-2xl font-bold text-blue-900">{selectedHistoryWorkout.duration_minutes} min</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                    <div className="text-sm text-purple-600 font-medium mb-1">Exercises</div>
                                    <div className="text-2xl font-bold text-purple-900">{selectedHistoryWorkout.exercises?.length || 0}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Exercise Log
                                </h4>
                                {selectedHistoryWorkout.exercises && selectedHistoryWorkout.exercises.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedHistoryWorkout.exercises.map((ex: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div>
                                                    <div className="font-semibold text-slate-800 capitalize">{ex.name.replace('-', ' ')}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {ex.sets} sets
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-slate-900">{ex.reps} total reps</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic text-center py-4">No exercises recorded details.</p>
                                )}
                            </div>

                            {selectedHistoryWorkout.notes && (
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
                                    <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                                        "{selectedHistoryWorkout.notes}"
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedHistoryWorkout(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardFitness;