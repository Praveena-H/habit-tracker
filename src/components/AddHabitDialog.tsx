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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { FrequencyType } from '@/types/habit';

const COLOR_OPTIONS = [
  'hsl(174, 72%, 46%)', // Primary cyan
  'hsl(142, 70%, 45%)', // Success green
  'hsl(35, 95%, 55%)',  // Streak orange
  'hsl(15, 85%, 60%)',  // Accent coral
  'hsl(262, 80%, 60%)', // Purple
  'hsl(199, 89%, 48%)', // Blue
  'hsl(340, 82%, 52%)', // Pink
  'hsl(45, 93%, 47%)',  // Yellow
];

const DAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

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

interface AddHabitDialogProps {
  onAdd: (params: AddHabitParams) => void;
}

export const AddHabitDialog = ({ onAdd }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderTime, setReminderTime] = useState('');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      name: name.trim(),
      emoji,
      color,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      reminderTime: reminderTime || undefined,
      goal: goal ? parseInt(goal) : undefined,
      notes: notes.trim() || undefined,
    });
    
    // Reset form
    setName('');
    setEmoji('💪');
    setColor(COLOR_OPTIONS[0]);
    setFrequency('daily');
    setCustomDays([1, 2, 3, 4, 5]);
    setReminderTime('');
    setGoal('');
    setNotes('');
    setOpen(false);
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
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
      <DialogContent className="glass sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name & Icon */}
          <div className="flex gap-3 items-start">
            <div>
              <Label className="text-sm font-medium mb-2 block">Icon</Label>
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Habit Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Workout"
                className="bg-secondary/50 border-border"
                autoFocus
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
            <div className="flex gap-2 flex-wrap">
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

          {/* Frequency */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Frequency</Label>
            <Select value={frequency} onValueChange={(v: FrequencyType) => setFrequency(v)}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekdays">Weekdays only</SelectItem>
                <SelectItem value="weekends">Weekends only</SelectItem>
                <SelectItem value="custom">Specific days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days */}
          {frequency === 'custom' && (
            <div className="animate-fade-in">
              <Label className="text-sm font-medium mb-2 block">Select Days</Label>
              <div className="flex gap-1 flex-wrap">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleCustomDay(day.value)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      customDays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Time */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Reminder Time (optional)</Label>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-secondary/50 border-border w-auto"
            />
            <p className="text-xs text-muted-foreground mt-1">Visual reminder only, no notifications</p>
          </div>

          {/* Goal */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Target Streak Goal (optional)</Label>
            <Input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., 30 days"
              className="bg-secondary/50 border-border w-32"
              min="1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or motivation..."
              className="bg-secondary/50 border-border resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
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
