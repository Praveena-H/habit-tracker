import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['💪', '📚', '🏃', '💧', '🧘', '😴', '🥗', '✍️', '🎯', '💊', '🎨', '🎵'];
const COLOR_OPTIONS = [
  'hsl(174, 72%, 46%)', // Primary cyan
  'hsl(142, 70%, 45%)', // Success green
  'hsl(35, 95%, 55%)',  // Streak orange
  'hsl(15, 85%, 60%)',  // Accent coral
  'hsl(262, 80%, 60%)', // Purple
  'hsl(199, 89%, 48%)', // Blue
];

interface AddHabitDialogProps {
  onAdd: (name: string, emoji: string, color: string) => void;
}

export const AddHabitDialog = ({ onAdd }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd(name.trim(), emoji, color);
    setName('');
    setEmoji(EMOJI_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-opacity"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Habit Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Workout"
              className="bg-secondary/50 border-border"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                    emoji === e
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Accent Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c ? "scale-125 ring-2 ring-offset-2 ring-offset-background ring-foreground/20" : ""
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
