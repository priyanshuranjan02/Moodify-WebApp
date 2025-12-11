import { useState, useCallback, useEffect } from "react";
import { SentimentData } from "@/components/sentiment/SentimentResult";
import { CsvSummaryData } from "@/components/sentiment/CsvSentimentSummary";
import { toast } from "@/hooks/use-toast";

// Backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ApiResponse {
  sentiment: string;
  confidence: number;
}

interface CsvApiResponse {
  very_positive?: number;
  positive?: number;
  neutral?: number;
  negative?: number;
  very_negative?: number;
  total?: number;
}

export function useSentimentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [result, setResult] = useState<SentimentData | null>(null);
  const [csvSummary, setCsvSummary] = useState<CsvSummaryData | null>(null);
  const [history, setHistory] = useState<SentimentData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------
  // LOAD HISTORY FROM BACKEND
  // ------------------------------------------------------
  const loadHistoryFromDB = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      const data = await response.json();

      const mapped = data.map((item: any) => ({
        text: item.text,
        sentiment: item.sentiment.toLowerCase().includes("positive")
          ? "positive"
          : item.sentiment.toLowerCase().includes("negative")
          ? "negative"
          : "neutral",
        confidence: item.confidence,
        timestamp: new Date(item.timestamp),
      }));

      setHistory(mapped);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }, []);

  // ------------------------------------------------------
  // LOAD STATS FROM BACKEND
  // ------------------------------------------------------
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }, []);

  // ------------------------------------------------------
  // TEXT ANALYSIS
  // ------------------------------------------------------
  const analyze = useCallback(
    async (text: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        let mappedSentiment: "positive" | "negative" | "neutral";
        if (data.sentiment.includes("Positive")) mappedSentiment = "positive";
        else if (data.sentiment.includes("Negative")) mappedSentiment = "negative";
        else mappedSentiment = "neutral";

        const sentimentResult: SentimentData = {
          sentiment: mappedSentiment,
          confidence: data.confidence,
          text,
          timestamp: new Date(),
        };

        setResult(sentimentResult);

        // Refresh history + dashboard stats from DB
        await loadHistoryFromDB();
        await loadStats();

        toast({
          title: "Analysis Complete",
          description: `Detected ${mappedSentiment} sentiment with ${Math.round(
            data.confidence * 100
          )}% confidence.`,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to analyze sentiment";
        setError(message);

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadHistoryFromDB, loadStats]
  );

  // ------------------------------------------------------
  // CSV ANALYSIS
  // ------------------------------------------------------
  const analyzeFile = useCallback(
    async (file: File) => {
      setIsFileLoading(true);
      setError(null);
      setCsvSummary(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/predict/csv`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("CSV backend not available.");
        }

        const data: CsvApiResponse = await response.json();

        const summary: CsvSummaryData = {
          veryPositive: data.very_positive || 0,
          positive: data.positive || 0,
          neutral: data.neutral || 0,
          negative: data.negative || 0,
          veryNegative: data.very_negative || 0,
          total: data.total || 0,
        };

        setCsvSummary(summary);

        // Refresh dashboard + history because CSV saves in DB
        await loadHistoryFromDB();
        await loadStats();

        toast({
          title: "CSV Analysis Complete",
          description: `Analyzed ${summary.total} reviews successfully.`,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to analyze file";
        setError(message);

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsFileLoading(false);
      }
    },
    [loadHistoryFromDB, loadStats]
  );

  // ------------------------------------------------------
  // CLEAR HELPERS
  // ------------------------------------------------------
  const clearResult = useCallback(() => setResult(null), []);
  const clearCsvSummary = useCallback(() => setCsvSummary(null), []);
  const clearHistory = useCallback(() => setHistory([]), []);

  // ------------------------------------------------------
  // LOAD DATA ON STARTUP
  // ------------------------------------------------------
  useEffect(() => {
    loadHistoryFromDB();
    loadStats();
  }, []);

  return {
    isLoading,
    isFileLoading,
    result,
    csvSummary,
    history,
    stats,
    error,
    analyze,
    analyzeFile,
    clearResult,
    clearCsvSummary,
    clearHistory,
  };
}
