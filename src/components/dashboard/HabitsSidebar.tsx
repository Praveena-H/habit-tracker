import { Habit, HabitStats } from '@/types/habit';
import { Flame, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HabitsSidebarProps {
  habits: Habit[];
  selectedHabitId: string | null;
  onSelectHabit: (habitId: string) => void;
  getStats: (habit: Habit) => HabitStats;
  isCompletedOnDate: (habit: Habit, date: string) => boolean;
}

export const HabitsSidebar = ({
  habits,
  selectedHabitId,
  onSelectHabit,
  getStats,
  isCompletedOnDate,
}: HabitsSidebarProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-bold text-lg text-foreground">My Habits</h2>
        <p className="text-sm text-muted-foreground">{habits.length} habits tracked</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {habits.map((habit) => {
            const stats = getStats(habit);
            const isSelected = habit.id === selectedHabitId;
            const isCompletedToday = isCompletedOnDate(habit, today);

            return (
              <button
                key={habit.id}
                onClick={() => onSelectHabit(habit.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                  isSelected
                    ? "bg-primary/10 ring-2 ring-primary/30"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Emoji/Check indicator */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 transition-all",
                    isCompletedToday ? "text-white" : "bg-secondary"
                  )}
                  style={{
                    backgroundColor: isCompletedToday ? habit.color : undefined,
                  }}
                >
                  {isCompletedToday ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{habit.emoji}</span>
                  )}
                </div>

                {/* Habit info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {habit.name}
                  </p>
                  {stats.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-streak">
                      <Flame className={cn(
                        "w-3 h-3",
                        stats.currentStreak >= 7 && "animate-flame"
                      )} />
                      <span className="text-xs font-medium">{stats.currentStreak} day streak</span>
                    </div>
                  )}
                  {stats.currentStreak === 0 && (
                    <span className="text-xs text-muted-foreground">No active streak</span>
                  )}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
                )}
              </button>
            );
          })}

          {habits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No habits yet</p>
              <p className="text-xs mt-1">Add your first habit to get started!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
