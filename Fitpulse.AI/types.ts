export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Metric {
  label: string;
  value: string | number;
  unit: string;
  change: number; // percentage
  status: 'up' | 'down' | 'neutral';
}

export interface ActivityData {
  day: string;
  steps: number;
  calories: number;
  activeMinutes: number;
}

export interface NutritionData {
  name: string;
  value: number;
  color: string;
}

export interface Workout {
  id: string;
  title: string;
  duration: string;
  calories: number;
  type: string;
  date: string;
}

export type BodyPart = 'legs' | 'chest-shoulder-triceps' | 'functional-abs' | 'back-biceps' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  description?: string;
  icon?: string;
}

export interface ExerciseSession {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number[];
  formIssues: FormIssue[];
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

export interface FormIssue {
  timestamp: number; // when during the exercise this occurred
  type: 'posture' | 'range-of-motion' | 'speed' | 'alignment';
  severity: 'low' | 'medium' | 'high';
  message: string;
  tip: string;
}

export interface ExerciseSummary {
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  duration: number;
  formScore: number; // 0-100
  issues: FormIssue[];
  tips: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface BodyMetrics {
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number; // calculated
  bodyFat?: number; // percentage
  muscleMass?: number; // in kg
  waistCircumference?: number; // in cm
  dateUpdated?: string;
}

export interface HealthInfo {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  allergies?: string[];
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
  pastOperations?: Array<{
    name: string;
    date?: string;
    notes?: string;
  }>;
  medicalConditions?: string[];
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  fitnessGoals?: string[];
  injuries?: Array<{
    description: string;
    date?: string;
    recovered?: boolean;
  }>;
  dietaryRestrictions?: string[];
  doctorName?: string;
  doctorContact?: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  emergencyContact?: EmergencyContact;
  bodyMetrics?: BodyMetrics;
  healthInfo?: HealthInfo;
}
