import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { StreakBanner } from '@/components/StreakBanner';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet';

const Index = () => {
  const { 
    habits, 
    addHabit, 
    deleteHabit, 
    toggleHabitCompletion, 
    isHabitCompletedOnDate,
    getHabitStats 
  } = useHabits();

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <Helmet>
        <title>Habit Tracker | Build Better Habits Daily</title>
        <meta name="description" content="Track your daily habits, build streaks, and transform your life with our beautiful habit tracking app." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Background Decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 py-6 sm:py-10">
          {/* Header */}
          <header className="text-center mb-8 sm:mb-10 animate-fade-in">
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gradient mb-2">
              Habit Tracker
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </header>

          {/* Streak Banner */}
          <div className="mb-6 sm:mb-8" style={{ animationDelay: '0.1s' }}>
            <StreakBanner habits={habits} getStats={getHabitStats} />
          </div>

          {/* Add Habit Button */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <AddHabitDialog onAdd={addHabit} />
          </div>

          {/* Habits List */}
          <div className="space-y-4">
            {habits.length === 0 ? (
              <EmptyState />
            ) : (
              habits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <HabitCard
                    habit={habit}
                    stats={getHabitStats(habit)}
                    isCompletedToday={isHabitCompletedOnDate(habit, today)}
                    onToggle={(date) => toggleHabitCompletion(habit.id, date)}
                    onDelete={() => deleteHabit(habit.id)}
                    isCompletedOnDate={(date) => isHabitCompletedOnDate(habit, date)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 sm:mt-16 text-center text-sm text-muted-foreground pb-8">
            <p>Built with React + TypeScript + Tailwind</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;
