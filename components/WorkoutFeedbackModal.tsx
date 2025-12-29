import React, { useState } from 'react';
import { X, Activity, Brain, Bed, Zap, Heart } from 'lucide-react';
import { WorkoutFeedback, calculateIntensity, IntensityRecommendation } from '../utils/adaptiveWorkout';

interface WorkoutFeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: WorkoutFeedback, recommendation: IntensityRecommendation) => void;
}

const WorkoutFeedbackModal: React.FC<WorkoutFeedbackModalProps> = ({ onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState<WorkoutFeedback>({
    stressLevel: 3,
    fatigueLevel: 3,
    musclesoreness: 3,
    sleepQuality: 3,
    motivation: 3,
  });

  const handleSubmit = () => {
    const recommendation = calculateIntensity(feedback);
    onSubmit(feedback, recommendation);
  };

  const RatingSlider = ({
    label,
    icon: Icon,
    value,
    onChange,
    lowLabel,
    highLabel,
  }: {
    label: string;
    icon: React.ElementType;
    value: number;
    onChange: (value: number) => void;
    lowLabel: string;
    highLabel: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-600" />
        <label className="font-semibold text-slate-900">{label}</label>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{lowLabel}</span>
        <span className="font-bold text-primary-600">{value}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">How are you feeling?</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-600">
            Help us recommend the right workout intensity for you today
          </p>

          <RatingSlider
            label="Stress Level"
            icon={Brain}
            value={feedback.stressLevel}
            onChange={(v) => setFeedback({ ...feedback, stressLevel: v })}
            lowLabel="Very Low"
            highLabel="Very High"
          />

          <RatingSlider
            label="Fatigue Level"
            icon={Activity}
            value={feedback.fatigueLevel}
            onChange={(v) => setFeedback({ ...feedback, fatigueLevel: v })}
            lowLabel="Energized"
            highLabel="Exhausted"
          />

          <RatingSlider
            label="Muscle Soreness"
            icon={Heart}
            value={feedback.musclesoreness}
            onChange={(v) => setFeedback({ ...feedback, musclesoreness: v })}
            lowLabel="None"
            highLabel="Severe"
          />

          <RatingSlider
            label="Sleep Quality"
            icon={Bed}
            value={feedback.sleepQuality}
            onChange={(v) => setFeedback({ ...feedback, sleepQuality: v })}
            lowLabel="Very Poor"
            highLabel="Excellent"
          />

          <RatingSlider
            label="Motivation"
            icon={Zap}
            value={feedback.motivation}
            onChange={(v) => setFeedback({ ...feedback, motivation: v })}
            lowLabel="Very Low"
            highLabel="Very High"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors"
          >
            Get Recommendation
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFeedbackModal;
