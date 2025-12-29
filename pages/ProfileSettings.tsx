import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import { 
  User, Ruler, Scale, Heart, Pill, AlertTriangle, Phone, 
  Calendar, Activity, Target, Save, Plus, X, CheckCircle2 
} from 'lucide-react';
import { BodyMetrics, HealthInfo, EmergencyContact } from '../types';

const ProfileSettings: React.FC = () => {
  const { userProfile, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({
    height: userProfile?.bodyMetrics?.height || undefined,
    weight: userProfile?.bodyMetrics?.weight || undefined,
    bodyFat: userProfile?.bodyMetrics?.bodyFat || undefined,
    muscleMass: userProfile?.bodyMetrics?.muscleMass || undefined,
    waistCircumference: userProfile?.bodyMetrics?.waistCircumference || undefined,
  });

  const [healthInfo, setHealthInfo] = useState<HealthInfo>({
    dateOfBirth: userProfile?.healthInfo?.dateOfBirth || '',
    gender: userProfile?.healthInfo?.gender || undefined,
    bloodType: userProfile?.healthInfo?.bloodType || undefined,
    allergies: userProfile?.healthInfo?.allergies || [],
    medications: userProfile?.healthInfo?.medications || [],
    pastOperations: userProfile?.healthInfo?.pastOperations || [],
    medicalConditions: userProfile?.healthInfo?.medicalConditions || [],
    activityLevel: userProfile?.healthInfo?.activityLevel || undefined,
    fitnessGoals: userProfile?.healthInfo?.fitnessGoals || [],
    injuries: userProfile?.healthInfo?.injuries || [],
    dietaryRestrictions: userProfile?.healthInfo?.dietaryRestrictions || [],
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: userProfile?.emergencyContact?.name || '',
    phone: userProfile?.emergencyContact?.phone || '',
    relationship: userProfile?.emergencyContact?.relationship || '',
  });

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
      const updatedBodyMetrics = {
        ...bodyMetrics,
        dateUpdated: new Date().toISOString(),
      };

      await updateUserProfile(user.uid, {
        bodyMetrics: updatedBodyMetrics,
        healthInfo,
        emergencyContact: emergencyContact.name && emergencyContact.phone ? emergencyContact : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    value={bodyMetrics.bodyFat || ''}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, bodyFat: parseFloat(e.target.value) || undefined })}
                    placeholder="15"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Muscle Mass (kg)
                  </label>
                  <input
                    type="number"
                    value={bodyMetrics.muscleMass || ''}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, muscleMass: parseFloat(e.target.value) || undefined })}
                    placeholder="55"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Waist Circumference (cm)
                  </label>
                  <input
                    type="number"
                    value={bodyMetrics.waistCircumference || ''}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, waistCircumference: parseFloat(e.target.value) || undefined })}
                    placeholder="80"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
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
                      Blood Type
                    </label>
                    <select
                      value={healthInfo.bloodType || ''}
                      onChange={(e) => setHealthInfo({ ...healthInfo, bloodType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="unknown">Unknown</option>
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

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Allergies
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newAllergy.trim()) {
                          e.preventDefault();
                          setHealthInfo({ ...healthInfo, allergies: [...(healthInfo.allergies || []), newAllergy.trim()] });
                          setNewAllergy('');
                        }
                      }}
                      placeholder="Add allergy (e.g., Peanuts)"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAllergy.trim()) {
                          setHealthInfo({ ...healthInfo, allergies: [...(healthInfo.allergies || []), newAllergy.trim()] });
                          setNewAllergy('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthInfo.allergies?.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">
                        {allergy}
                        <button
                          onClick={() => {
                            setHealthInfo({ ...healthInfo, allergies: healthInfo.allergies?.filter((_, i) => i !== idx) });
                          }}
                          className="hover:text-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Medical Conditions
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newCondition.trim()) {
                          e.preventDefault();
                          setHealthInfo({ ...healthInfo, medicalConditions: [...(healthInfo.medicalConditions || []), newCondition.trim()] });
                          setNewCondition('');
                        }
                      }}
                      placeholder="Add condition (e.g., Diabetes)"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCondition.trim()) {
                          setHealthInfo({ ...healthInfo, medicalConditions: [...(healthInfo.medicalConditions || []), newCondition.trim()] });
                          setNewCondition('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthInfo.medicalConditions?.map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2">
                        {condition}
                        <button
                          onClick={() => {
                            setHealthInfo({ ...healthInfo, medicalConditions: healthInfo.medicalConditions?.filter((_, i) => i !== idx) });
                          }}
                          className="hover:text-orange-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Medications
                  </label>
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                        placeholder="Medication name"
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        placeholder="Dosage"
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMedication.frequency}
                          onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                          placeholder="Frequency"
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newMedication.name.trim()) {
                              setHealthInfo({ ...healthInfo, medications: [...(healthInfo.medications || []), { ...newMedication }] });
                              setNewMedication({ name: '', dosage: '', frequency: '' });
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {healthInfo.medications?.map((med, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{med.name}</span>
                          {med.dosage && <span className="text-sm text-slate-600 ml-2">({med.dosage})</span>}
                          {med.frequency && <span className="text-sm text-slate-600 ml-2">- {med.frequency}</span>}
                        </div>
                        <button
                          onClick={() => {
                            setHealthInfo({ ...healthInfo, medications: healthInfo.medications?.filter((_, i) => i !== idx) });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Operations */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Past Operations
                  </label>
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newOperation.name}
                        onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                        placeholder="Operation name"
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={newOperation.date}
                        onChange={(e) => setNewOperation({ ...newOperation, date: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOperation.notes}
                          onChange={(e) => setNewOperation({ ...newOperation, notes: e.target.value })}
                          placeholder="Notes"
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newOperation.name.trim()) {
                              setHealthInfo({ ...healthInfo, pastOperations: [...(healthInfo.pastOperations || []), { ...newOperation }] });
                              setNewOperation({ name: '', date: '', notes: '' });
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {healthInfo.pastOperations?.map((op, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{op.name}</span>
                          <button
                            onClick={() => {
                              setHealthInfo({ ...healthInfo, pastOperations: healthInfo.pastOperations?.filter((_, i) => i !== idx) });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {op.date && <p className="text-sm text-slate-600">Date: {op.date}</p>}
                        {op.notes && <p className="text-sm text-slate-600">Notes: {op.notes}</p>}
                      </div>
                    ))}
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

            {/* Emergency Contact Section */}
            <Card title="Emergency Contact" icon={<Phone className="w-5 h-5" />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Relationship (Optional)
                  </label>
                  <input
                    type="text"
                    value={emergencyContact.relationship || ''}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                    placeholder="Spouse, Parent, Friend, etc."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  This contact will be called automatically if you say "Help" or "Emergency" during a workout.
                </p>
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

