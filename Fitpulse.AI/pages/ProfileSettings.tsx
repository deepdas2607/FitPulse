import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import {
  User, Ruler, Scale, Heart, Pill, AlertTriangle, Phone,
  Calendar, Activity, Target, Save, Plus, X, CheckCircle2
} from 'lucide-react';
import { BodyMetrics, HealthInfo, EmergencyContact } from '../types';

const ProfileSettings: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({});
  const [healthInfo, setHealthInfo] = useState<HealthInfo>({
    allergies: [],
    medications: [],
    pastOperations: [],
    medicalConditions: [],
    fitnessGoals: [],
    injuries: [],

    dietaryRestrictions: [],
    doctorName: '',
    doctorContact: '',
  });
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relationship: '',
  });

  // Load Profile from Backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await api.getProfile();
        if (profile) {
          setBodyMetrics({
            height: profile.height ? Number(profile.height) : undefined,
            weight: profile.weight ? Number(profile.weight) : undefined,
            // Calculate other derived metrics if needed or leave empty
          });
          setHealthInfo(prev => ({
            ...prev,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activity_level,
            fitnessGoals: profile.goals ? profile.goals.split(', ') : [],
            dietaryRestrictions: profile.dietary_preferences ? profile.dietary_preferences.split(', ') : [],
            doctorName: profile.doctor_name || '',
            doctorContact: profile.doctor_contact || '',
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  // Calculate BMI
  const calculateBMI = (height: number, weight: number): number => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  useEffect(() => {
    if (bodyMetrics.height && bodyMetrics.weight) {
      const bmi = calculateBMI(bodyMetrics.height, bodyMetrics.weight);
      setBodyMetrics(prev => ({ ...prev, bmi }));
    }
  }, [bodyMetrics.height, bodyMetrics.weight]);

  // Temporary input states for dynamic lists
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newOperation, setNewOperation] = useState({ name: '', date: '', notes: '' });
  const [newCondition, setNewCondition] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newInjury, setNewInjury] = useState({ description: '', date: '', recovered: false });
  const [newRestriction, setNewRestriction] = useState('');

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save profile');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Map frontend state to backend expected format
      const profileData = {
        age: healthInfo.dateOfBirth ? new Date().getFullYear() - new Date(healthInfo.dateOfBirth).getFullYear() : undefined, // Approximation or add Date of Birth to backend
        gender: healthInfo.gender,
        weight: bodyMetrics.weight,
        height: bodyMetrics.height,
        activity_level: healthInfo.activityLevel,
        goals: healthInfo.fitnessGoals?.join(', '),
        dietary_preferences: healthInfo.dietaryRestrictions?.join(', '),
        doctor_name: healthInfo.doctorName,
        doctor_contact: healthInfo.doctorContact,
      };

      await api.updateProfile(profileData);
      await refreshProfile(); // Update global context

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err?.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
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
        <Header title="Profile Settings" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-semibold">Profile saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Body Metrics Section */}
            <Card title="Body Metrics" icon={<Scale className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={bodyMetrics.height || ''}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, height: parseFloat(e.target.value) || undefined })}
                    placeholder="175"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={bodyMetrics.weight || ''}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, weight: parseFloat(e.target.value) || undefined })}
                    placeholder="70"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {bodyMetrics.bmi && bodyMetrics.bmi > 0 && (
                  <div className="md:col-span-2 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">BMI</span>
                      <span className={`text-2xl font-bold ${getBMICategory(bodyMetrics.bmi).color}`}>
                        {bodyMetrics.bmi} - {getBMICategory(bodyMetrics.bmi).label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Health Information Section */}
            <Card title="Health Information" icon={<Heart className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={healthInfo.dateOfBirth || ''}
                      onChange={(e) => setHealthInfo({ ...healthInfo, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={healthInfo.gender || ''}
                      onChange={(e) => setHealthInfo({ ...healthInfo, gender: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Activity Level
                    </label>
                    <select
                      value={healthInfo.activityLevel || ''}
                      onChange={(e) => setHealthInfo({ ...healthInfo, activityLevel: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="lightly-active">Lightly Active</option>
                      <option value="moderately-active">Moderately Active</option>
                      <option value="very-active">Very Active</option>
                      <option value="extremely-active">Extremely Active</option>
                    </select>
                  </div>
                </div>

                {/* Fitness Goals */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fitness Goals
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          e.preventDefault();
                          setHealthInfo({ ...healthInfo, fitnessGoals: [...(healthInfo.fitnessGoals || []), newGoal.trim()] });
                          setNewGoal('');
                        }
                      }}
                      placeholder="Add goal (e.g., Lose 10kg)"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newGoal.trim()) {
                          setHealthInfo({ ...healthInfo, fitnessGoals: [...(healthInfo.fitnessGoals || []), newGoal.trim()] });
                          setNewGoal('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthInfo.fitnessGoals?.map((goal, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                        {goal}
                        <button
                          onClick={() => {
                            setHealthInfo({ ...healthInfo, fitnessGoals: healthInfo.fitnessGoals?.filter((_, i) => i !== idx) });
                          }}
                          className="hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRestriction}
                      onChange={(e) => setNewRestriction(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newRestriction.trim()) {
                          e.preventDefault();
                          setHealthInfo({ ...healthInfo, dietaryRestrictions: [...(healthInfo.dietaryRestrictions || []), newRestriction.trim()] });
                          setNewRestriction('');
                        }
                      }}
                      placeholder="Add restriction (e.g., Vegetarian)"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newRestriction.trim()) {
                          setHealthInfo({ ...healthInfo, dietaryRestrictions: [...(healthInfo.dietaryRestrictions || []), newRestriction.trim()] });
                          setNewRestriction('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthInfo.dietaryRestrictions?.map((restriction, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-2">
                        {restriction}
                        <button
                          onClick={() => {
                            setHealthInfo({ ...healthInfo, dietaryRestrictions: healthInfo.dietaryRestrictions?.filter((_, i) => i !== idx) });
                          }}
                          className="hover:text-yellow-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Medical Professional Contact */}
            <Card title="Primary Care / Doctor" icon={<Phone className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Doctor's Name
                  </label>
                  <input
                    type="text"
                    value={healthInfo.doctorName || ''}
                    onChange={(e) => setHealthInfo({ ...healthInfo, doctorName: e.target.value })}
                    placeholder="Dr. Smith"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={healthInfo.doctorContact || ''}
                    onChange={(e) => setHealthInfo({ ...healthInfo, doctorContact: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;

