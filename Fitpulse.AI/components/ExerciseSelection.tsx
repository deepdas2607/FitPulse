import React, { useState } from 'react';
import { Exercise, BodyPart } from '../types';
import { exercises, bodyPartLabels, getExercisesByBodyPart } from '../data/exercises';
import { Dumbbell, Activity, Heart, Target, Zap } from 'lucide-react';

interface ExerciseSelectionProps {
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseSelection: React.FC<ExerciseSelectionProps> = ({ onSelectExercise }) => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);

  const bodyPartIcons: Record<BodyPart, React.ReactNode> = {
    'legs': <Activity className="w-5 h-5" />,
    'chest-shoulder-triceps': <Dumbbell className="w-5 h-5" />,
    'functional-abs': <Zap className="w-5 h-5" />,
    'back-biceps': <Target className="w-5 h-5" />,
    'cardio': <Heart className="w-5 h-5" />,
  };

  const bodyPartColors: Record<BodyPart, string> = {
    'legs': 'bg-blue-500',
    'chest-shoulder-triceps': 'bg-red-500',
    'functional-abs': 'bg-yellow-500',
    'back-biceps': 'bg-green-500',
    'cardio': 'bg-pink-500',
  };

  const bodyParts: BodyPart[] = ['legs', 'chest-shoulder-triceps', 'functional-abs', 'back-biceps', 'cardio'];

  const displayedExercises = selectedBodyPart 
    ? getExercisesByBodyPart(selectedBodyPart)
    : exercises;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Your Exercise</h1>
          <p className="text-slate-600">Choose a body part or browse all exercises</p>
        </div>

        {/* Body Part Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedBodyPart(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedBodyPart === null
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Exercises
          </button>
          {bodyParts.map((bodyPart) => (
            <button
              key={bodyPart}
              onClick={() => setSelectedBodyPart(bodyPart)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                selectedBodyPart === bodyPart
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {bodyPartIcons[bodyPart]}
              {bodyPartLabels[bodyPart]}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-primary-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg ${bodyPartColors[exercise.bodyPart]} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {bodyPartIcons[exercise.bodyPart]}
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {bodyPartLabels[exercise.bodyPart]}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                {exercise.name}
              </h3>
              {exercise.description && (
                <p className="text-sm text-slate-600 mb-4">{exercise.description}</p>
              )}
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm">
                Start Exercise
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelection;

