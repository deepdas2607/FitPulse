/**
 * Habit Builder - Notifications and reminders for healthy habits
 */

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'hourly' | 'daily' | 'custom';
  customInterval?: number; // in minutes
  icon: string;
  enabled: boolean;
  lastTriggered?: Date;
}

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'hydration',
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    frequency: 'hourly',
    icon: '💧',
    enabled: true,
  },
  {
    id: 'stretching',
    name: 'Stretch Break',
    description: 'Take a quick stretch break',
    frequency: 'custom',
    customInterval: 120, // 2 hours
    icon: '🧘',
    enabled: true,
  },
  {
    id: 'posture',
    name: 'Check Posture',
    description: 'Maintain good posture',
    frequency: 'custom',
    customInterval: 30, // 30 minutes
    icon: '🪑',
    enabled: true,
  },
  {
    id: 'eye-rest',
    name: 'Eye Rest',
    description: '20-20-20 rule: Look 20ft away for 20 seconds',
    frequency: 'custom',
    customInterval: 20, // 20 minutes
    icon: '👁️',
    enabled: false,
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    description: 'Take 5 deep breaths',
    frequency: 'custom',
    customInterval: 180, // 3 hours
    icon: '🌬️',
    enabled: false,
  },
];

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show a notification
 */
export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  }
};

/**
 * Schedule habit reminders
 */
export class HabitScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private habits: Habit[] = [];

  constructor(habits: Habit[]) {
    this.habits = habits;
  }

  start() {
    this.habits.forEach(habit => {
      if (habit.enabled) {
        this.scheduleHabit(habit);
      }
    });
  }

  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  private scheduleHabit(habit: Habit) {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(habit.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    let intervalMs: number;

    switch (habit.frequency) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'custom':
        intervalMs = (habit.customInterval || 60) * 60 * 1000;
        break;
    }

    // Set up interval
    const interval = setInterval(() => {
      this.triggerHabit(habit);
    }, intervalMs);

    this.intervals.set(habit.id, interval);

    // Also trigger immediately if it's the first time
    if (!habit.lastTriggered) {
      this.triggerHabit(habit);
    }
  }

  private triggerHabit(habit: Habit) {
    showNotification(`${habit.icon} ${habit.name}`, {
      body: habit.description,
      tag: habit.id,
      requireInteraction: false,
    });

    habit.lastTriggered = new Date();
  }

  updateHabit(habitId: string, updates: Partial<Habit>) {
    const habitIndex = this.habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
      this.habits[habitIndex] = { ...this.habits[habitIndex], ...updates };
      
      // Reschedule if enabled
      if (this.habits[habitIndex].enabled) {
        this.scheduleHabit(this.habits[habitIndex]);
      } else {
        // Stop if disabled
        const interval = this.intervals.get(habitId);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(habitId);
        }
      }
    }
  }

  addHabit(habit: Habit) {
    this.habits.push(habit);
    if (habit.enabled) {
      this.scheduleHabit(habit);
    }
  }

  removeHabit(habitId: string) {
    const interval = this.intervals.get(habitId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(habitId);
    }
    this.habits = this.habits.filter(h => h.id !== habitId);
  }

  getHabits(): Habit[] {
    return this.habits;
  }
}

/**
 * Track habit completion
 */
export interface HabitCompletion {
  habitId: string;
  date: Date;
  completed: boolean;
}

export class HabitTracker {
  private completions: HabitCompletion[] = [];

  logCompletion(habitId: string, completed: boolean = true) {
    this.completions.push({
      habitId,
      date: new Date(),
      completed,
    });
  }

  getCompletionRate(habitId: string, days: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentCompletions = this.completions.filter(
      c => c.habitId === habitId && c.date >= cutoffDate
    );

    if (recentCompletions.length === 0) return 0;

    const completedCount = recentCompletions.filter(c => c.completed).length;
    return (completedCount / recentCompletions.length) * 100;
  }

  getStreak(habitId: string): number {
    const sortedCompletions = this.completions
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (sortedCompletions.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].date);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedCompletions.length; i++) {
      const compDate = new Date(sortedCompletions[i].date);
      compDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        streak++;
        currentDate = compDate;
      } else {
        break;
      }
    }

    return streak;
  }
}
