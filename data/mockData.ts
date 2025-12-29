import { Metric, ActivityData, NutritionData, Workout } from '../types';

export const healthMetrics: Metric[] = [
  { label: 'Heart Rate', value: 72, unit: 'bpm', change: -2.5, status: 'down' },
  { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', change: 0, status: 'neutral' },
  { label: 'Sleep Score', value: 85, unit: '/100', change: 12, status: 'up' },
  { label: 'Hydration', value: 1.8, unit: 'L', change: -5, status: 'down' },
];

export const weeklyActivity: ActivityData[] = [
  { day: 'Mon', steps: 6500, calories: 2100, activeMinutes: 45 },
  { day: 'Tue', steps: 8200, calories: 2400, activeMinutes: 60 },
  { day: 'Wed', steps: 10500, calories: 2800, activeMinutes: 90 },
  { day: 'Thu', steps: 7800, calories: 2200, activeMinutes: 50 },
  { day: 'Fri', steps: 5400, calories: 2000, activeMinutes: 30 },
  { day: 'Sat', steps: 12000, calories: 3100, activeMinutes: 120 },
  { day: 'Sun', steps: 9000, calories: 2600, activeMinutes: 75 },
];

export const nutritionBreakdown: NutritionData[] = [
  { name: 'Protein', value: 140, color: '#14b8a6' }, // Teal
  { name: 'Carbs', value: 220, color: '#f97316' }, // Orange
  { name: 'Fats', value: 70, color: '#fbbf24' },   // Amber
];

export const recentWorkouts: Workout[] = [
  { id: '1', title: 'Morning HIIT', duration: '35 min', calories: 420, type: 'Cardio', date: 'Today, 8:00 AM' },
  { id: '2', title: 'Upper Body Power', duration: '50 min', calories: 310, type: 'Strength', date: 'Yesterday, 6:30 PM' },
  { id: '3', title: 'Yoga Flow', duration: '20 min', calories: 120, type: 'Flexibility', date: 'Oct 24, 7:00 AM' },
];

export const sleepData = [
    { name: 'Mon', hours: 6.5 },
    { name: 'Tue', hours: 7.2 },
    { name: 'Wed', hours: 5.8 },
    { name: 'Thu', hours: 8.0 },
    { name: 'Fri', hours: 7.5 },
    { name: 'Sat', hours: 9.0 },
    { name: 'Sun', hours: 8.2 },
];
