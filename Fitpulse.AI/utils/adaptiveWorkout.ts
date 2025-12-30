/**
 * Adaptive Workout Intensity System
 * Adjusts workout difficulty based on user feedback and performance
 */

export interface WorkoutFeedback {
  stressLevel: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  fatigueLevel: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  musclesoreness: 1 | 2 | 3 | 4 | 5; // 1 = none, 5 = severe
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1 = very poor, 5 = excellent
  motivation: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  lastWorkoutDate?: Date;
}

export interface IntensityRecommendation {
  level: 'rest' | 'light' | 'moderate' | 'intense';
  percentage: number; // 0-100, percentage of max intensity
  reason: string;
  suggestions: string[];
  shouldRest: boolean;
}

/**
 * Calculate recommended workout intensity based on user feedback
 */
export const calculateIntensity = (feedback: WorkoutFeedback): IntensityRecommendation => {
  let intensityScore = 100;
  const suggestions: string[] = [];
  let shouldRest = false;

  // Stress impact (high stress = lower intensity)
  if (feedback.stressLevel >= 4) {
    intensityScore -= 30;
    suggestions.push('High stress detected. Consider yoga or light cardio instead.');
  } else if (feedback.stressLevel === 3) {
    intensityScore -= 15;
  }

  // Fatigue impact
  if (feedback.fatigueLevel >= 4) {
    intensityScore -= 35;
    suggestions.push('You seem very fatigued. Rest or active recovery recommended.');
    shouldRest = true;
  } else if (feedback.fatigueLevel === 3) {
    intensityScore -= 20;
  }

  // Muscle soreness impact
  if (feedback.musclesoreness >= 4) {
    intensityScore -= 30;
    suggestions.push('Severe muscle soreness. Focus on different muscle groups or rest.');
    shouldRest = true;
  } else if (feedback.musclesoreness === 3) {
    intensityScore -= 15;
    suggestions.push('Moderate soreness. Consider lighter weights or active recovery.');
  }

  // Sleep quality impact
  if (feedback.sleepQuality <= 2) {
    intensityScore -= 25;
    suggestions.push('Poor sleep quality. Your body needs rest to recover properly.');
  } else if (feedback.sleepQuality === 3) {
    intensityScore -= 10;
  }

  // Motivation boost
  if (feedback.motivation >= 4) {
    intensityScore += 10;
  } else if (feedback.motivation <= 2) {
    intensityScore -= 10;
    suggestions.push('Low motivation today. Start with something you enjoy!');
  }

  // Check rest days
  if (feedback.lastWorkoutDate) {
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - feedback.lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastWorkout === 0) {
      intensityScore -= 20;
      suggestions.push('You worked out today already. Consider rest or light activity.');
    } else if (daysSinceLastWorkout >= 3) {
      suggestions.push('Welcome back! Start with moderate intensity to ease back in.');
      intensityScore = Math.min(intensityScore, 70);
    }
  }

  // Clamp score
  intensityScore = Math.max(0, Math.min(100, intensityScore));

  // Determine level and reason
  let level: IntensityRecommendation['level'];
  let reason: string;

  if (shouldRest || intensityScore < 30) {
    level = 'rest';
    reason = 'Your body needs recovery. Rest is crucial for progress.';
  } else if (intensityScore < 50) {
    level = 'light';
    reason = 'Light activity recommended. Focus on mobility and recovery.';
  } else if (intensityScore < 75) {
    level = 'moderate';
    reason = 'Moderate intensity is ideal for today. Listen to your body.';
  } else {
    level = 'intense';
    reason = "You're ready for a challenging workout! Push your limits safely.";
  }

  if (suggestions.length === 0) {
    suggestions.push('Stay hydrated and maintain proper form throughout your workout.');
  }

  return {
    level,
    percentage: intensityScore,
    reason,
    suggestions,
    shouldRest,
  };
};

/**
 * Detect overtraining based on workout history
 */
export interface WorkoutLog {
  date: Date;
  duration: number; // minutes
  intensity: 'light' | 'moderate' | 'intense';
  muscleGroups: string[];
  formIssues: number;
}

export interface OvertrainingAnalysis {
  isOvertraining: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  recommendations: string[];
}

export const detectOvertraining = (
  workoutLogs: WorkoutLog[],
  feedback: WorkoutFeedback
): OvertrainingAnalysis => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Check workout frequency (last 7 days)
  const recentWorkouts = workoutLogs.filter(
    log => Date.now() - log.date.getTime() < 7 * 24 * 60 * 60 * 1000
  );

  if (recentWorkouts.length >= 6) {
    riskScore += 30;
    warnings.push('Training 6+ days per week without rest.');
    recommendations.push('Schedule at least 1-2 rest days per week.');
  }

  // Check consecutive intense workouts
  const last3Workouts = workoutLogs.slice(-3);
  const consecutiveIntense = last3Workouts.filter(w => w.intensity === 'intense').length;
  
  if (consecutiveIntense >= 3) {
    riskScore += 25;
    warnings.push('Multiple consecutive high-intensity sessions.');
    recommendations.push('Alternate between intense and moderate workouts.');
  }

  // Check same muscle groups
  const last5Workouts = workoutLogs.slice(-5);
  const muscleGroupFrequency: Record<string, number> = {};
  
  last5Workouts.forEach(workout => {
    workout.muscleGroups.forEach(group => {
      muscleGroupFrequency[group] = (muscleGroupFrequency[group] || 0) + 1;
    });
  });

  const overworkedMuscles = Object.entries(muscleGroupFrequency)
    .filter(([_, count]) => count >= 4)
    .map(([muscle]) => muscle);

  if (overworkedMuscles.length > 0) {
    riskScore += 20;
    warnings.push(`Overworking: ${overworkedMuscles.join(', ')}`);
    recommendations.push('Vary your workout routine to target different muscle groups.');
  }

  // Check form degradation
  const recentFormIssues = recentWorkouts.reduce((sum, w) => sum + w.formIssues, 0);
  const avgFormIssues = recentFormIssues / Math.max(recentWorkouts.length, 1);
  
  if (avgFormIssues > 5) {
    riskScore += 15;
    warnings.push('Form quality declining - sign of fatigue.');
    recommendations.push('Reduce weight/intensity and focus on proper form.');
  }

  // Check feedback indicators
  if (feedback.fatigueLevel >= 4) {
    riskScore += 20;
    warnings.push('Persistent high fatigue levels.');
  }

  if (feedback.musclesoreness >= 4) {
    riskScore += 15;
    warnings.push('Chronic muscle soreness.');
  }

  if (feedback.sleepQuality <= 2) {
    riskScore += 15;
    warnings.push('Poor sleep quality affecting recovery.');
  }

  // Determine risk level
  let riskLevel: OvertrainingAnalysis['riskLevel'];
  if (riskScore >= 60) {
    riskLevel = 'high';
    recommendations.push('Take 3-5 days of complete rest or active recovery only.');
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
    recommendations.push('Reduce training volume by 30-50% this week.');
  } else {
    riskLevel = 'low';
    recommendations.push('Continue with your current training plan.');
  }

  return {
    isOvertraining: riskScore >= 30,
    riskLevel,
    warnings,
    recommendations,
  };
};
