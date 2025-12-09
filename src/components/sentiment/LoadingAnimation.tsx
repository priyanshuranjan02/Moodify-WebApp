import { Brain, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingAnimation() {
  return (
    <div className="glass-card p-8 animate-in">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center pulse-glow">
            <Brain className="w-10 h-10 text-primary-foreground animate-pulse" />
          </div>
          
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-accent flex items-center justify-center animate-bounce-gentle">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          
          <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-accent flex items-center justify-center animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>
            <Zap className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-display font-semibold text-lg">Analyzing Sentiment</h3>
          <p className="text-sm text-muted-foreground">
            Our BERT model is processing your review...
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full bg-primary animate-bounce"
              )}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
