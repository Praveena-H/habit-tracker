import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitStats } from '@/types/habit';
import { format, subDays, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';

const STORAGE_KEY = 'habit-tracker-habits';

const getStoredHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(getStoredHabits);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = useCallback((name: string, emoji: string, color: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      emoji,
      color,
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const toggleHabitCompletion = useCallback((id: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      
      const dateStr = date;
      const isCompleted = habit.completedDates.includes(dateStr);
      
      return {
        ...habit,
        completedDates: isCompleted
          ? habit.completedDates.filter(d => d !== dateStr)
          : [...habit.completedDates, dateStr],
      };
    }));
  }, []);

  const isHabitCompletedOnDate = useCallback((habit: Habit, date: string) => {
    return habit.completedDates.includes(date);
  }, []);

  const getHabitStats = useCallback((habit: Habit): HabitStats => {
    const today = startOfDay(new Date());
    const sortedDates = [...habit.completedDates]
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = today;
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (i === 0) {
        // If today isn't completed, check if yesterday was
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const createdDate = startOfDay(new Date(habit.createdAt));
    
    for (let i = 0; i <= differenceInDays(today, createdDate); i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate completion rate (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => 
      format(subDays(today, i), 'yyyy-MM-dd')
    );
    const completionsInLast30 = last30Days.filter(d => 
      habit.completedDates.includes(d)
    ).length;

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalCompletions: habit.completedDates.length,
      completionRate: Math.round((completionsInLast30 / 30) * 100),
    };
  }, []);

  return {
    habits,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    isHabitCompletedOnDate,
    getHabitStats,
  };
};
