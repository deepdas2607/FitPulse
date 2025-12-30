import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Utensils, RefreshCw, ChefHat, Loader2 } from 'lucide-react';

const SmartMealGenerator: React.FC = () => {
    const { userProfile } = useAuth();
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false); // Renamed from isLoading
    const [error, setError] = useState<string | null>(null); // Changed type to string | null

    // Input states
    const [workoutInput, setWorkoutInput] = useState('');
    const [cravingsInput, setCravingsInput] = useState('');

    const handleGenerate = async () => { // Renamed from generateMeal
        setLoading(true);
        setError(null); // Reset error
        setRecommendation(null); // Reset recommendation
        try {
            // Use user preferences if available
            // const preferences = userProfile?.healthInfo?.dietaryRestrictions?.join(', ') || 'balanced diet';
            const result = await api.getRecommendations({ // Pass inputs to API
                workoutInfo: workoutInput,
                dietaryRestrictions: cravingsInput
            });
            // Assuming result is { recommendation: "..." } or similar
            // Adjust based on actual API response structure
            setRecommendation(result.recommendation || JSON.stringify(result));
        } catch (err: any) { // Catch specific error type
            console.error("Failed to generate meal", err);
            setError("Failed to generate meal suggestion. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-500">
                    Get a personalized meal tailored to your profile, recent workout, and cravings.
                </p>

                {/* Inputs */}
                {!recommendation && ( // Only show inputs if no recommendation is displayed
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Recent Workout (Optional)</label>
                            <textarea
                                className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                rows={2}
                                placeholder="e.g. 5k run, Heavy Leg Day..."
                                value={workoutInput}
                                onChange={(e) => setWorkoutInput(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Cravings / Requirements (Optional)</label>
                            <textarea
                                className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                rows={2}
                                placeholder="e.g. Vegetarian, High Carb, Spicy..."
                                value={cravingsInput}
                                onChange={(e) => setCravingsInput(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Recommendation Display */}
                {recommendation && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                                    Chef's Recommendation
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                </h4>
                                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {recommendation}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3 mt-10 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
                    ${loading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-100 hover:shadow-indigo-200'
                    }`}
            >
                {loading ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Consulting AI Chef...
                    </>
                ) : recommendation ? (
                    <>
                        <RefreshCw className="w-5 h-5" />
                        Generate Another
                    </>
                ) : (
                    <>
                        <Utensils className="w-5 h-5" />
                        Generate Meal Plan
                    </>
                )}
            </button>
        </div>
    );

};

export default SmartMealGenerator;
