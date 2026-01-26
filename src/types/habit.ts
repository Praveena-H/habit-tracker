export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  completedDates: string[];
  frequency: FrequencyType;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  reminderTime?: string; // HH:MM format
  goal?: number; // Target streak or completions
  notes?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export type AchievementType = 'streak' | 'consistency' | 'total';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  threshold: number;
  unlockedAt?: string;
}

export interface UserAchievements {
  habitId: string;
  achievements: Achievement[];
}
