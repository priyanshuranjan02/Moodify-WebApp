import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CsvSummaryData {
  veryPositive: number;
  positive: number;
  neutral: number;
  negative: number;
  veryNegative: number;
  total: number;
}

interface CsvSentimentSummaryProps {
  summary: CsvSummaryData;
}

const sentimentRows = [
  { key: "veryPositive" as const, label: "Very Positive", icon: TrendingUp, colorClass: "text-green-500" },
  { key: "positive" as const, label: "Positive", icon: TrendingUp, colorClass: "text-emerald-400" },
  { key: "neutral" as const, label: "Neutral", icon: Minus, colorClass: "text-yellow-500" },
  { key: "negative" as const, label: "Negative", icon: TrendingDown, colorClass: "text-orange-500" },
  { key: "veryNegative" as const, label: "Very Negative", icon: TrendingDown, colorClass: "text-red-500" },
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
        {sentimentRows.map(({ key, label, icon: Icon, colorClass }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/30"
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("w-5 h-5", colorClass)} />
              <span className={cn("font-semibold text-lg", colorClass)}>
                {label}:
              </span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              {summary[key].toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border/30 text-center">
        <p className="text-muted-foreground">
          Total Reviews Analyzed: <span className="font-bold text-foreground">{summary.total.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
