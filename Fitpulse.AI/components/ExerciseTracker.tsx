import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Exercise, ExerciseSession, FormIssue } from '../types';
import { analyzeExerciseForm, POSE_LANDMARKS, calculateAngle, ExerciseState } from '../utils/formAnalyzer';
import { EmergencySpeechRecognition, isSpeechRecognitionSupported, requestMicrophonePermission } from '../utils/speechRecognition';
import EmergencyAlert from './EmergencyAlert';
import { useAuth } from '../contexts/AuthContext';
import { Camera, X, Play, Pause, Square, CheckCircle2, AlertCircle, Mic, Eye, EyeOff } from 'lucide-react';

interface ExerciseTrackerProps {
  exercise: Exercise;
  onComplete: (session: ExerciseSession) => void;
  onCancel: () => void;
}

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ exercise, onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [setCount, setSetCount] = useState(0);
  const [currentSetReps, setCurrentSetReps] = useState<number[]>([]);
  const [formIssues, setFormIssues] = useState<FormIssue[]>([]);
  const [recentIssues, setRecentIssues] = useState<FormIssue[]>([]); // Last 3 seconds of issues for display
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentFormStatus, setCurrentFormStatus] = useState<'good' | 'warning' | 'poor'>('good');
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [speechRecognitionActive, setSpeechRecognitionActive] = useState(false);
  const speechRecognitionRef = useRef<EmergencySpeechRecognition | null>(null);
  const { userProfile } = useAuth();

  // MediaPipe Pose instance (will be loaded dynamically)
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // State machine for rep counting
  const exerciseStateRef = useRef<ExerciseState>({
    repState: 'UP',
    repCount: 0,
    lastRepTime: 0,
    lowestAngle: 180,
    highestAngle: 0,
  });

  // Refs to share state with pose callback (fixes React closure issue)
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentSetRepsRef = useRef<number[]>([]);
  const setCountRef = useRef(1);

  // Debug angle display
  const [showDebugAngles, setShowDebugAngles] = useState(true);
  const currentAnglesRef = useRef<{ leftKnee: number; rightKnee: number; leftHip: number; rightHip: number }>({
    leftKnee: 0, rightKnee: 0, leftHip: 0, rightHip: 0
  });

  // Initialize Emergency Speech Recognition
  useEffect(() => {
    const initSpeechRecognition = async () => {
      if (!isSpeechRecognitionSupported()) {
        console.warn('Speech recognition not supported in this browser');
        return;
      }

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.warn('Microphone permission not granted');
        return;
      }

      // Initialize speech recognition
      const speechRecognition = new EmergencySpeechRecognition({
        onEmergencyDetected: () => {
          console.log('Emergency word detected!');
          handleEmergencyDetected();
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        },
        emergencyWords: ['help', 'emergency', 'stop', 'ambulance', '911', 'nine one one', 'call help'],
        continuous: true,
        interimResults: true,
      });

      speechRecognitionRef.current = speechRecognition;
    };

    initSpeechRecognition();

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  const handleEmergencyDetected = () => {
    // Pause the workout immediately
    setIsPaused(true);
    setIsRecording(false);

    // Show emergency alert
    setShowEmergencyAlert(true);
  };

  const handleEmergencyDismiss = () => {
    setShowEmergencyAlert(false);
    // Optionally resume or end the workout
  };

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const poseModule = await import('@mediapipe/pose');
        const cameraModule = await import('@mediapipe/camera_utils');
        const drawingModule = await import('@mediapipe/drawing_utils');

        const { Pose } = poseModule;
        const { Camera } = cameraModule;
        const { drawConnectors, drawLandmarks } = drawingModule;

        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Get POSE_CONNECTIONS synchronously from already-loaded module
        const POSE_CONNECTIONS = poseModule.POSE_CONNECTIONS;

        pose.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;

          const canvasCtx = canvasRef.current.getContext('2d');
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw pose landmarks
          if (results.poseLandmarks && POSE_CONNECTIONS) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2,
            });
            drawLandmarks(canvasCtx, results.poseLandmarks, {
              color: '#FF0000',
              lineWidth: 1,
              radius: 3,

            });

            // Calculate and display debug angles
            if (showDebugAngles && results.poseLandmarks.length >= 29) {
              const landmarks = results.poseLandmarks;
              const canvasWidth = canvasRef.current.width;
              const canvasHeight = canvasRef.current.height;

              // Get landmark positions
              const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
              const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
              const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
              const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
              const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
              const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
              const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
              const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
              const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
              const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
              const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
              const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

              // Helper function to draw angle text on canvas
              const drawAngleText = (
                landmark: { x: number; y: number; visibility?: number },
                angle: number,
                label: string,
                offsetX: number = 0,
                offsetY: number = 0
              ) => {
                if (landmark.visibility && landmark.visibility < 0.5) return;

                const x = landmark.x * canvasWidth + offsetX;
                const y = landmark.y * canvasHeight + offsetY;

                // Draw background for readability
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                canvasCtx.fillRect(x - 2, y - 14, 75, 18);

                // Draw angle text
                canvasCtx.font = 'bold 12px Arial';
                canvasCtx.fillStyle = angle < 90 ? '#FF6B6B' : angle < 120 ? '#FFE66D' : '#4ECDC4';
                canvasCtx.fillText(`${label}: ${Math.round(angle)}°`, x, y);
              };

              // Show different angles based on exercise type
              if (exercise.id === 'bicep-curl' || exercise.id === 'hammer-curl') {
                // ELBOW angles for curls (shoulder-elbow-wrist)
                const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
                const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

                drawAngleText(leftElbow, leftElbowAngle, 'L.Elbow', -75, 0);
                drawAngleText(rightElbow, rightElbowAngle, 'R.Elbow', 10, 0);

                // Store for ref
                currentAnglesRef.current = {
                  leftKnee: leftElbowAngle,
                  rightKnee: rightElbowAngle,
                  leftHip: 0,
                  rightHip: 0
                };
              } else {
                // KNEE angles for squats (hip-knee-ankle)
                const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
                const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

                // HIP angles (shoulder-hip-knee)
                const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
                const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

                // Store angles in ref
                currentAnglesRef.current = {
                  leftKnee: leftKneeAngle,
                  rightKnee: rightKneeAngle,
                  leftHip: leftHipAngle,
                  rightHip: rightHipAngle
                };

                // Draw knee angles
                drawAngleText(leftKnee, leftKneeAngle, 'L.Knee', -70, 0);
                drawAngleText(rightKnee, rightKneeAngle, 'R.Knee', 10, 0);

                // Draw hip angles
                drawAngleText(leftHip, leftHipAngle, 'L.Hip', -65, -15);
                drawAngleText(rightHip, rightHipAngle, 'R.Hip', 10, -15);
              }
            }

            // DEBUG: Log whenever pose is detected (using refs to get current state)
            // console.log(`[POSE] Detected! isRecording: ${isRecordingRef.current}, isPaused: ${isPausedRef.current}`);

            // Analyze form (use refs to avoid stale closure)
            if (isRecordingRef.current && !isPausedRef.current) {
              // console.log(`[POSE] Analyzing exercise: ${exercise.id}`);
              const timestamp = Date.now();
              const analysis = analyzeExerciseForm(
                exercise.id,
                { poseLandmarks: results.poseLandmarks },
                timestamp,
                exerciseStateRef.current
              );

              // Update exercise state ref with the new state
              exerciseStateRef.current = analysis.exerciseState;

              // DIRECT SYNC: Always update UI from the exercise state
              const newRepCount = analysis.exerciseState.repCount;
              if (newRepCount > repCount) {
                console.log(`[TRACKER] Updating UI rep count from ${repCount} to ${newRepCount}`);
                setRepCount(newRepCount);

                const currentSetReps = currentSetRepsRef.current;
                const setIdx = setCountRef.current - 1;

                // If rep count increased, determine if we need to add to the current set
                // Calculate total reps recorded across all sets so far EXCEPT the potentially current one update
                const totalRecordedReps = currentSetReps.reduce((a, b) => a + b, 0);

                if (newRepCount > totalRecordedReps) {
                  const newReps = [...currentSetReps];
                  // Ensure the array has an entry for the current set
                  if (newReps.length <= setIdx) {
                    newReps[setIdx] = 0;
                  }
                  newReps[setIdx] = (newReps[setIdx] || 0) + 1;

                  setCurrentSetReps(newReps);
                  currentSetRepsRef.current = newReps; // Update ref immediately
                }
              }

              // Update form issues
              if (analysis.issues.length > 0) {
                setFormIssues(prev => [...prev, ...analysis.issues]);

                // Update recent issues for real-time display (unique by message)
                const uniqueIssues = analysis.issues.filter((issue, index, self) =>
                  index === self.findIndex(i => i.message === issue.message)
                );
                setRecentIssues(uniqueIssues.slice(0, 3)); // Show max 3 issues

                // Determine form status
                const hasHighSeverity = analysis.issues.some(i => i.severity === 'high');
                const hasMediumSeverity = analysis.issues.some(i => i.severity === 'medium');

                if (hasHighSeverity) {
                  setCurrentFormStatus('poor');
                } else if (hasMediumSeverity) {
                  setCurrentFormStatus('warning');
                } else {
                  setCurrentFormStatus('good');
                }
              } else {
                setCurrentFormStatus('good');
                setRecentIssues([]); // Clear issues when form is good
              }
            }
          }

          canvasCtx.restore();
        });

        poseRef.current = pose;

        // Initialize camera
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720,
          });
          camera.start();
          cameraRef.current = camera;
        }
      } catch (error: any) {
        // Provide richer error details to help debugging in the browser console
        console.error('Error initializing MediaPipe:', error);
        try {
          console.error('MediaPipe error name:', error?.name);
          console.error('MediaPipe error message:', error?.message);
          console.error('MediaPipe error stack:', error?.stack);
          // If the error contains nested details, log them as well
          if (error?.details) console.error('MediaPipe error details:', error.details);
        } catch (logErr) {
          console.error('Failed to log MediaPipe error details', logErr);
        }

        // Friendly message to user with hint
        alert('Failed to initialize MediaPipe or camera. Please ensure you have granted camera permissions and that your browser supports WebGL / OffscreenCanvas. Check the console for more details.');
      }
    };

    initMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Set canvas size
  useEffect(() => {
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth || 1280;
      canvasRef.current.height = videoRef.current.videoHeight || 720;
    }
  }, [videoRef.current?.videoWidth, videoRef.current?.videoHeight]);

  const startExercise = async () => {
    setIsRecording(true);
    isRecordingRef.current = true;  // Sync ref for pose callback
    setStartTime(new Date());
    setRepCount(0);
    setSetCount(1);
    setCurrentSetReps([0]);
    currentSetRepsRef.current = [0]; // Sync ref
    setCountRef.current = 1; // Sync ref

    setFormIssues([]);
    setRecentIssues([]);

    // Reset exercise state machine
    exerciseStateRef.current = {
      repState: 'UP',
      repCount: 0,
      lastRepTime: 0,
      lowestAngle: 180,
      highestAngle: 0,
    };

    // Start emergency speech recognition
    if (speechRecognitionRef.current && !speechRecognitionActive) {
      speechRecognitionRef.current.start();
      setSpeechRecognitionActive(true);
    }
  };

  const pauseExercise = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    isPausedRef.current = newPausedState;  // Sync ref for pose callback

    // Pause/resume speech recognition
    if (speechRecognitionRef.current) {
      if (newPausedState) {
        speechRecognitionRef.current.stop();
        setSpeechRecognitionActive(false);
      } else {
        speechRecognitionRef.current.start();
        setSpeechRecognitionActive(true);
      }
    }
  };

  const completeSet = () => {
    setSetCount(prev => {
      const newVal = prev + 1;
      setCountRef.current = newVal;
      return newVal;
    });
    setCurrentSetReps(prev => {
      const newVal = [...prev, 0];
      currentSetRepsRef.current = newVal;
      return newVal;
    });
  };

  const finishExercise = () => {
    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Use Refs to ensure we have the absolute latest data even if state update is pending
    const session: ExerciseSession = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: setCountRef.current,
      reps: currentSetRepsRef.current,
      formIssues: formIssues,
      startTime,
      endTime,
      duration,
    };

    onComplete(session);
  };

  const getFormStatusColor = () => {
    switch (currentFormStatus) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
    }
  };

  const getFormStatusIcon = () => {
    switch (currentFormStatus) {
      case 'good': return <CheckCircle2 className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'poor': return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Emergency Alert Overlay */}
      {showEmergencyAlert && (
        <EmergencyAlert
          emergencyContact={userProfile?.emergencyContact}
          onDismiss={handleEmergencyDismiss}
          onCallComplete={handleEmergencyDismiss}
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{exercise.name}</h2>
          <p className="text-slate-400 text-sm">Set {setCount} • Rep {repCount}</p>
        </div>
        <div className="flex items-center gap-3">
          {speechRecognitionActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg">
              <Mic className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">Emergency Listening</span>
            </div>
          )}
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay Stats */}
        <div className="absolute top-20 left-4 z-10 space-y-3">
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getFormStatusColor()}`}>
            {getFormStatusIcon()}
            <span className="font-semibold">
              {currentFormStatus === 'good' ? 'Good Form' :
                currentFormStatus === 'warning' ? 'Form Warning' : 'Poor Form'}
            </span>
          </div>

          {/* Debug Angle Toggle */}
          <button
            onClick={() => setShowDebugAngles(!showDebugAngles)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${showDebugAngles
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}
          >
            {showDebugAngles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {showDebugAngles ? 'Angles: ON' : 'Angles: OFF'}
            </span>
          </button>
        </div>

        {/* Real-time Posture Warnings Panel - Right Side */}
        {isRecording && recentIssues.length > 0 && (
          <div className="absolute top-20 right-4 z-10 max-w-xs space-y-2">
            <div className="text-xs font-semibold text-white/70 mb-1">⚠️ FORM FEEDBACK</div>
            {recentIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg backdrop-blur-sm border text-sm ${issue.severity === 'high'
                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                  : issue.severity === 'medium'
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                  }`}
              >
                <div className="font-semibold">{issue.message}</div>
                <div className="text-xs opacity-80 mt-1">{issue.tip}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-sm p-6">
        {!isRecording ? (
          <div className="max-w-lg mx-auto space-y-4">
            {/* Beginner Guidance */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                💡 Before You Start
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Position yourself so your full body is visible in the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Ensure good lighting for accurate skeleton detection</span>
                </li>
                {exercise.id === 'squats' || exercise.id === 'jumping-squats' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">→</span>
                      <span>Keep your chest up and back straight throughout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">→</span>
                      <span>Push your knees out in line with your toes</span>
                    </li>
                  </>
                ) : exercise.id === 'bicep-curl' || exercise.id === 'hammer-curl' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">→</span>
                      <span>Keep your elbows pinned to your sides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">→</span>
                      <span>Control the movement both up and down</span>
                    </li>
                  </>
                ) : (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">→</span>
                    <span>Maintain controlled movements with good form</span>
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={startExercise}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-6 h-6" />
              Start Exercise
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-400">{repCount}</div>
                <div className="text-sm text-slate-400">Reps</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-400">{setCount}</div>
                <div className="text-sm text-slate-400">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0}s
                </div>
                <div className="text-sm text-slate-400">Time</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={pauseExercise}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={completeSet}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Complete Set
              </button>
              <button
                onClick={finishExercise}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-5 h-5" />
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseTracker;
