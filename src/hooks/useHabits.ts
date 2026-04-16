import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitStats, FrequencyType } from '@/types/habit';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LEGACY_KEY = 'habit-tracker-habits';

interface AddHabitParams {
  name: string;
  emoji: string;
  color: string;
  frequency?: FrequencyType;
  customDays?: number[];
  reminderTime?: string;
  goal?: number;
  notes?: string;
}

type DbHabit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: string;
  custom_days: number[] | null;
  reminder_time: string | null;
  goal: number | null;
  notes: string | null;
  completed_dates: string[];
  created_at: string;
};

const mapDbHabit = (h: DbHabit): Habit => ({
  id: h.id,
  name: h.name,
  emoji: h.emoji,
  color: h.color,
  frequency: (h.frequency as FrequencyType) || 'daily',
  customDays: h.custom_days ?? undefined,
  reminderTime: h.reminder_time ?? undefined,
  goal: h.goal ?? undefined,
  notes: h.notes ?? undefined,
  completedDates: h.completed_dates ?? [],
  createdAt: h.created_at,
});

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      toast.error('Failed to load habits');
      return;
    }
    setHabits((data as DbHabit[]).map(mapDbHabit));
  }, [user]);

  // One-time migration of localStorage habits
  useEffect(() => {
    if (!user) return;
    const migrate = async () => {
      try {
        const raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          const legacy = JSON.parse(raw) as Habit[];
          if (Array.isArray(legacy) && legacy.length > 0) {
            const rows = legacy.map((h) => ({
              user_id: user.id,
              name: h.name,
              emoji: h.emoji || '💪',
              color: h.color,
              frequency: h.frequency || 'daily',
              custom_days: h.customDays ?? null,
              reminder_time: h.reminderTime ?? null,
              goal: h.goal ?? null,
              notes: h.notes ?? null,
              completed_dates: h.completedDates ?? [],
            }));
            const { error } = await supabase.from('habits').insert(rows);
            if (!error) {
              localStorage.removeItem(LEGACY_KEY);
              toast.success(`Migrated ${rows.length} habit(s) from local storage`);
            }
          } else {
            localStorage.removeItem(LEGACY_KEY);
          }
        }
      } catch {
        // ignore
      }
      await refresh();
      setLoading(false);
    };
    migrate();
  }, [user, refresh]);

  const addHabit = useCallback(async (params: AddHabitParams) => {
    if (!user) return;
    const { data, error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: params.name,
      emoji: params.emoji,
      color: params.color,
      frequency: params.frequency || 'daily',
      custom_days: params.customDays ?? null,
      reminder_time: params.reminderTime ?? null,
      goal: params.goal ?? null,
      notes: params.notes ?? null,
      completed_dates: [],
    }).select().single();
    if (error) {
      toast.error('Failed to add habit');
      return;
    }
    setHabits((prev) => [...prev, mapDbHabit(data as DbHabit)]);
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete habit');
      return;
    }
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleHabitCompletion = useCallback(async (id: string, date: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const isCompleted = habit.completedDates.includes(date);
    const next = isCompleted
      ? habit.completedDates.filter((d) => d !== date)
      : [...habit.completedDates, date];

    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completedDates: next } : h)));

    const { error } = await supabase.from('habits').update({ completed_dates: next }).eq('id', id);
    if (error) {
      toast.error('Failed to update habit');
      // revert
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completedDates: habit.completedDates } : h)));
    }
  }, [habits]);

  const isHabitCompletedOnDate = useCallback((habit: Habit, date: string) => {
    return habit.completedDates.includes(date);
  }, []);

  const getHabitStats = useCallback((habit: Habit): HabitStats => {
    const today = startOfDay(new Date());
    let currentStreak = 0;
    let checkDate = today;
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (i === 0) {
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

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

    const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
    const completionsInLast30 = last30Days.filter((d) => habit.completedDates.includes(d)).length;

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalCompletions: habit.completedDates.length,
      completionRate: Math.round((completionsInLast30 / 30) * 100),
    };
  }, []);

  return {
    habits,
    loading,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    isHabitCompletedOnDate,
    getHabitStats,
  };
};
