import { format } from 'date-fns';
import { Trophy, Flame, CalendarCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSoft75 } from '@/hooks/useSoft75';
import { StartChallengeDialog } from './StartChallengeDialog';
import { EditRulesDialog } from './EditRulesDialog';
import { Soft75Checklist } from './Soft75Checklist';
import { Soft75Grid } from './Soft75Grid';

export const Soft75View = () => {
  const {
    loading,
    challenge,
    rules,
    logs,
    dayNumber,
    completedDaysCount,
    activeRulesForDate,
    dayStatuses,
    createChallenge,
    addRule,
    updateRule,
    archiveRule,
    toggleLog,
    endChallenge,
  } = useSoft75();

  const today = format(new Date(), 'yyyy-MM-dd');

  if (loading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!challenge) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">Soft 75 Challenge</h2>
          <p className="text-muted-foreground">
            Define your own daily rules and commit to 75 days of growth. Lenient mode — missing a day doesn't reset your progress.
          </p>
          <StartChallengeDialog onCreate={createChallenge} />
        </div>
      </div>
    );
  }

  const todaysRules = activeRulesForDate(today);
  const days = dayStatuses();
  const cappedDay = Math.min(Math.max(dayNumber, 1), 75);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">Soft 75 Challenge</h1>
            <p className="text-muted-foreground mt-1">
              Day {cappedDay} of 75 · Started {format(new Date(challenge.start_date), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <EditRulesDialog rules={rules} onAdd={addRule} onUpdate={updateRule} onArchive={archiveRule} />
            <Button variant="outline" size="sm" onClick={endChallenge}>
              <X className="w-4 h-4 mr-2" /> End
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <CalendarCheck className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">{completedDaysCount}</p>
            <p className="text-xs text-muted-foreground">Days Complete</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Flame className="w-5 h-5 text-streak mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">{cappedDay}</p>
            <p className="text-xs text-muted-foreground">Current Day</p>
          </div>
          <div className="glass rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <Trophy className="w-5 h-5 text-streak mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">{Math.round((completedDaysCount / 75) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>

        {/* Today's Checklist */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-display text-xl font-bold mb-1">Today's Checklist</h2>
          <p className="text-sm text-muted-foreground mb-4">{format(new Date(), 'EEEE, MMMM d')}</p>
          {todaysRules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active rules. Add some via Edit Rules.</p>
          ) : (
            <Soft75Checklist rules={todaysRules} logs={logs} date={today} onToggle={toggleLog} />
          )}
        </div>

        {/* 75-day grid */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-display text-xl font-bold mb-4">75-Day Progress</h2>
          <Soft75Grid days={days} />
        </div>
      </div>
    </ScrollArea>
  );
};
