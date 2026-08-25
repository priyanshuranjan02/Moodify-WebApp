import { useState, useCallback, useEffect } from "react";
import { SentimentData } from "@/components/sentiment/SentimentResult";
import { CsvSummaryData } from "@/components/sentiment/CsvSentimentSummary";
import { toast } from "@/hooks/use-toast";

// Backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

export interface PredictResponse {
  sentiment: "Positive" | "Neutral" | "Negative" | string;
  confidence: number;
}

export interface CsvApiResponse {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface HistoryItem {
  text: string | null;
  sentiment: string | null;
  confidence: number | null;
  timestamp: string | null;
}

export interface StatsResponse {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export function useSentimentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [result, setResult] = useState<SentimentData | null>(null);
  const [csvSummary, setCsvSummary] = useState<CsvSummaryData | null>(null);
  const [history, setHistory] = useState<SentimentData[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // ------------------------------------------------------
  // LOAD HISTORY FROM BACKEND
  // ------------------------------------------------------
  const loadHistoryFromDB = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server responded with status ${response.status}`);
      }
      const data: HistoryItem[] = await response.json();

      const mapped: SentimentData[] = data
        .filter((item) => item.text && item.sentiment)
        .map((item) => {
          const rawSentiment = (item.sentiment || "").toLowerCase();
          let sentiment: "positive" | "negative" | "neutral" = "neutral";
          if (rawSentiment.includes("positive")) {
            sentiment = "positive";
          } else if (rawSentiment.includes("negative")) {
            sentiment = "negative";
          }

          let parsedDate = new Date();
          if (item.timestamp) {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
              parsedDate = d;
            }
          }

          return {
            text: item.text || "",
            sentiment,
            confidence: typeof item.confidence === "number" ? item.confidence : 0,
            timestamp: parsedDate,
          };
        });

      setHistory(mapped);
    } catch (err) {
      const message =
        err instanceof TypeError && err.message.includes("fetch")
          ? `Unable to connect to backend server at ${API_BASE_URL}.`
          : err instanceof Error
          ? err.message
          : "Failed to load history";
      setHistoryError(message);
      console.error("Failed to load history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // ------------------------------------------------------
  // LOAD STATS FROM BACKEND
  // ------------------------------------------------------
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server responded with status ${response.status}`);
      }
      const data: StatsResponse = await response.json();
      setStats({
        positive: data.positive || 0,
        neutral: data.neutral || 0,
        negative: data.negative || 0,
        total: data.total || 0,
      });
    } catch (err) {
      const message =
        err instanceof TypeError && err.message.includes("fetch")
          ? `Unable to connect to backend server at ${API_BASE_URL}.`
          : err instanceof Error
          ? err.message
          : "Failed to load stats";
      setStatsError(message);
      console.error("Failed to load stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // ------------------------------------------------------
  // TEXT ANALYSIS
  // ------------------------------------------------------
  const analyze = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        setError("Please enter review text to analyze.");
        toast({
          title: "Validation Error",
          description: "Please enter review text to analyze.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmedText }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(
            errData?.error || errData?.details || `Server error (${response.status})`
          );
        }

        const data: PredictResponse = await response.json();

        let mappedSentiment: "positive" | "negative" | "neutral";
        const normalized = (data.sentiment || "").toLowerCase();
        if (normalized.includes("positive")) {
          mappedSentiment = "positive";
        } else if (normalized.includes("negative")) {
          mappedSentiment = "negative";
        } else {
          mappedSentiment = "neutral";
        }

        const sentimentResult: SentimentData = {
          sentiment: mappedSentiment,
          confidence: data.confidence,
          text: trimmedText,
          timestamp: new Date(),
        };

        setResult(sentimentResult);

        // Refresh history + dashboard stats from DB asynchronously
        loadHistoryFromDB();
        loadStats();

        const confidenceDisplay = (data.confidence * 100).toFixed(2);
        toast({
          title: "Analysis Complete",
          description: `Detected ${mappedSentiment.toUpperCase()} sentiment with ${confidenceDisplay}% confidence.`,
        });
      } catch (err) {
        const message =
          err instanceof TypeError && err.message.includes("fetch")
            ? `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the server is running.`
            : err instanceof Error
            ? err.message
            : "Failed to analyze sentiment";
        setError(message);

        toast({
          title: "Analysis Failed",
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
      if (!file) {
        setError("Please select a valid CSV file.");
        return;
      }

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
          const errData = await response.json().catch(() => null);
          throw new Error(
            errData?.error || errData?.details || `CSV analysis failed with status ${response.status}`
          );
        }

        const data: CsvApiResponse = await response.json();

        const summary: CsvSummaryData = {
          positive: data.positive || 0,
          neutral: data.neutral || 0,
          negative: data.negative || 0,
          total: data.total || 0,
        };

        setCsvSummary(summary);

        // Refresh dashboard + history because CSV saves in DB
        loadHistoryFromDB();
        loadStats();

        toast({
          title: "CSV Analysis Complete",
          description: `Analyzed ${summary.total} reviews successfully.`,
        });
      } catch (err) {
        const message =
          err instanceof TypeError && err.message.includes("fetch")
            ? `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the server is running.`
            : err instanceof Error
            ? err.message
            : "Failed to analyze CSV file";
        setError(message);

        toast({
          title: "CSV Analysis Failed",
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
  }, [loadHistoryFromDB, loadStats]);

  return {
    isLoading,
    isFileLoading,
    isHistoryLoading,
    isStatsLoading,
    result,
    csvSummary,
    history,
    stats,
    error,
    historyError,
    statsError,
    analyze,
    analyzeFile,
    loadHistoryFromDB,
    loadStats,
    clearResult,
    clearCsvSummary,
    clearHistory,
  };
}
