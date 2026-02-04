/**
 * Hook do zarządzania stanem detekcji rezystora
 */

import { useState, useCallback } from "react";

export type ColorName =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "white"
  | "gold"
  | "silver";

export interface DetectionResult {
  colors: ColorName[];
  bandCount: 3 | 4 | 5 | 6;
  confidence: number;
  timestamp: number;
}

export interface DetectionHistory extends DetectionResult {
  resistance: number;
  tolerance: number | null;
}

export function useResistorDetection() {
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<DetectionHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addDetection = useCallback((result: DetectionResult, resistance: number, tolerance: number | null) => {
    setCurrentDetection(result);

    const historyEntry: DetectionHistory = {
      ...result,
      resistance,
      tolerance,
    };

    setHistory(prev => [historyEntry, ...prev].slice(0, 10)); // Keep last 10 detections
  }, []);

  const clearDetection = useCallback(() => {
    setCurrentDetection(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    currentDetection,
    history,
    isProcessing,
    setIsProcessing,
    addDetection,
    clearDetection,
    clearHistory,
  };
}

