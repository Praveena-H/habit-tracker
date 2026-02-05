import { useHabits } from '@/hooks/useHabits';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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

  return (
    <>
      <Helmet>
        <title>Habit Tracker | Build Better Habits Daily</title>
        <meta name="description" content="Track your daily habits, build streaks, and transform your life with our beautiful habit tracking app." />
      </Helmet>
      
      <DashboardLayout
        habits={habits}
        addHabit={addHabit}
        deleteHabit={deleteHabit}
        toggleHabitCompletion={toggleHabitCompletion}
        isHabitCompletedOnDate={isHabitCompletedOnDate}
        getHabitStats={getHabitStats}
      />
    </>
  );
};

export default Index;
