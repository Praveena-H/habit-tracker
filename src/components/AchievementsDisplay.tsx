import { HabitStats } from '@/types/habit';
import { getUnlockedAchievements, getNextAchievements, ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { AchievementBadge } from './AchievementBadge';
import { Progress } from '@/components/ui/progress';

interface AchievementsDisplayProps {
  stats: HabitStats;
}

export const AchievementsDisplay = ({ stats }: AchievementsDisplayProps) => {
  const unlocked = getUnlockedAchievements(stats);
  const nextAchievements = getNextAchievements(stats);
  const unlockedIds = new Set(unlocked.map(a => a.id));

  return (
    <div className="mt-4 pt-4 border-t border-border animate-fade-in space-y-4">
      {/* Unlocked Achievements */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span>🏆</span> Achievements ({unlocked.length}/{ALL_ACHIEVEMENTS.length})
        </h4>
        
        {unlocked.length === 0 ? (
          <p className="text-xs text-muted-foreground">Complete habits to unlock achievements!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unlocked.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Next Goals</h4>
          <div className="space-y-2">
            {nextAchievements.slice(0, 3).map((achievement) => {
              let progress = 0;
              let current = 0;

              if (achievement.type === 'streak') {
                current = stats.longestStreak;
                progress = (stats.longestStreak / achievement.threshold) * 100;
              } else if (achievement.type === 'consistency') {
                current = stats.completionRate;
                progress = (stats.completionRate / achievement.threshold) * 100;
              } else if (achievement.type === 'total') {
                current = stats.totalCompletions;
                progress = (stats.totalCompletions / achievement.threshold) * 100;
              }

              return (
                <div key={achievement.id} className="flex items-center gap-2">
                  <span className="text-lg grayscale opacity-50">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate">{achievement.name}</span>
                      <span className="text-muted-foreground">
                        {current}/{achievement.threshold}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
