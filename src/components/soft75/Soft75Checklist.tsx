import { format } from 'date-fns';
import { Soft75Rule, Soft75Log } from '@/hooks/useSoft75';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Props {
  rules: Soft75Rule[];
  logs: Soft75Log[];
  date: string;
  onToggle: (ruleId: string, date: string) => void;
}

export const Soft75Checklist = ({ rules, logs, date, onToggle }: Props) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isFuture = date > today;

  return (
    <div className="space-y-2">
      {rules.map((r) => {
        const checked = logs.some((l) => l.rule_id === r.id && l.log_date === date);
        return (
          <button
            key={r.id}
            type="button"
            disabled={isFuture}
            onClick={() => onToggle(r.id, date)}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card transition-all text-left',
              checked && 'bg-primary/10 border-primary/40',
              isFuture && 'opacity-50 cursor-not-allowed',
              !isFuture && 'hover:bg-secondary/50',
            )}
          >
            <Checkbox checked={checked} className="pointer-events-none" />
            <span className="text-2xl">{r.emoji || '⭐'}</span>
            <div className="flex-1 min-w-0">
              <div className={cn('font-medium', checked && 'line-through text-muted-foreground')}>{r.label}</div>
              {r.description && <div className="text-xs text-muted-foreground truncate">{r.description}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
};
