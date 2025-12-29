import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Timer, Trophy, FileText, Activity } from 'lucide-react';
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
import { weeklyActivity, recentWorkouts } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
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

    // Store completed sessions (in real app, this would be in a database)
    const [completedSessions, setCompletedSessions] = useState<ExerciseSession[]>([]);

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

    const handleExerciseComplete = (session: ExerciseSession) => {
        setCompletedSession(session);
        setCompletedSessions(prev => [...prev, session]);
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
        // Generate report from completed sessions
        const report = generateWeeklyReport(completedSessions, {
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
                                    <div className="space-y-4 mt-2">
                                        {recentWorkouts.map((workout) => (
                                            <div key={workout.id} className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                                                    {workout.type === 'Cardio' ? <Flame className="w-6 h-6" /> : workout.type === 'Strength' ? <Trophy className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-800">{workout.title}</h4>
                                                    <p className="text-xs text-slate-500">{workout.date} • {workout.duration}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-sm font-bold text-slate-700">{workout.calories}</span>
                                                    <span className="text-xs text-slate-400">kcal</span>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="w-full py-2 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-100 hover:bg-primary-50 rounded-lg transition-colors">
                                            View History
                                        </button>
                                    </div>
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
        </div>
    );
};

export default DashboardFitness;