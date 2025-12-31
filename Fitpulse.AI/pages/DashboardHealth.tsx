import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Scale, Activity, Target, ArrowUp, CheckCircle2, Camera, Bell, Stethoscope, Ruler, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import OCRPlaceholder from '../components/Placeholder/OCRPlaceholder';
import FoodScanner from '../components/FoodScanner';
import HabitManager from '../components/HabitManager';
import SmartMealGenerator from '../components/SmartMealGenerator';
import { sleepData, nutritionBreakdown } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { DietaryGoals } from '../utils/ocrScanner';

const DashboardHealth: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFoodScanner, setShowFoodScanner] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const { userProfile, user, refreshProfile } = useAuth();

  React.useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Example dietary goals - could be loaded from user profile
  const dietaryGoals: DietaryGoals = {
    maxCalories: 500,
    minProtein: 15,
    maxCarbs: 50,
    maxSugar: 10,
    maxSodium: 500,
    dietType: 'balanced',
  };



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
        <Header title="Health Overview" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Welcome Message */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {getGreeting()}, {getUserName()}! 👋
                </h2>
                <p className="text-slate-600 mt-1">Here's your health overview for today</p>
              </div>
              <div className="flex gap-2">
                {userProfile?.healthInfo?.doctorContact && (
                  <a
                    href={`tel:${userProfile.healthInfo.doctorContact}`}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call Doctor
                  </a>
                )}
                <button
                  onClick={() => setShowHabitManager(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg font-semibold text-slate-700 hover:text-primary-700 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  Habits
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weight Card */}
              <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Scale className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Weight</p>
                  <h4 className="text-2xl font-bold text-slate-900 mt-1">
                    {userProfile?.bodyMetrics?.weight || '--'} <span className="text-sm font-normal text-slate-400">kg</span>
                  </h4>
                </div>
              </Card>

              {/* BMI Card */}
              <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${!userProfile?.bodyMetrics?.bmi ? 'bg-slate-50 text-slate-600' :
                    userProfile.bodyMetrics.bmi < 18.5 ? 'bg-blue-50 text-blue-600' :
                      userProfile.bodyMetrics.bmi < 25 ? 'bg-green-50 text-green-600' :
                        'bg-orange-50 text-orange-600'
                    }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">BMI</p>
                  <h4 className="text-2xl font-bold text-slate-900 mt-1">
                    {userProfile?.bodyMetrics?.bmi || '--'}
                  </h4>
                </div>
              </Card>

              {/* Height Card (Replacing Body Fat) */}
              <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Ruler className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Height</p>
                  <h4 className="text-2xl font-bold text-slate-900 mt-1">
                    {userProfile?.bodyMetrics?.height || '--'} <span className="text-sm font-normal text-slate-400">cm</span>
                  </h4>
                </div>
              </Card>

              {/* Activity Level Card */}
              <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <ArrowUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Activity Level</p>
                  <h4 className="text-lg font-bold text-slate-900 mt-1 capitalize">
                    {userProfile?.healthInfo?.activityLevel?.replace(/-/g, ' ') || '--'}
                  </h4>
                </div>
              </Card>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Tools */}
              <div className="space-y-6 lg:col-span-1">
                <Card title="Nutrition Scanner">
                  <p className="text-sm text-slate-500 mb-4">Point your camera at food labels to instantly log macros.</p>
                  <button
                    onClick={() => setShowFoodScanner(true)}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Scan Food Label
                  </button>
                </Card>

                <Card title="AI Health Check">
                  <p className="text-sm text-slate-500 mb-4">Analyze your symptoms with our AI-powered disease predictor.</p>
                  <Link
                    to="/dashboard/disease-predictor"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Stethoscope className="w-5 h-5" />
                    Check Symptoms
                  </Link>
                </Card>

              </div>

              {/* Right Column: AI Meal Generator (Wider) */}
              <div className="lg:col-span-2">
                <Card title="Smart Meal Suggestions" className="h-full">
                  <SmartMealGenerator />
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Main Chart Area */}
              <div className="lg:col-span-2 space-y-6">
                <Card title="Sleep Quality Trend">
                  <div className="h-48 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Nutrition Side Panel */}
              <div className="lg:col-span-1 space-y-6">
                <Card title="Daily Macros">
                  <div className="h-48 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={nutritionBreakdown} layout="vertical" barSize={20}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {nutritionBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-0.5 flex justify-between text-xs text-slate-500 px-2">
                      <span>138g Protein</span>
                      <span>250g Carbs</span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Food Scanner Modal */}
      {showFoodScanner && (
        <FoodScanner
          onClose={() => setShowFoodScanner(false)}
          dietaryGoals={dietaryGoals}
        />
      )}

      {/* Habit Manager Modal */}
      {showHabitManager && (
        <HabitManager onClose={() => setShowHabitManager(false)} />
      )}
    </div>
  );
};

export default DashboardHealth;