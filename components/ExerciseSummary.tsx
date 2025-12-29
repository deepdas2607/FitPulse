import React from 'react';
import { ExerciseSession, ExerciseSummary as ExerciseSummaryType } from '../types';
import { CheckCircle2, AlertTriangle, TrendingUp, Clock, Target, Lightbulb } from 'lucide-react';

interface ExerciseSummaryProps {
  session: ExerciseSession;
  onClose: () => void;
  onStartNew: () => void;
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({ session, onClose, onStartNew }) => {
  const totalReps = session.reps.reduce((sum, rep) => sum + rep, 0);
  
  // Calculate form score (0-100)
  const totalIssues = session.formIssues.length;
  const highSeverityIssues = session.formIssues.filter(i => i.severity === 'high').length;
  const mediumSeverityIssues = session.formIssues.filter(i => i.severity === 'medium').length;
  
  // Base score starts at 100, deduct points for issues
  let formScore = 100;
  formScore -= highSeverityIssues * 15; // High severity issues are more critical
  formScore -= mediumSeverityIssues * 8;
  formScore -= (totalIssues - highSeverityIssues - mediumSeverityIssues) * 3;
  formScore = Math.max(0, Math.min(100, formScore));

  // Group issues by type
  const issuesByType = session.formIssues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = [];
    acc[issue.type].push(issue);
    return acc;
  }, {} as Record<string, typeof session.formIssues>);

  // Get unique tips
  const uniqueTips = Array.from(new Set(session.formIssues.map(i => i.tip)));

  // Get improvement suggestions based on most common issues
  const getImprovementSuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    if (issuesByType['alignment']) {
      suggestions.push('Focus on maintaining proper body alignment throughout each rep. Use a mirror or record yourself to check your form.');
    }
    if (issuesByType['posture']) {
      suggestions.push('Work on core stability exercises to improve your posture during exercises.');
    }
    if (issuesByType['range-of-motion']) {
      suggestions.push('Try to achieve full range of motion in each rep. Start with lighter weights if needed.');
    }
    if (issuesByType['speed']) {
      suggestions.push('Slow down your movements. Focus on controlled, deliberate reps rather than speed.');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Great job! Keep maintaining this form and gradually increase intensity.');
    }

    return suggestions;
  };

  const suggestions = getImprovementSuggestions();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Exercise Complete!</h1>
          <p className="text-slate-600">{session.exerciseName}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-slate-600">Sets</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{session.sets}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-slate-600">Total Reps</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalReps}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-slate-600">Duration</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className={`w-5 h-5 ${getScoreColor(formScore)}`} />
              <span className="text-sm text-slate-600">Form Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(formScore)}`}>
              {formScore}
            </div>
            <div className="text-xs text-slate-500 mt-1">{getScoreLabel(formScore)}</div>
          </div>
        </div>

        {/* Form Analysis */}
        {session.formIssues.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              Form Issues Detected
            </h2>
            
            <div className="space-y-4">
              {Object.entries(issuesByType).map(([type, issues]) => (
                <div key={type} className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2 capitalize">
                    {type.replace('-', ' ')} ({issues.length} issues)
                  </h3>
                  <div className="space-y-2">
                    {issues.slice(0, 3).map((issue, idx) => (
                      <div key={idx} className="text-sm text-slate-600">
                        <span className="font-medium">{issue.message}</span>
                        <span className="text-slate-400"> • </span>
                        <span className="text-slate-500">{issue.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Perfect Form!</h2>
            </div>
            <p className="text-green-700 mt-2">No form issues detected. Keep up the great work!</p>
          </div>
        )}

        {/* Improvement Tips */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary-600" />
            Improvement Tips
          </h2>
          <ul className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700">
                <span className="text-primary-600 font-bold mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onStartNew}
            className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors"
          >
            Start New Exercise
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSummary;

