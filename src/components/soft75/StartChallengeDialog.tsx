import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Plus, Trash2, ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { NewRuleInput } from '@/hooks/useSoft75';

interface Props {
  onCreate: (startDate: string, rules: NewRuleInput[]) => Promise<void>;
}

interface DraftRule extends NewRuleInput {
  emoji: string;
}

export const StartChallengeDialog = ({ onCreate }: Props) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [drafts, setDrafts] = useState<DraftRule[]>([
    { emoji: '💪', label: '', description: '' },
  ]);

  const addDraft = () => {
    if (drafts.length >= 10) return;
    setDrafts((d) => [...d, { emoji: '⭐', label: '', description: '' }]);
  };
  const removeDraft = (i: number) => setDrafts((d) => d.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= drafts.length) return;
    const next = [...drafts];
    [next[i], next[j]] = [next[j], next[i]];
    setDrafts(next);
  };
  const update = (i: number, patch: Partial<DraftRule>) => {
    setDrafts((d) => d.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const valid = drafts.length > 0 && drafts.every((d) => d.label.trim().length > 0);
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    await onCreate(
      startDate,
      drafts.map((d) => ({ label: d.label.trim(), emoji: d.emoji, description: d.description?.trim() || undefined })),
    );
    setOpen(false);
    setDrafts([{ emoji: '💪', label: '', description: '' }]);
    setStartDate(today);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground" size="lg">
          <Trophy className="w-5 h-5 mr-2" />
          Start Soft 75 Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Start Your Soft 75 Challenge</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-secondary/50 w-auto"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Your Daily Rules ({drafts.length}/10)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addDraft} disabled={drafts.length >= 10}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {drafts.map((d, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                <div className="flex gap-2 items-start">
                  <EmojiPicker value={d.emoji} onChange={(e) => update(i, { emoji: e })} />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={d.label}
                      onChange={(e) => update(i, { label: e.target.value })}
                      placeholder="Rule name (e.g., Workout 45 min)"
                      className="bg-background"
                    />
                    <Textarea
                      value={d.description}
                      onChange={(e) => update(i, { description: e.target.value })}
                      placeholder="Description (optional)"
                      rows={1}
                      className="bg-background resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-1 justify-end">
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === drafts.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeDraft(i)} disabled={drafts.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={!valid} className="flex-1 gradient-primary text-primary-foreground">
              Start Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
