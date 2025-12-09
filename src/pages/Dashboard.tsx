import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { history } = useSentimentAnalysis();

  const stats = {
    total: history.length,
    positive: history.filter((h) => h.sentiment === "positive").length,
    negative: history.filter((h) => h.sentiment === "negative").length,
    neutral: history.filter((h) => h.sentiment === "neutral").length,
    avgConfidence: history.length
      ? Math.round(
          (history.reduce((acc, h) => acc + h.confidence, 0) / history.length) * 100
        )
      : 0,
  };

  const statCards = [
    {
      label: "Total Analyzed",
      value: stats.total,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-accent",
    },
    {
      label: "Positive",
      value: stats.positive,
      icon: TrendingUp,
      color: "text-positive",
      bgColor: "bg-positive-light",
    },
    {
      label: "Negative",
      value: stats.negative,
      icon: Activity,
      color: "text-negative",
      bgColor: "bg-negative-light",
    },
    {
      label: "Avg Confidence",
      value: `${stats.avgConfidence}%`,
      icon: PieChart,
      color: "text-neutral",
      bgColor: "bg-neutral-light",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 animate-in">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your sentiment analysis metrics and trends
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card p-6 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <span className="text-3xl font-display font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sentiment Distribution */}
          <div className="glass-card p-6 animate-slide-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <h2 className="font-display font-semibold text-xl mb-6">Sentiment Distribution</h2>
            
            {stats.total > 0 ? (
              <div className="space-y-4">
                {[
                  { label: "Positive", value: stats.positive, total: stats.total, color: "bg-positive" },
                  { label: "Neutral", value: stats.neutral, total: stats.total, color: "bg-neutral" },
                  { label: "Negative", value: stats.negative, total: stats.total, color: "bg-negative" },
                ].map((item) => {
                  const percentage = Math.round((item.value / item.total) * 100) || 0;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-1000", item.color)}
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
                <p>No analyses yet. Start analyzing reviews to see insights!</p>
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
