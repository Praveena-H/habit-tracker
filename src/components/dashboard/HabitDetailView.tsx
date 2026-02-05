import { useState } from 'react';
import { Habit, HabitStats } from '@/types/habit';
import { Check, Flame, Trash2, Target, StickyNote, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, isFuture, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { HabitCalendar } from '@/components/HabitCalendar';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HabitDetailViewProps {
  habit: Habit;
  stats: HabitStats;
  isCompletedToday: boolean;
  onToggle: (date: string) => void;
  onDelete: () => void;
  isCompletedOnDate: (date: string) => boolean;
}

export const HabitDetailView = ({
  habit,
  stats,
  isCompletedToday,
  onToggle,
  onDelete,
  isCompletedOnDate,
}: HabitDetailViewProps) => {
  const [justCompleted, setJustCompleted] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayShort: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: isToday(date),
      isFuture: isFuture(date) && !isToday(date),
    };
  });

  const handleToggle = () => {
    if (!isCompletedToday) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle(today);
  };

  const handleDayToggle = (date: string) => {
    const dateObj = new Date(date);
    if (isFuture(dateObj) && !isToday(dateObj)) return;
    onToggle(date);
  };

  const goalProgress = habit.goal ? (stats.currentStreak / habit.goal) * 100 : null;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            className={cn(
              "relative w-16 h-16 rounded-2xl flex items-center justify-center text-4xl",
              "transition-all duration-300 shrink-0",
              isCompletedToday
                ? "text-white animate-pulse-glow"
                : "bg-secondary hover:bg-secondary/80"
            )}
            style={{
              backgroundColor: isCompletedToday ? habit.color : undefined,
            }}
          >
            {isCompletedToday ? (
              <Check 
                className={cn(
                  "w-8 h-8",
                  justCompleted && "animate-bounce-check"
                )} 
              />
            ) : (
              <span>{habit.emoji}</span>
            )}
          </button>
          
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              {habit.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-streak">
                  <Flame className={cn(
                    "w-5 h-5",
                    stats.currentStreak >= 7 && "animate-flame"
                  )} />
                  <span className="font-semibold">{stats.currentStreak} day streak</span>
                </div>
              )}
              {habit.reminderTime && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {habit.reminderTime}
                </span>
              )}
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete habit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{habit.name}" and all its progress data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Goal Progress */}
      {habit.goal && (
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Goal Progress</span>
          </div>
          <Progress value={Math.min(goalProgress || 0, 100)} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {stats.currentStreak} of {habit.goal} days completed
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-streak">{stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{stats.longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{stats.totalCompletions}</p>
          <p className="text-xs text-muted-foreground">Total Days</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{stats.completionRate}%</p>
          <p className="text-xs text-muted-foreground">30d Rate</p>
        </div>
      </div>

      {/* Notes */}
      {habit.notes && (
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Notes</span>
          </div>
          <p className="text-sm text-muted-foreground">{habit.notes}</p>
        </div>
      )}

      {/* Weekly Progress */}
      <div className="glass rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium mb-3">This Week</h3>
        <div className="flex justify-between gap-1">
          {last7Days.map(({ date, dayShort, dayNum, isToday: today, isFuture: future }) => {
            const completed = isCompletedOnDate(date);
            return (
              <Tooltip key={date}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDayToggle(date)}
                    disabled={future}
                    className={cn(
                      "flex flex-col items-center gap-1 flex-1",
                      future && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{dayShort}</span>
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 text-xs font-medium",
                        completed && "text-white",
                        !completed && !future && "bg-muted/50 hover:bg-muted",
                        today && !completed && "ring-2 ring-primary/30"
                      )}
                      style={{
                        backgroundColor: completed ? habit.color : undefined,
                      }}
                    >
                      {completed ? <Check className="w-4 h-4" /> : dayNum}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(new Date(date), 'EEEE, MMMM d')}</p>
                  {future && <p className="text-xs text-muted-foreground">Future date</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Calendar View */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3">Calendar</h3>
        <HabitCalendar
          completedDates={habit.completedDates}
          onToggle={handleDayToggle}
          color={habit.color}
        />
      </div>
    </div>
  );
};
