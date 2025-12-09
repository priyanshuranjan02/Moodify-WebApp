import { ThumbsUp, ThumbsDown, Minus, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface SentimentData {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  text: string;
  timestamp: Date;
}

interface SentimentResultProps {
  result: SentimentData;
}

const sentimentConfig = {
  positive: {
    icon: ThumbsUp,
    label: "Positive",
    description: "This review expresses satisfaction and positive emotions",
    colorClass: "sentiment-positive",
    iconColor: "text-positive",
    progressColor: "bg-positive",
  },
  negative: {
    icon: ThumbsDown,
    label: "Negative",
    description: "This review expresses dissatisfaction or concerns",
    colorClass: "sentiment-negative",
    iconColor: "text-negative",
    progressColor: "bg-negative",
  },
  neutral: {
    icon: Minus,
    label: "Neutral",
    description: "This review is balanced without strong sentiment",
    colorClass: "sentiment-neutral",
    iconColor: "text-neutral",
    progressColor: "bg-neutral",
  },
};

export function SentimentResult({ result }: SentimentResultProps) {
  const config = sentimentConfig[result.sentiment];
  const Icon = config.icon;
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="glass-card p-6 animate-scale-in">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
            config.colorClass,
            "border"
          )}
        >
          <Icon className={cn("w-8 h-8", config.iconColor)} />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-2xl">{config.label}</h3>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  config.colorClass,
                  "border"
                )}
              >
                {confidencePercent}% confident
              </span>
            </div>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Confidence Score
              </span>
              <span className="font-semibold">{confidencePercent}%</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                  config.progressColor
                )}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Analyzed Text:
            </p>
            <p className="text-sm bg-secondary/50 p-3 rounded-xl line-clamp-3">
              "{result.text}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
