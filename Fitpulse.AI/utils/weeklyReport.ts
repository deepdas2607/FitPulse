/**
 * Weekly Health & Fitness Report Generator
 */

import { ExerciseSession, FormIssue } from '../types';
import { WorkoutLog } from './adaptiveWorkout';

export interface WeeklyStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalReps: number;
  totalSets: number;
  avgFormScore: number;
  mostCommonIssues: Array<{ type: string; count: number }>;
  workoutsByDay: Record<string, number>;
  caloriesBurned: number;
  topExercises: Array<{ name: string; count: number }>;
}

export interface HealthMetrics {
  avgHeartRate?: number;
  avgSleepHours?: number;
  avgStressLevel?: number;
  hydrationGoalsMet?: number; // percentage
  caloriesConsumed?: number;
  proteinIntake?: number;
  stepsCount?: number;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  fitnessStats: WeeklyStats;
  healthMetrics: HealthMetrics;
  achievements: string[];
  improvements: string[];
  recommendations: string[];
  overallScore: number; // 0-100
}

/**
 * Generate weekly fitness statistics
 */
export const generateFitnessStats = (sessions: ExerciseSession[]): WeeklyStats => {
  const totalWorkouts = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / 60; // convert to minutes
  const totalReps = sessions.reduce((sum, s) => sum + s.reps.reduce((a, b) => a + b, 0), 0);
  const totalSets = sessions.reduce((sum, s) => sum + s.sets, 0);

  // Calculate average form score
  const formScores = sessions.map(session => {
    const totalIssues = session.formIssues.length;
    const highSeverity = session.formIssues.filter(i => i.severity === 'high').length;
    const mediumSeverity = session.formIssues.filter(i => i.severity === 'medium').length;
    
    let score = 100;
    score -= highSeverity * 15;
    score -= mediumSeverity * 8;
    score -= (totalIssues - highSeverity - mediumSeverity) * 3;
    return Math.max(0, Math.min(100, score));
  });

  const avgFormScore = formScores.length > 0
    ? formScores.reduce((a, b) => a + b, 0) / formScores.length
    : 0;

  // Find most common form issues
  const issueTypeCounts: Record<string, number> = {};
  sessions.forEach(session => {
    session.formIssues.forEach(issue => {
      issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
    });
  });

  const mostCommonIssues = Object.entries(issueTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Workouts by day
  const workoutsByDay: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };

  sessions.forEach(session => {
    const day = session.startTime.toLocaleDateString('en-US', { weekday: 'short' });
    workoutsByDay[day] = (workoutsByDay[day] || 0) + 1;
  });

  // Estimate calories burned (rough estimate: 5 cal per rep)
  const caloriesBurned = totalReps * 5;

  // Top exercises
  const exerciseCounts: Record<string, number> = {};
  sessions.forEach(session => {
    exerciseCounts[session.exerciseName] = (exerciseCounts[session.exerciseName] || 0) + 1;
  });

  const topExercises = Object.entries(exerciseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalWorkouts,
    totalDuration,
    totalReps,
    totalSets,
    avgFormScore,
    mostCommonIssues,
    workoutsByDay,
    caloriesBurned,
    topExercises,
  };
};

/**
 * Generate complete weekly report
 */
