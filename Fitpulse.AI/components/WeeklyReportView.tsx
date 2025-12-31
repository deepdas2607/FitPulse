import React from 'react';
import { WeeklyReport } from '../utils/weeklyReport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Clock, Target, Award, Lightbulb, X } from 'lucide-react';

interface WeeklyReportViewProps {
  report: WeeklyReport;
  onClose: () => void;
}

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ report, onClose }) => {
  const dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const workoutChartData = Object.entries(report.fitnessStats.workoutsByDay).map(([day, count]) => ({
    day,
    workouts: count,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Weekly Report</h2>
            <p className="text-slate-600 text-sm">
              {dateFormat(report.weekStart)} - {dateFormat(report.weekEnd)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className={`rounded-xl p-6 border-2 ${getScoreColor(report.overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Overall Score</h3>
                <p className="text-sm opacity-80">{getScoreLabel(report.overallScore)}</p>
              </div>
              <div className="text-5xl font-bold">{report.overallScore}</div>
            </div>
          </div>

          {/* Fitness Stats */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Fitness Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-slate-600">Workouts</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{report.fitnessStats.totalWorkouts}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-slate-600">Duration</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{Math.round(report.fitnessStats.totalDuration)}</p>
                <p className="text-xs text-slate-500">minutes</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-slate-600">Total Reps</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{report.fitnessStats.totalReps}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-slate-600">Form Score</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{Math.round(report.fitnessStats.avgFormScore)}</p>
                <p className="text-xs text-slate-500">out of 100</p>
              </div>
            </div>
          </div>

          {/* Workout Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Workout Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="workouts" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Exercises */}
          {report.fitnessStats.topExercises.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Exercises</h3>
              <div className="space-y-3">
                {report.fitnessStats.topExercises.map((exercise, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-900">{exercise.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{exercise.count} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {report.achievements.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Achievements
              </h3>
              <div className="space-y-2">
                {report.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-green-800">
                    <span className="text-lg">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {report.improvements.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Areas to Improve</h3>
              <ul className="space-y-2">
                {report.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-yellow-800">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-blue-800">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportView;
