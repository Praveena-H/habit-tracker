import { useState, useEffect } from 'react';
import { Habit, HabitStats, FrequencyType } from '@/types/habit';
import { HabitsSidebar } from './HabitsSidebar';
import { HabitDetailView } from './HabitDetailView';
import { ProgressPanel } from './ProgressPanel';
import { EmptyState } from '@/components/EmptyState';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface DashboardLayoutProps {
  habits: Habit[];
  addHabit: (params: AddHabitParams) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  isHabitCompletedOnDate: (habit: Habit, date: string) => boolean;
  getHabitStats: (habit: Habit) => HabitStats;
}

export const DashboardLayout = ({
  habits,
  addHabit,
  deleteHabit,
  toggleHabitCompletion,
  isHabitCompletedOnDate,
  getHabitStats,
}: DashboardLayoutProps) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const isMobile = useIsMobile();

  // Auto-select first habit when habits change
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    } else if (habits.length > 0 && selectedHabitId && !habits.find(h => h.id === selectedHabitId)) {
      setSelectedHabitId(habits[0].id);
    } else if (habits.length === 0) {
      setSelectedHabitId(null);
    }
  }, [habits, selectedHabitId]);

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  // Close mobile panels when selecting a habit
  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <EmptyState />
          <div className="mt-6 flex justify-center">
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Habit Tracker</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProgress(!showProgress)}
          >
            🏆
          </Button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "shrink-0 transition-all duration-300",
          isMobile
            ? cn(
                "fixed top-14 left-0 bottom-0 z-50 w-72",
                showSidebar ? "translate-x-0" : "-translate-x-full"
              )
            : "w-64"
        )}
      >
        <HabitsSidebar
          habits={habits}
          selectedHabitId={selectedHabitId}
          onSelectHabit={handleSelectHabit}
          getStats={getHabitStats}
          isCompletedOnDate={isHabitCompletedOnDate}
        />
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-w-0 overflow-hidden",
          isMobile && "pt-14"
        )}
      >
        {selectedHabit ? (
          <HabitDetailView
            habit={selectedHabit}
            stats={getHabitStats(selectedHabit)}
            isCompletedToday={isHabitCompletedOnDate(selectedHabit, new Date().toISOString().split('T')[0])}
            onToggle={(date) => toggleHabitCompletion(selectedHabit.id, date)}
            onDelete={() => deleteHabit(selectedHabit.id)}
            isCompletedOnDate={(date) => isHabitCompletedOnDate(selectedHabit, date)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select a habit to view details</p>
          </div>
        )}
      </main>

      {/* Mobile Progress Overlay */}
      {isMobile && showProgress && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setShowProgress(false)}
        />
      )}

      {/* Right Panel */}
      <aside
        className={cn(
          "shrink-0 transition-all duration-300",
          isMobile
            ? cn(
                "fixed top-14 right-0 bottom-0 z-50 w-72",
                showProgress ? "translate-x-0" : "translate-x-full"
              )
            : "w-72"
        )}
      >
        <ProgressPanel
          habits={habits}
          getStats={getHabitStats}
          isCompletedOnDate={isHabitCompletedOnDate}
          onAddHabit={addHabit}
        />
      </aside>
    </div>
  );
};
