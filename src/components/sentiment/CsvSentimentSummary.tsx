import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CsvSummaryData {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface CsvSentimentSummaryProps {
  summary: CsvSummaryData;
}

const sentimentRows = [
  {
    key: "positive" as const,
    label: "Positive",
    icon: TrendingUp,
    colorClass: "text-emerald-400",
    bgBadge: "bg-positive-light border-positive/30",
  },
  {
    key: "neutral" as const,
    label: "Neutral",
    icon: Minus,
    colorClass: "text-yellow-500",
    bgBadge: "bg-neutral-light border-neutral/30",
  },
  {
    key: "negative" as const,
    label: "Negative",
    icon: TrendingDown,
    colorClass: "text-red-500",
    bgBadge: "bg-negative-light border-negative/30",
  },
];

export function CsvSentimentSummary({ summary }: CsvSentimentSummaryProps) {
  return (
    <div className="glass-card p-8 animate-in">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="font-display font-bold text-2xl text-center">
          CSV SENTIMENT ANALYSIS
        </h2>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {sentimentRows.map(({ key, label, icon: Icon, colorClass, bgBadge }) => {
          const count = summary[key] || 0;
          const percentage =
            summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;

          return (
            <div
              key={key}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                bgBadge
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", colorClass)} />
                <span className={cn("font-semibold text-lg", colorClass)}>
                  {label}:
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  ({percentage}%)
                </span>
                <span className="font-display font-bold text-2xl text-foreground">
                  {count.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border/30 text-center">
        <p className="text-muted-foreground">
          Total Reviews Analyzed:{" "}
          <span className="font-bold text-foreground">
            {summary.total.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}
