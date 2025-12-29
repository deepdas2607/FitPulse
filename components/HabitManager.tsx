import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, BellOff, Edit2, Trash2 } from 'lucide-react';
import {
  Habit,
  DEFAULT_HABITS,
  HabitScheduler,
  HabitTracker,
  requestNotificationPermission,
} from '../utils/habitBuilder';

interface HabitManagerProps {
  onClose: () => void;
}

const HabitManager: React.FC<HabitManagerProps> = ({ onClose }) => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [scheduler, setScheduler] = useState<HabitScheduler | null>(null);
  const [tracker] = useState(new HabitTracker());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Initialize scheduler
    const newScheduler = new HabitScheduler(habits);
    if (Notification.permission === 'granted') {
      newScheduler.start();
    }
    setScheduler(newScheduler);

    return () => {
      newScheduler.stop();
    };
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted && scheduler) {
      scheduler.stop();
      const newScheduler = new HabitScheduler(habits);
      newScheduler.start();
      setScheduler(newScheduler);
    }
  };

  const toggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(h =>
      h.id === habitId ? { ...h, enabled: !h.enabled } : h
    );
    setHabits(updatedHabits);
    
    if (scheduler) {
      const habit = updatedHabits.find(h => h.id === habitId);
      if (habit) {
        scheduler.updateHabit(habitId, { enabled: habit.enabled });
      }
    }
  };

  const getFrequencyLabel = (habit: Habit): string => {
    if (habit.frequency === 'hourly') return 'Every hour';
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'custom' && habit.customInterval) {
      const hours = Math.floor(habit.customInterval / 60);
      const minutes = habit.customInterval % 60;
      if (hours > 0 && minutes > 0) return `Every ${hours}h ${minutes}m`;
      if (hours > 0) return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
      return `Every ${minutes} minutes`;
    }
    return 'Custom';
  };

  const getCompletionRate = (habitId: string): number => {
    return tracker.getCompletionRate(habitId, 7);
  };

  const getStreak = (habitId: string): number => {
    return tracker.getStreak(habitId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Habit Builder</h2>
            <p className="text-sm text-slate-600">Build healthy habits with smart reminders</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Permission */}
          {!notificationsEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">Enable Notifications</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Allow notifications to receive habit reminders
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Habits List */}
          <div className="space-y-3">
            {habits.map(habit => (
              <div
                key={habit.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  habit.enabled
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{habit.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{habit.name}</h3>
                        <p className="text-sm text-slate-600">{habit.description}</p>
                      </div>
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          habit.enabled
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {habit.enabled ? (
                          <Bell className="w-5 h-5" />
                        ) : (
                          <BellOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        {getFrequencyLabel(habit)}
                      </span>
                      {habit.enabled && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold text-xs">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Start with 2-3 habits to avoid overwhelming yourself</li>
              <li>• Notifications will appear even when the app is closed</li>
              <li>• Consistency is key - stick with it for 21 days to form a habit</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitManager;
