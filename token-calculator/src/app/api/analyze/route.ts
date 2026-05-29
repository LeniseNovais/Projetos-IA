import { NextRequest, NextResponse } from "next/server";
import { buildOptimizedPrompt, buildEngineeredPrompt } from "@/lib/prompts";
import { parseJsonRobust } from "@/lib/parseJson";
import { estimateTokens } from "@/lib/tokens";
import type { AnalyzeRequest } from "@/lib/types";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429)
      throw new Error("Limite de requisições atingido. Aguarde e tente novamente.");
    if (res.status === 400)
      throw new Error("Requisição inválida: " + body.slice(0, 200));
    throw new Error(`Erro na API Gemini: ${res.status}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Resposta vazia da IA.");
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { text, textType, mode } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
    }

    if (mode === "optimized") {
      const prompt = buildOptimizedPrompt(text, textType);
      let raw = await callGemini(prompt);
      let parsed = parseJsonRobust(raw);

      // If result is not shorter, retry
      const origTokens = estimateTokens(text);
      if (estimateTokens(parsed.cleanPrompt as string) >= origTokens) {
        const retryPrompt = `Sua versão ficou maior que o original (${origTokens} tokens). Reescreva ENCURTANDO MAIS.
Original: """${text}"""
Anterior: """${parsed.cleanPrompt}"""
Responda APENAS JSON: {"noiseExplanation":"${(parsed.noiseExplanation as string).replace(/"/g, '\\"')}","cleanPrompt":"versão muito mais curta","cleanExplanation":"o que foi cortado","tips":${JSON.stringify(parsed.tips)}}`;
        try {
          const retryRaw = await callGemini(retryPrompt);
          const retry = parseJsonRobust(retryRaw);
          if (
            retry.cleanPrompt &&
            estimateTokens(retry.cleanPrompt as string) < origTokens
          ) {
            parsed = retry;
          }
        } catch {
          // Keep original result if retry fails
        }
      }

      return NextResponse.json(parsed);
    }

    if (mode === "engineered") {
      const prompt = buildEngineeredPrompt(text, textType);
      const raw = await callGemini(prompt);
      const parsed = parseJsonRobust(raw);
      if (!parsed.cleanPrompt) throw new Error("Resposta incompleta da IA.");
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Modo inválido." }, { status: 400 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
