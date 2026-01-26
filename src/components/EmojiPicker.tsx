import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const EMOJI_CATEGORIES = {
  'Activities': ['💪', '🏃', '🧘', '🚴', '🏋️', '⚽', '🎾', '🏊', '🎯', '🎮', '🎨', '🎵', '📚', '✍️', '🎬'],
  'Health': ['💊', '💧', '🥗', '🍎', '🥦', '😴', '🧠', '❤️', '🫀', '🦷', '👁️', '🌿', '☀️'],
  'Work': ['💼', '📊', '💻', '📱', '📝', '📧', '🗓️', '⏰', '🎓', '📖', '🔬', '💡'],
  'Lifestyle': ['🏠', '🧹', '🌱', '🐕', '🐈', '💰', '🛒', '🚗', '✈️', '🎁', '📸', '🎤'],
  'Social': ['👥', '💬', '❤️', '🤝', '👋', '📞', '✉️', '🎂', '🎉', '🙏'],
  'Mindfulness': ['🧘', '🙏', '☮️', '🕯️', '🌸', '🦋', '🌈', '⭐', '🌙', '🔮'],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export const EmojiPicker = ({ value, onChange }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Activities');

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-16 h-16 text-3xl bg-secondary hover:bg-secondary/80"
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="flex gap-1 pb-1 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="text-xs whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="h-48 p-2">
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className={cn(
                  "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all hover:bg-secondary",
                  value === emoji && "bg-primary text-primary-foreground"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
