import { useState, useEffect } from 'react';
import { Habit, HabitStats, FrequencyType } from '@/types/habit';
import { HabitsSidebar } from './HabitsSidebar';
import { HabitDetailView } from './HabitDetailView';
import { ProgressPanel } from './ProgressPanel';
import { EmptyState } from '@/components/EmptyState';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { Soft75View } from '@/components/soft75/Soft75View';
import { Menu, LogOut, Trophy, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

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

type Tab = 'habits' | 'soft75';

export const DashboardLayout = ({
  habits,
  addHabit,
  deleteHabit,
  toggleHabitCompletion,
  isHabitCompletedOnDate,
  getHabitStats,
}: DashboardLayoutProps) => {
  const [tab, setTab] = useState<Tab>('habits');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

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

  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    if (isMobile) setShowSidebar(false);
  };

  const TabToggle = (
    <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
      <button
        onClick={() => setTab('habits')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          tab === 'habits' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <ListChecks className="w-4 h-4" /> Habits
      </button>
      <button
        onClick={() => setTab('soft75')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          tab === 'soft75' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Trophy className="w-4 h-4" /> Soft 75
      </button>
    </div>
  );

  const showHabitsEmptyState = tab === 'habits' && habits.length === 0;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-[220px]">{TabToggle}</div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowSidebar(false)} />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          'shrink-0 transition-all duration-300 flex flex-col bg-card/50 backdrop-blur-sm border-r border-border',
          isMobile
            ? cn('fixed top-14 left-0 bottom-0 z-50 w-72', showSidebar ? 'translate-x-0' : '-translate-x-full')
            : 'w-64',
        )}
      >
        {!isMobile && (
          <div className="p-3 border-b border-border space-y-2">
            {TabToggle}
          </div>
        )}
        {tab === 'habits' ? (
          <div className="flex-1 overflow-hidden">
            <HabitsSidebar
              habits={habits}
              selectedHabitId={selectedHabitId}
              onSelectHabit={handleSelectHabit}
              getStats={getHabitStats}
              isCompletedOnDate={isHabitCompletedOnDate}
            />
          </div>
        ) : (
          <div className="flex-1 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Soft 75 Challenge</p>
            <p>Your custom 75-day challenge with personalized daily rules. Stay consistent — misses don't reset.</p>
          </div>
        )}
        {!isMobile && (
          <div className="p-3 border-t border-border">
            <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 min-w-0 overflow-hidden', isMobile && 'pt-14')}>
        {tab === 'habits' ? (
          showHabitsEmptyState ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <EmptyState />
                <div className="mt-6 flex justify-center">
                  <AddHabitDialog onAdd={addHabit} />
                </div>
              </div>
            </div>
          ) : selectedHabit ? (
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
          )
        ) : (
          <Soft75View />
        )}
      </main>

      {/* Mobile Progress Overlay */}
      {isMobile && showProgress && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowProgress(false)} />
      )}

      {/* Right Panel — only for habits tab on desktop */}
      {tab === 'habits' && (
        <aside
          className={cn(
            'shrink-0 transition-all duration-300',
            isMobile
              ? cn('fixed top-14 right-0 bottom-0 z-50 w-72', showProgress ? 'translate-x-0' : 'translate-x-full')
              : 'w-72',
          )}
        >
          <ProgressPanel
            habits={habits}
            getStats={getHabitStats}
            isCompletedOnDate={isHabitCompletedOnDate}
            onAddHabit={addHabit}
          />
        </aside>
      )}
    </div>
  );
};
