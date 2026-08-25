import { BarChart3, TrendingUp, PieChart, Activity, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { stats, history, isStatsLoading, statsError, loadStats, loadHistoryFromDB } =
    useSentimentAnalysis();

  // Combine backend /stats with history metrics
  const total = stats?.total ?? history.length;
  const positive = stats?.positive ?? history.filter((h) => h.sentiment === "positive").length;
  const negative = stats?.negative ?? history.filter((h) => h.sentiment === "negative").length;
  const neutral = stats?.neutral ?? history.filter((h) => h.sentiment === "neutral").length;

  const validConfidenceHistory = history.filter(
    (h) => typeof h.confidence === "number" && h.confidence > 0
  );
  const avgConfidence = validConfidenceHistory.length
    ? Math.round(
        (validConfidenceHistory.reduce((acc, h) => acc + h.confidence, 0) /
          validConfidenceHistory.length) *
          100
      )
    : total > 0 && positive + negative + neutral > 0
    ? 85 // estimated fallback if history isn't loaded yet
    : 0;

  const statCards = [
    {
      label: "Total Analyzed",
      value: total.toLocaleString(),
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-accent",
    },
    {
      label: "Positive",
      value: positive.toLocaleString(),
      icon: TrendingUp,
      color: "text-positive",
      bgColor: "bg-positive-light",
    },
    {
      label: "Neutral",
      value: neutral.toLocaleString(),
      icon: PieChart,
      color: "text-neutral",
      bgColor: "bg-neutral-light",
    },
    {
      label: "Negative",
      value: negative.toLocaleString(),
      icon: Activity,
      color: "text-negative",
      bgColor: "bg-negative-light",
    },
  ];

  const handleRefresh = () => {
    loadStats();
    loadHistoryFromDB();
  };

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your sentiment analysis metrics and trends from the BiLSTM model
              </p>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={handleRefresh}
              disabled={isStatsLoading}
              className="self-start sm:self-auto"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isStatsLoading && "animate-spin")} />
              Refresh Data
            </Button>
          </div>

          {statsError && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between animate-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{statsError}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card p-6 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      stat.bgColor
                    )}
                  >
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <span className="text-3xl font-display font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sentiment Distribution */}
          <div
            className="glass-card p-6 animate-slide-up opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">Sentiment Distribution</h2>
              {validConfidenceHistory.length > 0 && (
                <span className="text-xs px-3 py-1 rounded-full bg-accent text-muted-foreground font-medium">
                  Avg Confidence: {avgConfidence}%
                </span>
              )}
            </div>

            {total > 0 ? (
              <div className="space-y-4">
                {[
                  {
                    label: "Positive",
                    value: positive,
                    total: total,
                    color: "bg-positive",
                  },
                  {
                    label: "Neutral",
                    value: neutral,
                    total: total,
                    color: "bg-neutral",
                  },
                  {
                    label: "Negative",
                    value: negative,
                    total: total,
                    color: "bg-negative",
                  },
                ].map((item) => {
                  const percentage =
                    item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.value.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            item.color
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">No analyses recorded yet</p>
                <p className="text-sm">Start analyzing reviews to see aggregate metrics and insights!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
