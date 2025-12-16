import { Flame, Trophy, Target } from 'lucide-react';
import { Habit } from '@/types/habit';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StreakBannerProps {
  habits: Habit[];
  getStats: (habit: Habit) => { currentStreak: number };
}

export const StreakBanner = ({ habits, getStats }: StreakBannerProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const completedToday = habits.filter(h => 
    h.completedDates.includes(today)
  ).length;
  
  const totalHabits = habits.length;
  const allCompleted = totalHabits > 0 && completedToday === totalHabits;
  
  const bestStreak = habits.reduce((max, habit) => {
    const stats = getStats(habit);
    return Math.max(max, stats.currentStreak);
  }, 0);

  if (totalHabits === 0) return null;

  return (
    <div className={cn(
      "glass rounded-2xl p-4 sm:p-6 transition-all duration-500",
      allCompleted && "gradient-streak glow-streak"
    )}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center",
            allCompleted 
              ? "bg-background/20" 
              : "bg-secondary"
          )}>
            {allCompleted ? (
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-accent-foreground animate-float" />
            ) : (
              <Target className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
            )}
          </div>
          <div>
            <h2 className={cn(
              "font-display font-bold text-lg sm:text-xl",
              allCompleted ? "text-accent-foreground" : "text-foreground"
            )}>
              {allCompleted ? "Perfect Day! 🎉" : "Today's Progress"}
            </h2>
            <p className={cn(
              "text-sm",
              allCompleted ? "text-accent-foreground/80" : "text-muted-foreground"
            )}>
              {completedToday} of {totalHabits} habits completed
            </p>
          </div>
        </div>

        {bestStreak > 0 && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            allCompleted 
              ? "bg-background/20 text-accent-foreground" 
              : "bg-streak/10 text-streak"
          )}>
            <Flame className={cn(
              "w-5 h-5",
              bestStreak >= 7 && "animate-flame"
            )} />
            <span className="font-display font-bold text-lg">{bestStreak}</span>
            <span className="text-sm opacity-80">day streak</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className={cn(
          "h-2 rounded-full overflow-hidden",
          allCompleted ? "bg-background/20" : "bg-secondary"
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allCompleted ? "bg-accent-foreground" : "gradient-primary"
            )}
            style={{ width: `${(completedToday / totalHabits) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
