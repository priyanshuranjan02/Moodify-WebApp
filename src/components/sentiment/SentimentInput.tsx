import { useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SentimentInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function SentimentInput({ onAnalyze, isLoading }: SentimentInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      await onAnalyze(text.trim());
    }
  };

  const characterCount = text.length;
  const maxCharacters = 1000;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Analyze Review</h2>
        </div>
        
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxCharacters))}
            placeholder="Paste your product review here... e.g., 'This product exceeded my expectations! The quality is amazing and delivery was fast.'"
            className={cn(
              "min-h-[160px] resize-none bg-background/50 border-border/50 rounded-xl text-base",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300",
              "placeholder:text-muted-foreground/60"
            )}
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {characterCount}/{maxCharacters}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Our BERT model will analyze the sentiment of your review
          </p>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={!text.trim() || isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
