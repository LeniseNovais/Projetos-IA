import { NextRequest, NextResponse } from "next/server";
import { buildOptimizedPrompt, buildEngineeredPrompt } from "@/lib/prompts";
import { parseJsonRobust } from "@/lib/parseJson";
import { estimateTokens } from "@/lib/tokens";
import type { AnalyzeRequest } from "@/lib/types";

// ─── Erro especial para limite total atingido ────────────────────────
class AllProvidersExhaustedError extends Error {
  constructor() {
    super("ALL_PROVIDERS_EXHAUSTED");
    this.name = "AllProvidersExhaustedError";
  }
}

// ─── Gemini ──────────────────────────────────────────────────────────
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    const body = await res.text();
    throw new Error(`Erro Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Resposta vazia do Gemini.");
  return text;
}

// ─── Groq ────────────────────────────────────────────────────────────
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    const body = await res.text();
    throw new Error(`Erro Groq ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Resposta vazia do Groq.");
  return text;
}

// ─── Fallback automático: Gemini → Groq → erro total ─────────────────
async function callWithFallback(prompt: string): Promise<string> {
  // Tenta Gemini primeiro
  try {
    return await callGemini(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const isRateLimit = msg === "RATE_LIMIT" || msg.includes("429");
    if (!isRateLimit) throw e; // erro que não é rate limit → propaga
    console.warn("Gemini rate limit atingido, tentando Groq...");
  }

  // Tenta Groq como fallback
  try {
    return await callGroq(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const isRateLimit = msg === "RATE_LIMIT" || msg.includes("429");
    if (!isRateLimit) throw e;
    console.warn("Groq rate limit atingido. Todas as APIs esgotadas.");
  }

  // Ambas esgotadas
  throw new AllProvidersExhaustedError();
}

// ─── Handler principal ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { text, textType, mode } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
    }

    if (mode === "optimized") {
      const prompt = buildOptimizedPrompt(text, textType);
      let raw = await callWithFallback(prompt);
      let parsed = parseJsonRobust(raw);

      // Se a versão otimizada ficou maior, tenta de novo
      const origTokens = estimateTokens(text);
      if (estimateTokens(parsed.cleanPrompt as string) >= origTokens) {
        const retryPrompt = `Sua versão ficou maior que o original (${origTokens} tokens). Reescreva ENCURTANDO MAIS.
Original: """${text}"""
Anterior: """${parsed.cleanPrompt}"""
Responda APENAS JSON: {"noiseExplanation":"${(parsed.noiseExplanation as string).replace(/"/g, '\\"')}","cleanPrompt":"versão muito mais curta","cleanExplanation":"o que foi cortado","tips":${JSON.stringify(parsed.tips)}}`;
        try {
          const retryRaw = await callWithFallback(retryPrompt);
          const retry = parseJsonRobust(retryRaw);
          if (retry.cleanPrompt && estimateTokens(retry.cleanPrompt as string) < origTokens) {
            parsed = retry;
          }
        } catch {
          // Mantém resultado original se retry falhar
        }
      }

      return NextResponse.json(parsed);
    }

    if (mode === "engineered") {
      const prompt = buildEngineeredPrompt(text, textType);
      const raw = await callWithFallback(prompt);
      const parsed = parseJsonRobust(raw);
      if (!parsed.cleanPrompt) throw new Error("Resposta incompleta da IA.");
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Modo inválido." }, { status: 400 });

  } catch (err: unknown) {
    // Limite total atingido — código especial para o frontend mostrar a tela
    if (err instanceof AllProvidersExhaustedError) {
      return NextResponse.json(
        { error: "ALL_PROVIDERS_EXHAUSTED" },
        { status: 503 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro interno. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
