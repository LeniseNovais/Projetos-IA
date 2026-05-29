export interface OptimizedResult {
  noiseExplanation: string;
  cleanPrompt: string;
  cleanExplanation: string;
  tips: string[];
}

export interface Criterion {
  label: string;
  winner: "optimized" | "engineered" | "tie";
}

export interface EngineeredResult {
  noiseExplanation: string;
  cleanPrompt: string;
  cleanExplanation: string;
  techniques: string[];
  verdictWhenOptimized: string;
  verdictWhenEngineered: string;
  recommendation: {
    bestOption: "optimized" | "engineered";
    reasoning: string;
  };
  criteria: Criterion[];
  tips: string[];
}

export type AnalyzeMode = "optimized" | "engineered";

export interface AnalyzeRequest {
  text: string;
  textType: string;
  mode: AnalyzeMode;
}
