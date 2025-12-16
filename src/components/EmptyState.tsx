import { Sparkles } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-display font-bold text-xl text-foreground mb-2">
        Start Your Journey
      </h3>
      <p className="text-muted-foreground max-w-sm">
        Create your first habit and begin building better routines. 
        Small daily actions lead to big transformations.
      </p>
    </div>
  );
};
