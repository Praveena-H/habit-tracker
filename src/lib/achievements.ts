import { Achievement, HabitStats } from '@/types/habit';

export const STREAK_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'streak_3', name: 'Getting Started', description: '3 day streak', icon: '🌱', type: 'streak', threshold: 3 },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥', type: 'streak', threshold: 7 },
  { id: 'streak_14', name: 'Fortnight Fighter', description: '14 day streak', icon: '⚡', type: 'streak', threshold: 14 },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '🏆', type: 'streak', threshold: 30 },
  { id: 'streak_60', name: 'Two Month Titan', description: '60 day streak', icon: '💎', type: 'streak', threshold: 60 },
  { id: 'streak_100', name: 'Century Champion', description: '100 day streak', icon: '👑', type: 'streak', threshold: 100 },
  { id: 'streak_365', name: 'Year Legend', description: '365 day streak', icon: '🌟', type: 'streak', threshold: 365 },
];

export const CONSISTENCY_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'consistency_50', name: 'Half There', description: '50% 30-day rate', icon: '📊', type: 'consistency', threshold: 50 },
  { id: 'consistency_75', name: 'Consistent', description: '75% 30-day rate', icon: '📈', type: 'consistency', threshold: 75 },
  { id: 'consistency_90', name: 'Almost Perfect', description: '90% 30-day rate', icon: '🎯', type: 'consistency', threshold: 90 },
  { id: 'consistency_100', name: 'Perfectionist', description: '100% 30-day rate', icon: '💯', type: 'consistency', threshold: 100 },
];

export const TOTAL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'total_10', name: 'First Steps', description: '10 completions', icon: '🎬', type: 'total', threshold: 10 },
  { id: 'total_50', name: 'Getting Serious', description: '50 completions', icon: '💪', type: 'total', threshold: 50 },
  { id: 'total_100', name: 'Century Club', description: '100 completions', icon: '🥇', type: 'total', threshold: 100 },
  { id: 'total_250', name: 'Dedicated', description: '250 completions', icon: '🥈', type: 'total', threshold: 250 },
  { id: 'total_500', name: 'Habit Master', description: '500 completions', icon: '🥉', type: 'total', threshold: 500 },
  { id: 'total_1000', name: 'Legendary', description: '1000 completions', icon: '🏅', type: 'total', threshold: 1000 },
];

export const ALL_ACHIEVEMENTS = [
  ...STREAK_ACHIEVEMENTS,
  ...CONSISTENCY_ACHIEVEMENTS,
  ...TOTAL_ACHIEVEMENTS,
];

export const getUnlockedAchievements = (stats: HabitStats): Achievement[] => {
  const unlocked: Achievement[] = [];
  const now = new Date().toISOString();

  // Check streak achievements
  STREAK_ACHIEVEMENTS.forEach(achievement => {
    if (stats.longestStreak >= achievement.threshold) {
      unlocked.push({ ...achievement, unlockedAt: now });
    }
  });

  // Check consistency achievements
  CONSISTENCY_ACHIEVEMENTS.forEach(achievement => {
    if (stats.completionRate >= achievement.threshold) {
      unlocked.push({ ...achievement, unlockedAt: now });
    }
  });

  // Check total achievements
  TOTAL_ACHIEVEMENTS.forEach(achievement => {
    if (stats.totalCompletions >= achievement.threshold) {
      unlocked.push({ ...achievement, unlockedAt: now });
    }
  });

  return unlocked;
};

export const getNextAchievements = (stats: HabitStats): Achievement[] => {
  const next: Achievement[] = [];

  // Get next streak achievement
  const nextStreak = STREAK_ACHIEVEMENTS.find(a => stats.longestStreak < a.threshold);
  if (nextStreak) next.push({ ...nextStreak, unlockedAt: undefined });

  // Get next consistency achievement
  const nextConsistency = CONSISTENCY_ACHIEVEMENTS.find(a => stats.completionRate < a.threshold);
  if (nextConsistency) next.push({ ...nextConsistency, unlockedAt: undefined });

  // Get next total achievement
  const nextTotal = TOTAL_ACHIEVEMENTS.find(a => stats.totalCompletions < a.threshold);
  if (nextTotal) next.push({ ...nextTotal, unlockedAt: undefined });

  return next;
};
