import { useState } from 'react';
import { Habit, HabitStats } from '@/types/habit';
import { Check, Flame, Trash2, TrendingUp, Calendar, Trophy, Clock, Target, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, isFuture, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { HabitCalendar } from './HabitCalendar';
import { AchievementsDisplay } from './AchievementsDisplay';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

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
    // Prevent toggling future dates
    if (isFuture(dateObj) && !isToday(dateObj)) return;
    onToggle(date);
  };

  const goalProgress = habit.goal ? (stats.currentStreak / habit.goal) * 100 : null;

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
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-streak">
                  <Flame className={cn(
                    "w-4 h-4",
                    stats.currentStreak >= 7 && "animate-flame"
                  )} />
                  <span className="text-sm font-medium">{stats.currentStreak}</span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        showStats ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Stats</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        showCalendar ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Calendar</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowAchievements(!showAchievements)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        showAchievements ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Trophy className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Achievements</TooltipContent>
                </Tooltip>
              </div>

              {/* Habit Info Badges */}
              {habit.reminderTime && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      {habit.reminderTime}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Reminder time</TooltipContent>
                </Tooltip>
              )}
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

      {/* Goal Progress */}
      {habit.goal && (
        <div className="mt-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground shrink-0" />
          <Progress value={Math.min(goalProgress || 0, 100)} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {stats.currentStreak}/{habit.goal} days
          </span>
        </div>
      )}

      {/* Notes */}
      {habit.notes && (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
          <p className="line-clamp-2">{habit.notes}</p>
        </div>
      )}

      {/* Weekly Progress - Enhanced */}
      <div className="flex justify-between gap-1 mt-4 px-1">
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
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {dayShort}
                  </span>
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-[10px] sm:text-xs font-medium",
                      completed && "text-white",
                      !completed && !future && "bg-muted/50 hover:bg-muted",
                      today && !completed && "ring-2 ring-primary/30"
                    )}
                    style={{
                      backgroundColor: completed ? habit.color : undefined,
                    }}
                  >
                    {completed ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : dayNum}
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

      {/* Calendar View */}
      {showCalendar && (
        <HabitCalendar
          completedDates={habit.completedDates}
          onToggle={handleDayToggle}
          color={habit.color}
        />
      )}

      {/* Achievements View */}
      {showAchievements && (
        <AchievementsDisplay stats={stats} />
      )}
    </div>
  );
};
