import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isFuture, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HabitCalendarProps {
  completedDates: string[];
  onToggle: (date: string) => void;
  color: string;
}

export const HabitCalendar = ({ completedDates, onToggle, color }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (!isFuture(startOfMonth(next))) {
      setCurrentMonth(next);
    }
  };

  const handleDayClick = (date: Date) => {
    if (isFuture(date) && !isToday(date)) return;
    onToggle(format(date, 'yyyy-MM-dd'));
  };

  const isCompleted = (date: Date) => {
    return completedDates.includes(format(date, 'yyyy-MM-dd'));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextMonth} 
          className="h-8 w-8"
          disabled={isFuture(startOfMonth(addMonths(currentMonth, 1)))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((date) => {
          const completed = isCompleted(date);
          const today = isToday(date);
          const future = isFuture(date) && !today;

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              disabled={future}
              className={cn(
                "aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-all",
                completed && "text-white",
                !completed && !future && "hover:bg-muted",
                today && !completed && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                future && "opacity-30 cursor-not-allowed"
              )}
              style={{
                backgroundColor: completed ? color : undefined,
              }}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: color }}
          />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm ring-2 ring-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
