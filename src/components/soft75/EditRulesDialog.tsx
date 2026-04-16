import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Soft75Rule, NewRuleInput } from '@/hooks/useSoft75';

interface Props {
  rules: Soft75Rule[];
  onAdd: (input: NewRuleInput) => Promise<void>;
  onUpdate: (id: string, patch: Partial<NewRuleInput>) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
}

export const EditRulesDialog = ({ rules, onAdd, onUpdate, onArchive }: Props) => {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const [newDesc, setNewDesc] = useState('');

  const active = rules.filter((r) => !r.archived_at);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    await onAdd({ label: newLabel.trim(), emoji: newEmoji, description: newDesc.trim() || undefined });
    setNewLabel('');
    setNewDesc('');
    setNewEmoji('⭐');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" /> Edit Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Challenge Rules</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-3">
            {active.map((r) => (
              <div key={r.id} className="p-3 rounded-lg border border-border bg-secondary/30">
                <div className="flex gap-2 items-start">
                  <EmojiPicker value={r.emoji || '⭐'} onChange={(e) => onUpdate(r.id, { emoji: e })} />
                  <div className="flex-1 space-y-2">
                    <Input
                      defaultValue={r.label}
                      onBlur={(e) => e.target.value !== r.label && onUpdate(r.id, { label: e.target.value })}
                      className="bg-background"
                    />
                    <Textarea
                      defaultValue={r.description ?? ''}
                      onBlur={(e) => (e.target.value || '') !== (r.description || '') && onUpdate(r.id, { description: e.target.value })}
                      rows={1}
                      placeholder="Description (optional)"
                      className="bg-background resize-none"
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => onArchive(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg border border-dashed border-border">
            <Label className="text-sm font-medium mb-2 block">Add New Rule</Label>
            <div className="flex gap-2 items-start">
              <EmojiPicker value={newEmoji} onChange={setNewEmoji} />
              <div className="flex-1 space-y-2">
                <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Rule name" className="bg-background" />
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={1} className="bg-background resize-none" />
              </div>
              <Button onClick={handleAdd} disabled={!newLabel.trim()} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
