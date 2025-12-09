import { ThumbsUp, ThumbsDown, Minus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SentimentData } from "./SentimentResult";
import { formatDistanceToNow } from "date-fns";

interface SentimentHistoryCardProps {
  data: SentimentData;
  index: number;
}

const sentimentConfig = {
  positive: {
    icon: ThumbsUp,
    colorClass: "sentiment-positive",
    iconColor: "text-positive",
    borderColor: "border-positive/30",
  },
  negative: {
    icon: ThumbsDown,
    colorClass: "sentiment-negative",
    iconColor: "text-negative",
    borderColor: "border-negative/30",
  },
  neutral: {
    icon: Minus,
    colorClass: "sentiment-neutral",
    iconColor: "text-neutral",
    borderColor: "border-neutral/30",
  },
};

export function SentimentHistoryCard({ data, index }: SentimentHistoryCardProps) {
  const config = sentimentConfig[data.sentiment];
  const Icon = config.icon;
  const confidencePercent = Math.round(data.confidence * 100);

  return (
    <div
      className={cn(
        "glass-card p-4 border-l-4 animate-slide-up opacity-0",
        config.borderColor
      )}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            config.colorClass,
            "border"
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold capitalize">{data.sentiment}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(data.timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            "{data.text}"
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", {
                  "bg-positive": data.sentiment === "positive",
                  "bg-negative": data.sentiment === "negative",
                  "bg-neutral": data.sentiment === "neutral",
                })}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs font-medium">{confidencePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
