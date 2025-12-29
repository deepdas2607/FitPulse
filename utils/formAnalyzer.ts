import { FormIssue } from '../types';

// MediaPipe Pose landmarks indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks: PoseLandmark[];
}

// Calculate distance between two points
const distance = (p1: PoseLandmark, p2: PoseLandmark): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Calculate angle between three points (exported for debug display)
export const calculateAngle = (p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number => {
  const a = distance(p1, p2);
  const b = distance(p2, p3);
  const c = distance(p1, p3);
  const angle = Math.acos((a * a + b * b - c * c) / (2 * a * b));
  return (angle * 180) / Math.PI;
};

export interface ExerciseFormAnalysis {
  issues: FormIssue[];
  repCount: number;
  isProperForm: boolean;
  exerciseState: ExerciseState;
}

// State machine for rep counting
export type RepState = 'UP' | 'DOWN' | 'TRANSITIONING_DOWN' | 'TRANSITIONING_UP';

export interface ExerciseState {
  repState: RepState;
  repCount: number;
  lastRepTime: number;
  // For hysteresis - tracks the extreme values seen in current phase
  lowestAngle: number;
  highestAngle: number;
}

// Analyze form for different exercises
export const analyzeExerciseForm = (
  exerciseId: string,
  poseResults: PoseResults,
  timestamp: number,
  previousState?: ExerciseState
): ExerciseFormAnalysis => {
  const issues: FormIssue[] = [];
  const landmarks = poseResults.poseLandmarks;

  // DEBUG: Log every call to see what exercise is being analyzed
  console.log(`[ANALYZER] Exercise: "${exerciseId}" | Landmarks: ${landmarks?.length || 0}`);

  // Default exercise state
  const defaultState: ExerciseState = {
    repState: 'UP',
    repCount: 0,
    lastRepTime: 0,
    lowestAngle: 180,
    highestAngle: 0,
  };

  // Initialize or use previous state
  let exerciseState: ExerciseState = previousState ? { ...previousState } : defaultState;

  if (!landmarks || landmarks.length < 28) {
    return {
      issues: [],
      repCount: exerciseState.repCount,
      isProperForm: false,
      exerciseState
    };
  }

  const currentTime = Date.now();
  const timeSinceLastRep = exerciseState.lastRepTime > 0
    ? currentTime - exerciseState.lastRepTime
    : Infinity;

  // Common form checks
  const checkPosture = () => {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    // Check if shoulders are level
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDiff > 0.05) {
      issues.push({
        timestamp,
        type: 'alignment',
        severity: 'medium',
        message: 'Shoulders are not level',
        tip: 'Keep your shoulders parallel to the ground. This helps maintain proper form and prevents injury.',
      });
    }

    // Check if hips are level
    const hipDiff = Math.abs(leftHip.y - rightHip.y);
    if (hipDiff > 0.05) {
      issues.push({
        timestamp,
        type: 'alignment',
        severity: 'medium',
        message: 'Hips are not level',
        tip: 'Keep your hips level and aligned. This ensures balanced muscle engagement.',
      });
    }
  };

  // Squat-specific posture checks
  const checkSquatPosture = () => {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    // Calculate average positions
    const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const avgHipX = (leftHip.x + rightHip.x) / 2;
    const avgKneeX = (leftKnee.x + rightKnee.x) / 2;
    const avgAnkleX = (leftAnkle.x + rightAnkle.x) / 2;

    // 1. BACK ANGLE CHECK (Torso Forward Lean)
    // Compare shoulder position relative to hip - too far forward indicates excessive lean
    const torsoLean = avgShoulderX - avgHipX;
    // Positive value = shoulders in front of hips (leaning forward)
    // The threshold depends on camera angle, but excessive forward lean is > 0.15
    if (Math.abs(torsoLean) > 0.15) {
      if (torsoLean > 0) {
        issues.push({
          timestamp,
          type: 'posture',
          severity: 'high',
          message: 'Excessive forward lean',
          tip: 'Keep your chest up and back straight. Avoid leaning too far forward as this puts strain on your lower back.',
        });
      }
    }

    // 2. KNEE-OVER-TOE CHECK
    // Check if knees are tracking too far forward past the toes
    const leftKneeOverToe = leftKnee.x - leftAnkle.x;
    const rightKneeOverToe = rightKnee.x - rightAnkle.x;

    // During a squat, some forward knee travel is normal, but excessive is problematic
    // This is most relevant when in the DOWN position
    if (exerciseState.repState === 'DOWN' || exerciseState.repState === 'TRANSITIONING_UP') {
      if (Math.abs(leftKneeOverToe) > 0.12 || Math.abs(rightKneeOverToe) > 0.12) {
        issues.push({
          timestamp,
          type: 'alignment',
          severity: 'medium',
          message: 'Knees extending past toes',
          tip: 'Push your hips back more to keep your knees behind or in line with your toes. This reduces knee strain.',
        });
      }
    }

    // 3. SPINE ANGLE (using shoulder-hip-knee angle)
    // A neutral spine during squat should maintain a consistent angle
    const spineAngle = calculateAngle(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 },
      { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 }
    );

    // During the down phase, if spine angle is too acute, back is rounding
    if (exerciseState.repState === 'DOWN' && spineAngle < 70) {
      issues.push({
        timestamp,
        type: 'posture',
        severity: 'high',
        message: 'Back may be rounding',
        tip: 'Maintain a neutral spine by keeping your chest up and core engaged. Avoid rounding your lower back.',
      });
    }
  };

  // Exercise-specific analysis
  switch (exerciseId) {
    case 'squats':
    case 'jumping-squats': {
      checkPosture();
      checkSquatPosture();
      const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
      const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
      const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
      const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
      const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

      // Calculate knee angles for detection
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

      // Check knee alignment (valgus)
      if (avgKneeAngle < 100) {
        const kneeValgus = Math.abs(leftKnee.x - leftAnkle.x) > 0.1 || Math.abs(rightKnee.x - rightAnkle.x) > 0.1;
        if (kneeValgus) {
          issues.push({
            timestamp,
            type: 'alignment',
            severity: 'high',
            message: 'Knees caving inward',
            tip: 'Keep your knees aligned with your toes. Push your knees out as you descend to engage your glutes properly.',
          });
        }
      }

      // ========== STATE MACHINE FOR REP COUNTING ==========
      // Thresholds with hysteresis to prevent oscillation
      const DOWN_THRESHOLD = 110;    // Angle below this = consider "down" position
      const UP_THRESHOLD = 150;       // Angle above this = consider "up" position
      const MIN_REP_TIME_MS = 500;    // Minimum time between reps (prevents double counting)

      // Track angle extremes
      exerciseState.lowestAngle = Math.min(exerciseState.lowestAngle, avgKneeAngle);
      exerciseState.highestAngle = Math.max(exerciseState.highestAngle, avgKneeAngle);

      // State machine transitions
      switch (exerciseState.repState) {
        case 'UP':
          // Looking for descent - knee angle decreasing
          if (avgKneeAngle < DOWN_THRESHOLD) {
            exerciseState.repState = 'DOWN';
            exerciseState.lowestAngle = avgKneeAngle; // Reset to track lowest point
          } else if (avgKneeAngle < UP_THRESHOLD) {
            exerciseState.repState = 'TRANSITIONING_DOWN';
          }
          break;

        case 'TRANSITIONING_DOWN':
          // Committed to going down
          if (avgKneeAngle < DOWN_THRESHOLD) {
            exerciseState.repState = 'DOWN';
            exerciseState.lowestAngle = avgKneeAngle;
          } else if (avgKneeAngle > UP_THRESHOLD) {
            // Changed direction before reaching down - go back to UP
            exerciseState.repState = 'UP';
          }
          break;

        case 'DOWN':
          // Looking for ascent - knee angle increasing
          if (avgKneeAngle > UP_THRESHOLD && timeSinceLastRep > MIN_REP_TIME_MS) {
            // Completed a rep!
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
            exerciseState.highestAngle = avgKneeAngle; // Reset for next rep
          } else if (avgKneeAngle > DOWN_THRESHOLD) {
            exerciseState.repState = 'TRANSITIONING_UP';
          }
          // Track the lowest angle reached
          exerciseState.lowestAngle = Math.min(exerciseState.lowestAngle, avgKneeAngle);
          break;

        case 'TRANSITIONING_UP':
          // Committed to going up
          if (avgKneeAngle > UP_THRESHOLD && timeSinceLastRep > MIN_REP_TIME_MS) {
            // Completed a rep!
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
            exerciseState.highestAngle = avgKneeAngle;
          } else if (avgKneeAngle < DOWN_THRESHOLD) {
            // Changed direction before reaching up - go back to DOWN
            exerciseState.repState = 'DOWN';
          }
          break;
      }

      // Check depth (only warn if not going deep enough in DOWN position)
      if (exerciseState.repState === 'DOWN' && exerciseState.lowestAngle > 100) {
        issues.push({
          timestamp,
          type: 'range-of-motion',
          severity: 'low',
          message: 'Squat depth could be deeper',
          tip: 'Aim to get your hips below your knees for full range of motion. This maximizes muscle engagement.',
        });
      }
      break;
    }

    case 'bicep-curl':
    case 'hammer-curl': {
      const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
      const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
      const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
      const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
      const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

      // Check elbow position (should stay relatively fixed)
      // Increased threshold to reduce false positives
      const leftElbowMovement = distance(leftElbow, { x: leftShoulder.x, y: leftElbow.y });
      const rightElbowMovement = distance(rightElbow, { x: rightShoulder.x, y: rightElbow.y });

      if (leftElbowMovement > 0.2 || rightElbowMovement > 0.2) {
        issues.push({
          timestamp,
          type: 'posture',
          severity: 'low',  // Changed from 'medium' to 'low'
          message: 'Elbows moving forward',
          tip: 'Keep your elbows close to your body and stationary. Only your forearms should move during the curl.',
        });
      }

      // Calculate elbow angle for rep detection
      const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // State machine for curls - WIDENED THRESHOLDS
      // Elbow angle: ~150-170° = arm extended, ~40-70° = arm curled
      const CURL_DOWN_THRESHOLD = 100;  // Arm curled - VERY forgiving
      const CURL_UP_THRESHOLD = 120;    // Arm extended - VERY forgiving  
      const CURL_MIN_TIME = 300;

      // Debug logging
      console.log(`[CURL] Angle: ${avgElbowAngle.toFixed(0)}° | State: ${exerciseState.repState} | Reps: ${exerciseState.repCount}`);

      switch (exerciseState.repState) {
        case 'UP':
          // Start position (arm extended) - waiting to curl down
          if (avgElbowAngle < CURL_DOWN_THRESHOLD) {
            console.log('[CURL] Transitioning to DOWN - arm curled!');
            exerciseState.repState = 'DOWN';
          }
          break;

        case 'DOWN':
          // Curled position - waiting to extend back up
          if (avgElbowAngle > CURL_UP_THRESHOLD && timeSinceLastRep > CURL_MIN_TIME) {
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
            console.log(`[CURL] *** REP COUNTED! *** Total: ${exerciseState.repCount}`);
          }
          break;

        case 'TRANSITIONING_DOWN':
          // Simplified: just go to DOWN
          exerciseState.repState = 'DOWN';
          break;

        case 'TRANSITIONING_UP':
          // Simplified: just go to UP and count
          if (avgElbowAngle > CURL_UP_THRESHOLD && timeSinceLastRep > CURL_MIN_TIME) {
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
            console.log(`[CURL] *** REP COUNTED! *** Total: ${exerciseState.repCount}`);
          }
          break;
      }
      break;
    }

    case 'push-ups':
    case 'tricep-pushdowns':
      checkPosture();
      const nose = landmarks[POSE_LANDMARKS.NOSE];
      const avgShoulderY = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2;

      // Check if body is straight
      const bodyAlignment = Math.abs(nose.y - avgShoulderY);
      if (bodyAlignment > 0.2) {
        issues.push({
          timestamp,
          type: 'posture',
          severity: 'high',
          message: 'Body not in straight line',
          tip: 'Keep your body in a straight line from head to heels. Avoid arching your back or sagging your hips.',
        });
      }
      break;

    case 'crunches': {
      const noseY = landmarks[POSE_LANDMARKS.NOSE].y;
      const crunchAvgHipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
      const crunchDistance = crunchAvgHipY - noseY; // Positive when nose is above hips

      // State machine for crunches
      const CRUNCH_UP_THRESHOLD = 0.05;   // Lying flat
      const CRUNCH_DOWN_THRESHOLD = 0.15; // Crunched up
      const CRUNCH_MIN_TIME = 400;

      switch (exerciseState.repState) {
        case 'UP': // Lying flat
          if (crunchDistance > CRUNCH_DOWN_THRESHOLD) {
            exerciseState.repState = 'DOWN'; // Crunched up
          } else if (crunchDistance > CRUNCH_UP_THRESHOLD) {
            exerciseState.repState = 'TRANSITIONING_DOWN';
          }
          break;
        case 'TRANSITIONING_DOWN':
          if (crunchDistance > CRUNCH_DOWN_THRESHOLD) {
            exerciseState.repState = 'DOWN';
          } else if (crunchDistance < CRUNCH_UP_THRESHOLD) {
            exerciseState.repState = 'UP';
          }
          break;
        case 'DOWN': // Crunched up
          if (crunchDistance < CRUNCH_UP_THRESHOLD && timeSinceLastRep > CRUNCH_MIN_TIME) {
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
          } else if (crunchDistance < CRUNCH_DOWN_THRESHOLD) {
            exerciseState.repState = 'TRANSITIONING_UP';
          }
          break;
        case 'TRANSITIONING_UP':
          if (crunchDistance < CRUNCH_UP_THRESHOLD && timeSinceLastRep > CRUNCH_MIN_TIME) {
            exerciseState.repState = 'UP';
            exerciseState.repCount++;
            exerciseState.lastRepTime = currentTime;
          } else if (crunchDistance > CRUNCH_DOWN_THRESHOLD) {
            exerciseState.repState = 'DOWN';
          }
          break;
      }

      // Check if pulling with neck
      const neckAngle = calculateAngle(
        landmarks[POSE_LANDMARKS.NOSE],
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_HIP]
      );

      if (neckAngle < 120) {
        issues.push({
          timestamp,
          type: 'posture',
          severity: 'medium',
          message: 'Pulling with neck',
          tip: 'Focus on using your core muscles. Keep your neck relaxed and avoid pulling your head forward with your hands.',
        });
      }
      break;
    }

    default:
      // Generic analysis for other exercises
      checkPosture();
      break;
  }

  return {
    issues,
    repCount: exerciseState.repCount,
    isProperForm: issues.filter(i => i.severity === 'high').length === 0,
    exerciseState,
  };
};