export const generateWeeklyReport = (
  sessions: ExerciseSession[],
  healthMetrics: HealthMetrics
): WeeklyReport => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  
  const weekEnd = new Date(now);

  const fitnessStats = generateFitnessStats(sessions);
  const achievements: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // Analyze achievements
  if (fitnessStats.totalWorkouts >= 5) {
    achievements.push('🏆 Completed 5+ workouts this week!');
  }
  if (fitnessStats.totalWorkouts >= 3) {
    achievements.push('💪 Maintained consistent workout routine');
  }
  if (fitnessStats.avgFormScore >= 85) {
    achievements.push('✨ Excellent form quality maintained');
  }
  if (fitnessStats.totalReps >= 200) {
    achievements.push('🔥 Completed 200+ reps this week');
  }
  if (healthMetrics.avgSleepHours && healthMetrics.avgSleepHours >= 7) {
    achievements.push('😴 Great sleep quality this week');
  }
  if (healthMetrics.hydrationGoalsMet && healthMetrics.hydrationGoalsMet >= 80) {
    achievements.push('💧 Stayed well hydrated');
  }

  // Identify improvements needed
  if (fitnessStats.totalWorkouts < 3) {
    improvements.push('Increase workout frequency to at least 3 times per week');
  }
  if (fitnessStats.avgFormScore < 70) {
    improvements.push('Focus on improving exercise form - consider lighter weights');
  }
  if (fitnessStats.mostCommonIssues.length > 0) {
    const topIssue = fitnessStats.mostCommonIssues[0];
    improvements.push(`Address ${topIssue.type} issues (occurred ${topIssue.count} times)`);
  }
  if (healthMetrics.avgSleepHours && healthMetrics.avgSleepHours < 7) {
    improvements.push('Aim for 7-9 hours of sleep for better recovery');
  }
  if (healthMetrics.avgStressLevel && healthMetrics.avgStressLevel >= 4) {
    improvements.push('High stress levels detected - consider stress management techniques');
  }

  // Generate recommendations
  if (fitnessStats.totalWorkouts >= 5) {
    recommendations.push('Consider adding a rest day to prevent overtraining');
  }
  
  const workoutDays = Object.values(fitnessStats.workoutsByDay).filter(count => count > 0).length;
  if (workoutDays < 3) {
    recommendations.push('Spread workouts across more days for better recovery');
  }

  if (fitnessStats.topExercises.length > 0) {
    const topExercise = fitnessStats.topExercises[0];
    recommendations.push(`You love ${topExercise.name}! Try adding variations for balanced development`);
  }

  if (healthMetrics.proteinIntake && healthMetrics.proteinIntake < 100) {
    recommendations.push('Increase protein intake to support muscle recovery (aim for 1.6g per kg body weight)');
  }

  // Calculate overall score
  let overallScore = 0;
  
  // Workout frequency (30 points)
  overallScore += Math.min(30, (fitnessStats.totalWorkouts / 5) * 30);
  
  // Form quality (25 points)
  overallScore += (fitnessStats.avgFormScore / 100) * 25;
  
  // Sleep quality (20 points)
  if (healthMetrics.avgSleepHours) {
    overallScore += Math.min(20, (healthMetrics.avgSleepHours / 8) * 20);
  }
  
  // Hydration (15 points)
  if (healthMetrics.hydrationGoalsMet) {
    overallScore += (healthMetrics.hydrationGoalsMet / 100) * 15;
  }
  
  // Stress management (10 points)
  if (healthMetrics.avgStressLevel) {
    overallScore += Math.max(0, 10 - (healthMetrics.avgStressLevel * 2));
  }

  overallScore = Math.round(Math.min(100, overallScore));

  return {
    weekStart,
    weekEnd,
    fitnessStats,
    healthMetrics,
    achievements,
    improvements,
    recommendations,
    overallScore,
  };
};

/**
 * Format report as readable text
 */
export const formatReportText = (report: WeeklyReport): string => {
  const dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  let text = `📊 WEEKLY REPORT\n`;
  text += `${dateFormat(report.weekStart)} - ${dateFormat(report.weekEnd)}\n\n`;
  
  text += `Overall Score: ${report.overallScore}/100\n\n`;
  
  text += `💪 FITNESS STATS\n`;
  text += `• Workouts: ${report.fitnessStats.totalWorkouts}\n`;
  text += `• Duration: ${Math.round(report.fitnessStats.totalDuration)} minutes\n`;
  text += `• Total Reps: ${report.fitnessStats.totalReps}\n`;
  text += `• Form Score: ${Math.round(report.fitnessStats.avgFormScore)}/100\n`;
  text += `• Calories Burned: ~${report.fitnessStats.caloriesBurned} kcal\n\n`;
  
  if (report.achievements.length > 0) {
    text += `🏆 ACHIEVEMENTS\n`;
    report.achievements.forEach(a => text += `${a}\n`);
    text += `\n`;
  }
  
  if (report.improvements.length > 0) {
    text += `📈 AREAS TO IMPROVE\n`;
    report.improvements.forEach(i => text += `• ${i}\n`);
    text += `\n`;
  }
  
  if (report.recommendations.length > 0) {
    text += `💡 RECOMMENDATIONS\n`;
    report.recommendations.forEach(r => text += `• ${r}\n`);
  }
  
  return text;
};
