import { Exercise, BodyPart } from '../types';

export const exercises: Exercise[] = [
  // Legs
  { id: 'squats', name: 'Squats', bodyPart: 'legs', description: 'Lower body strength exercise' },
  { id: 'lunges', name: 'Lunges', bodyPart: 'legs', description: 'Single leg strength exercise' },
  { id: 'leg-presses', name: 'Leg Presses', bodyPart: 'legs', description: 'Machine-based leg exercise' },
  { id: 'leg-curls', name: 'Leg Curls', bodyPart: 'legs', description: 'Hamstring isolation exercise' },
  { id: 'leg-extensions', name: 'Leg Extensions', bodyPart: 'legs', description: 'Quadriceps isolation exercise' },
  { id: 'calf-raises', name: 'Calf Raises', bodyPart: 'legs', description: 'Calf muscle exercise' },
  
  // Chest, Shoulder, Triceps
  { id: 'flat-dumbbell-press', name: 'Flat Dumbbell Press', bodyPart: 'chest-shoulder-triceps', description: 'Chest and triceps exercise' },
  { id: 'pec-dec-fly', name: 'Pec Dec Fly', bodyPart: 'chest-shoulder-triceps', description: 'Chest isolation exercise' },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', bodyPart: 'chest-shoulder-triceps', description: 'Upper chest exercise' },
  { id: 'overhead-shoulder-press', name: 'Overhead Shoulder Press', bodyPart: 'chest-shoulder-triceps', description: 'Shoulder strength exercise' },
  { id: 'lateral-raises', name: 'Lateral Raises', bodyPart: 'chest-shoulder-triceps', description: 'Shoulder isolation exercise' },
  { id: 'shrugs', name: 'Shrugs', bodyPart: 'chest-shoulder-triceps', description: 'Trap muscle exercise' },
  { id: 'tricep-pushdowns', name: 'Tricep Pushdowns', bodyPart: 'chest-shoulder-triceps', description: 'Tricep isolation exercise' },
  
  // Functional + Abs
  { id: 'kneeup-running', name: 'Knee Up Running', bodyPart: 'functional-abs', description: 'Cardio and core exercise' },
  { id: 'mountain-climbers', name: 'Mountain Climbers', bodyPart: 'functional-abs', description: 'Full body cardio exercise' },
  { id: 'battle-rope', name: 'Battle Rope', bodyPart: 'functional-abs', description: 'High intensity exercise' },
  { id: 'jumping-squats', name: 'Jumping Squats', bodyPart: 'functional-abs', description: 'Plyometric leg exercise' },
  { id: 'kettle-bell', name: 'Kettle Bell Swings', bodyPart: 'functional-abs', description: 'Functional strength exercise' },
  { id: 'steppers', name: 'Steppers', bodyPart: 'functional-abs', description: 'Cardio and leg exercise' },
  { id: 'crunches', name: 'Crunches', bodyPart: 'functional-abs', description: 'Abdominal exercise' },
  
  // Back and Biceps
  { id: 'lat-pull-down', name: 'Lat Pull Down', bodyPart: 'back-biceps', description: 'Back width exercise' },
  { id: 'seated-row', name: 'Seated Row', bodyPart: 'back-biceps', description: 'Back thickness exercise' },
  { id: 'close-grip-pull-down', name: 'Close Grip Pull Down', bodyPart: 'back-biceps', description: 'Back and bicep exercise' },
  { id: 'dumbbell-pullover', name: 'Dumbbell Pullover', bodyPart: 'back-biceps', description: 'Back and chest exercise' },
  { id: 'bicep-curl', name: 'Bicep Curl', bodyPart: 'back-biceps', description: 'Bicep isolation exercise' },
  { id: 'hammer-curl', name: 'Hammer Curl', bodyPart: 'back-biceps', description: 'Bicep and forearm exercise' },
  
  // Cardio
  { id: 'running', name: 'Running', bodyPart: 'cardio', description: 'Cardiovascular exercise' },
  { id: 'cycling', name: 'Cycling', bodyPart: 'cardio', description: 'Low impact cardio exercise' },
];

export const bodyPartLabels: Record<BodyPart, string> = {
  'legs': 'Legs',
  'chest-shoulder-triceps': 'Chest, Shoulder & Triceps',
  'functional-abs': 'Functional + Abs',
  'back-biceps': 'Back & Biceps',
  'cardio': 'Cardio',
};

export const getExercisesByBodyPart = (bodyPart: BodyPart): Exercise[] => {
  return exercises.filter(ex => ex.bodyPart === bodyPart);
};

