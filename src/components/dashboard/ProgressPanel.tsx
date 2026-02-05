import { Habit, HabitStats, FrequencyType } from '@/types/habit';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Target } from 'lucide-react';
import { format } from 'date-fns';
import { getUnlockedAchievements, getNextAchievements, ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface ProgressPanelProps {
  habits: Habit[];
  getStats: (habit: Habit) => HabitStats;
  isCompletedOnDate: (habit: Habit, date: string) => boolean;
  onAddHabit: (params: AddHabitParams) => void;
}

export const ProgressPanel = ({
  habits,
  getStats,
  isCompletedOnDate,
  onAddHabit,
}: ProgressPanelProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate overall stats
  const completedToday = habits.filter(h => isCompletedOnDate(h, today)).length;
  const totalHabits = habits.length;
  const dailyProgress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Get best streak across all habits
  const allStats = habits.map(h => getStats(h));
  const bestStreak = Math.max(...allStats.map(s => s.longestStreak), 0);
  const totalCompletions = allStats.reduce((sum, s) => sum + s.totalCompletions, 0);

  // Get aggregated achievements (using best stats)
  const aggregatedStats: HabitStats = {
    currentStreak: Math.max(...allStats.map(s => s.currentStreak), 0),
    longestStreak: bestStreak,
    totalCompletions,
    completionRate: allStats.length > 0 
      ? Math.round(allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length)
      : 0,
  };

  const unlockedAchievements = getUnlockedAchievements(aggregatedStats);
  const nextAchievements = getNextAchievements(aggregatedStats);

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-bold text-lg text-foreground">Progress</h2>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Daily Progress */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Today's Progress</span>
              <span className="text-sm text-muted-foreground">{completedToday}/{totalHabits}</span>
            </div>
            <Progress value={dailyProgress} className="h-3" />
            {dailyProgress === 100 && totalHabits > 0 && (
              <p className="text-xs text-success mt-2 font-medium">🎉 All habits completed!</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-streak mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{aggregatedStats.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground">Best Active Streak</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{totalCompletions}</p>
              <p className="text-[10px] text-muted-foreground">Total Completions</p>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-streak" />
              <span className="text-sm font-medium">Achievements</span>
              <span className="text-xs text-muted-foreground">
                ({unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})
              </span>
            </div>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={true}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">
                Complete habits to unlock achievements!
              </p>
            )}

            {/* Next Achievements */}
            {nextAchievements.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Next to unlock:</p>
                {nextAchievements.slice(0, 3).map((achievement) => {
                  let progress = 0;
                  if (achievement.type === 'streak') {
                    progress = (aggregatedStats.currentStreak / achievement.threshold) * 100;
                  } else if (achievement.type === 'consistency') {
                    progress = (aggregatedStats.completionRate / achievement.threshold) * 100;
                  } else if (achievement.type === 'total') {
                    progress = (aggregatedStats.totalCompletions / achievement.threshold) * 100;
                  }

                  return (
                    <div key={achievement.id} className="flex items-center gap-2">
                      <span className="text-sm opacity-50">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{achievement.name}</p>
                        <Progress value={Math.min(progress, 100)} className="h-1.5 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Add Habit Button */}
      <div className="p-4 border-t border-border">
        <AddHabitDialog onAdd={onAddHabit} />
      </div>
    </div>
  );
};
