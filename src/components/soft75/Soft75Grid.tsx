import { cn } from '@/lib/utils';

interface DayStatus {
  date: string;
  status: 'complete' | 'partial' | 'missed' | 'future';
}

interface Props {
  days: DayStatus[];
}

export const Soft75Grid = ({ days }: Props) => {
  return (
    <div>
      <div className="grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
        {days.map((d, i) => (
          <div
            key={d.date}
            title={`Day ${i + 1} — ${d.date} — ${d.status}`}
            className={cn(
              'aspect-square rounded-md flex items-center justify-center text-[10px] font-medium',
              d.status === 'complete' && 'bg-primary text-primary-foreground',
              d.status === 'partial' && 'bg-streak/60 text-foreground',
              d.status === 'missed' && 'bg-destructive/30 text-foreground',
              d.status === 'future' && 'bg-secondary/40 text-muted-foreground',
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> Complete</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-streak/60 inline-block" /> Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-destructive/30 inline-block" /> Missed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary/40 inline-block" /> Upcoming</span>
      </div>
    </div>
  );
};
