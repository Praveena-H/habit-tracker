import { useState } from 'react';
import { Habit, HabitStats } from '@/types/habit';
import { Check, Flame, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  habit: Habit;
  stats: HabitStats;
  isCompletedToday: boolean;
  onToggle: (date: string) => void;
  onDelete: () => void;
  isCompletedOnDate: (date: string) => boolean;
}

export const HabitCard = ({
  habit,
  stats,
  isCompletedToday,
  onToggle,
  onDelete,
  isCompletedOnDate,
}: HabitCardProps) => {
  const [justCompleted, setJustCompleted] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE')[0],
      isToday: i === 6,
    };
  });

  const handleToggle = () => {
    if (!isCompletedToday) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle(today);
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl p-4 sm:p-5 transition-all duration-300 group",
        "hover:shadow-lg hover:shadow-primary/5",
        isCompletedToday && "ring-2 ring-success/30"
      )}
      style={{ 
        '--habit-color': habit.color,
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className={cn(
              "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl",
              "transition-all duration-300 shrink-0",
              isCompletedToday
                ? "bg-success text-success-foreground animate-pulse-glow"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {isCompletedToday ? (
              <Check 
                className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7",
                  justCompleted && "animate-bounce-check"
                )} 
              />
            ) : (
              <span>{habit.emoji}</span>
            )}
          </button>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-foreground truncate">
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-streak">
                  <Flame className={cn(
                    "w-4 h-4",
                    stats.currentStreak >= 7 && "animate-flame"
                  )} />
                  <span className="text-sm font-medium">{stats.currentStreak}</span>
                </div>
              )}
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekly Progress */}
      <div className="flex justify-between gap-1 mt-4 px-1">
        {last7Days.map(({ date, day, isToday }) => {
          const completed = isCompletedOnDate(date);
          return (
            <button
              key={date}
              onClick={() => onToggle(date)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">
                {day}
              </span>
              <div
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  completed
                    ? "bg-success text-success-foreground"
                    : "bg-muted/50 hover:bg-muted",
                  isToday && !completed && "ring-2 ring-primary/30"
                )}
              >
                {completed && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Dropdown */}
      {showStats && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center animate-fade-in">
          <div>
            <p className="text-lg sm:text-xl font-display font-bold text-foreground">
              {stats.longestStreak}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-display font-bold text-foreground">
              {stats.totalCompletions}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-display font-bold text-foreground">
              {stats.completionRate}%
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">30d Rate</p>
          </div>
        </div>
      )}
    </div>
  );
};
