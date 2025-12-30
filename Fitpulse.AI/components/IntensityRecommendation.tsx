import React from 'react';
import { IntensityRecommendation as IntensityRec } from '../utils/adaptiveWorkout';
import { Activity, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface IntensityRecommendationProps {
  recommendation: IntensityRec;
  onAccept: () => void;
  onDismiss: () => void;
}

const IntensityRecommendation: React.FC<IntensityRecommendationProps> = ({
  recommendation,
  onAccept,
  onDismiss,
}) => {
  const getLevelColor = () => {
    switch (recommendation.level) {
      case 'rest': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'light': return 'bg-green-50 border-green-200 text-green-900';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'intense': return 'bg-red-50 border-red-200 text-red-900';
    }
  };

  const getLevelIcon = () => {
    switch (recommendation.level) {
      case 'rest': return <AlertCircle className="w-8 h-8" />;
      case 'light': return <Activity className="w-8 h-8" />;
      case 'moderate': return <CheckCircle2 className="w-8 h-8" />;
      case 'intense': return <Zap className="w-8 h-8" />;
    }
  };

  const getLevelLabel = () => {
    switch (recommendation.level) {
      case 'rest': return 'Rest Day';
      case 'light': return 'Light Activity';
      case 'moderate': return 'Moderate Intensity';
      case 'intense': return 'High Intensity';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className={`p-6 rounded-t-2xl border-2 ${getLevelColor()}`}>
          <div className="flex items-center gap-4 mb-3">
            {getLevelIcon()}
            <div>
              <h2 className="text-2xl font-bold">{getLevelLabel()}</h2>
              <p className="text-sm opacity-80">Recommended Intensity: {recommendation.percentage}%</p>
            </div>
          </div>
          <p className="text-base">{recommendation.reason}</p>
        </div>

        <div className="p-6 space-y-4">
          {recommendation.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Suggestions:</h3>
              <ul className="space-y-2">
                {recommendation.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-primary-600 font-bold mt-1">•</span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.shouldRest && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 font-medium">
                ⚠️ Your body needs recovery. Consider taking a rest day or doing light stretching only.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onAccept}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
            >
              {recommendation.shouldRest ? 'Take Rest Day' : 'Start Workout'}
            </button>
            <button
              onClick={onDismiss}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntensityRecommendation;
