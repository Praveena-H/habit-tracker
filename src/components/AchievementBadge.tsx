import { Achievement } from '@/types/habit';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({ achievement, unlocked, size = 'md' }: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-all",
            sizeClasses[size],
            unlocked
              ? "bg-gradient-to-br from-streak to-accent shadow-lg animate-pulse-glow"
              : "bg-muted/50 grayscale opacity-40"
          )}
        >
          <span className={cn(!unlocked && "opacity-50")}>
            {achievement.icon}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {!unlocked && (
            <p className="text-xs text-muted-foreground mt-1">🔒 Locked</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
