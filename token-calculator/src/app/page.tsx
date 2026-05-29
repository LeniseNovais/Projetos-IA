"use client";

import { useState, useCallback } from "react";
import { estimateTokens, tokenComposition } from "@/lib/tokens";
import { TYPE_INFO, GOLDEN_RULES } from "@/lib/constants";
import type { OptimizedResult, EngineeredResult } from "@/lib/types";

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
  bg: "#fafbfc",
  primary: "#1e3a5f",
  accent: "#e8836b",
  lavender: "#9d8df0",
  gold: "#d4a657",
  green: "#5fa896",
  red: "#d96459",
  ink: "#0f1d2e",
  muted: "#6b7a8f",
  cardBg: "#ffffff",
  softBg: "#f1f4f8",
};

/* ─── Helpers ────────────────────────────────────────────────────── */
async function callAnalyze(
  text: string,
  textType: string,
  mode: "optimized" | "engineered"
) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, textType, mode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao analisar.");
  return data;
}

/* ─── Limit Screen ───────────────────────────────────────────────── */
function LimitScreen({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(135deg, #1e3a5f 0%, #2d1b69 50%, #1a1a2e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          color: "#fff",
        }}
      >
        {/* Ícone */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 24px",
          }}
        >
          📊
        </div>

        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Limite diário atingido
        </h2>

        <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, marginBottom: 28 }}>
          Nossa Calculadora de Tokens atingiu o limite diário de uso gratuito
          das IAs. O contador zera automaticamente à meia-noite. Volte amanhã
          para continuar.
        </p>

        {/* Card info */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: 1, fontWeight: 700 }}>
            📅 TENTE NOVAMENTE AMANHÃ
          </div>
          <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
            Suas análises não foram perdidas — volte amanhã e a calculadora
            estará pronta para otimizar seus prompts novamente.
          </p>
        </div>

        <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.6, marginBottom: 32 }}>
          Enquanto isso, que tal revisar as dicas de otimização de tokens que
          você já recebeu? Esse é o trabalho mais importante. A IA só ajuda a
          organizar.
        </p>

        {/* Botões */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onBack}
            style={{
              padding: "12px 24px",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ↺ Voltar e revisar
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🏠 Ir para o início
          </button>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, opacity: 0.45 }}>
          Criado por Ana Lenise Novais
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */
function DonutMetric({
  value,
  label,
  sublabel,
  color,
  size = 140,
}: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  size?: number;
}) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={C.softBg}
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={0}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: size > 130 ? 26 : 22,
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1,
            }}
          >
            {value.toLocaleString("pt-BR")}
          </div>
          <div
            style={{
              fontSize: 10,
              color: C.muted,
              marginTop: 4,
              textAlign: "center",
              padding: "0 8px",
            }}
          >
            {sublabel}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          color: C.primary,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function MiniPie({
  input,
  output,
  color,
  size = 120,
}: {
  input: number;
  output: number;
  color: string;
  size?: number;
}) {
  const total = input + output || 1;
  const radius = size / 2 - 6;
  const cx = size / 2,
    cy = size / 2;
  const inputAngle = (input / total) * 2 * Math.PI;
  const x1 = cx + radius * Math.cos(-Math.PI / 2);
  const y1 = cy + radius * Math.sin(-Math.PI / 2);
  const x2 = cx + radius * Math.cos(-Math.PI / 2 + inputAngle);
  const y2 = cy + radius * Math.sin(-Math.PI / 2 + inputAngle);
  const largeArc = inputAngle > Math.PI ? 1 : 0;
  const outLargeArc = 2 * Math.PI - inputAngle > Math.PI ? 1 : 0;
  const inputPath =
    input > 0
      ? `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      : "";
  const outputPath =
    output > 0
      ? `M ${cx} ${cy} L ${x2} ${y2} A ${radius} ${radius} 0 ${outLargeArc} 1 ${x1} ${y1} Z`
      : "";
  return (
    <svg width={size} height={size}>
      {inputPath && (
        <path
          d={inputPath}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
        />
      )}
      {outputPath && (
        <path
          d={outputPath}
          fill={`${color}55`}
          stroke="#fff"
          strokeWidth={2}
        />
      )}
      <circle cx={cx} cy={cy} r={radius * 0.45} fill="#fff" />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill={C.ink}
      >
        {input + output}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize="9"
        fill={C.muted}
        fontWeight="700"
      >
        TOTAL
      </text>
    </svg>
  );
}

function CompositionDonut({
  data,
  tooltips,
}: {
  data: { label: string; value: number; color: string }[];
  tooltips: { title: string; how: string; tip: string }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const size = 200,
    radius = 80,
    innerRadius = 50,
    cx = size / 2,
    cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path =
      d.value > 0
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
        : "";
    return { ...d, path };
  });

  const hoveredTip = hovered !== null ? tooltips[hovered] : null;
  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <svg width={size} height={size}>
          {slices.map(
            (s, i) =>
              s.path && (
                <path
                  key={i}
                  d={s.path}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.25s",
                    opacity:
                      hovered === null || hovered === i ? 1 : 0.35,
                    transform:
                      hovered === i ? "scale(1.04)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
          )}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {hovered !== null ? (
            <>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: data[hovered].color,
                  lineHeight: 1,
                }}
              >
                {data[hovered].value}%
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.muted,
                  marginTop: 4,
                  textAlign: "center",
                  padding: "0 12px",
                }}
              >
                {data[hovered].label.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  letterSpacing: 1,
                  fontWeight: 700,
                }}
              >
                COMPOSIÇÃO
              </div>
              <div
                style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 2 }}
              >
                100%
              </div>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 220,
          flex: 1,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              cursor: "help",
              background: hovered === i ? `${d.color}15` : "transparent",
              border:
                hovered === i
                  ? `1px solid ${d.color}40`
                  : "1px solid transparent",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: C.ink,
                borderBottom: `1px dashed ${C.muted}50`,
              }}
            >
              {d.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: d.color,
                minWidth: 44,
                textAlign: "right",
              }}
            >
              {d.value}%
            </div>
          </div>
        ))}
      </div>
      {hoveredTip && (
        <div
          style={{
            flexBasis: "100%",
            background: C.ink,
            color: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 12.5,
            lineHeight: 1.6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: data[hovered!].color,
              }}
            />
            <strong>{hoveredTip.title}</strong>
          </div>
          <div style={{ marginBottom: 10, opacity: 0.9 }}>{hoveredTip.how}</div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              background: "#ffffff15",
              padding: "8px 10px",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>💡</span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.gold,
                  letterSpacing: 1,
                  marginBottom: 3,
                }}
              >
                COMO ECONOMIZAR
              </div>
              <div style={{ opacity: 0.95 }}>{hoveredTip.tip}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyBtn({
  text,
  label = "📋 Copiar versão",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const handle = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText =
      "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    let success = false;
    try {
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      success = document.execCommand("copy");
    } catch {}
    document.body.removeChild(ta);
    if (!success && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
        .catch(() => {
          setFailed(true);
          setTimeout(() => setFailed(false), 2500);
        });
      return;
    }
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 2500);
    }
  };
  const bg = copied ? C.green : failed ? C.red : C.primary;
  return (
    <button
      onClick={handle}
      style={{
        marginTop: 12,
        padding: "9px 16px",
        background: bg,
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12.5,
        fontWeight: 700,
        transition: "background 0.2s",
      }}
    >
      {copied ? "✓ Copiado!" : failed ? "Selecione manualmente" : label}
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Home() {
  const [text, setText] = useState("");
  const [textType, setTextType] = useState("Prompt livre");
  const [loading, setLoading] = useState(false);
  const [loadingPE, setLoadingPE] = useState(false);
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [resultPE, setResultPE] = useState<EngineeredResult | null>(null);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allExhausted, setAllExhausted] = useState(false);

  const tokens = estimateTokens(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const comp = tokenComposition(text);
  const hasText = text.trim().length > 0;

  const reset = useCallback(() => {
    setText("");
    setResult(null);
    setResultPE(null);
    setShowRules(false);
    setShowAdvanced(false);
    setError("");
    setAllExhausted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const analyze = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setResultPE(null);
    setShowRules(false);
    setShowAdvanced(false);
    try {
      const parsed = await callAnalyze(text, textType, "optimized");
      setResult(parsed as OptimizedResult);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "ALL_PROVIDERS_EXHAUSTED") { setAllExhausted(true); }
      else setError("Erro ao analisar: " + (msg || "tente novamente"));
    }
    setLoading(false);
  }, [text, textType]);

  const analyzePE = useCallback(async () => {
    if (!text.trim()) return;
    setLoadingPE(true);
    setError("");
    try {
      const parsed = await callAnalyze(text, textType, "engineered");
      setResultPE(parsed as EngineeredResult);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "ALL_PROVIDERS_EXHAUSTED") { setAllExhausted(true); }
      else setError("Erro ao gerar versão com engenharia: " + (msg || "tente novamente"));
    }
    setLoadingPE(false);
  }, [text, textType]);

  const optTokens = result ? estimateTokens(result.cleanPrompt) : 0;
  const optWords = result
    ? result.cleanPrompt.trim().split(/\s+/).length
    : 0;
  const reduction =
    result && tokens > 0
      ? Math.round(((tokens - optTokens) / tokens) * 100)
      : 0;
  const peTokens = resultPE ? estimateTokens(resultPE.cleanPrompt) : 0;
  const optOutputEst = Math.round(optTokens * 1.5);
  const peOutputEst = Math.round(peTokens * 0.8);
  const optTotal = optTokens + optOutputEst;
  const peTotal = peTokens + peOutputEst;

  const card: React.CSSProperties = {
    background: C.cardBg,
    borderRadius: 16,
    padding: 26,
    marginBottom: 20,
    boxShadow: "0 4px 20px rgba(30,58,95,0.06)",
    border: `1px solid ${C.softBg}`,
  };
  const sectionLabel: React.CSSProperties = {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    color: C.primary,
    marginBottom: 14,
    textTransform: "uppercase",
    padding: "4px 10px",
    background: C.softBg,
    borderRadius: 4,
  };

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        background: `linear-gradient(180deg,${C.bg} 0%,#eef2f7 100%)`,
        minHeight: "100vh",
        padding: "44px 16px 0",
      }}
    >
      {allExhausted && <LimitScreen onBack={() => setAllExhausted(false)} />}
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              padding: "6px 14px",
              background: C.cardBg,
              borderRadius: 30,
              border: `1px solid ${C.softBg}`,
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }}
            />
            <span
              style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1 }}
            >
              OTIMIZE SEUS PROMPTS
            </span>
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.ink,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            Calculadora de Tokens
          </h1>
          <p
            style={{
              color: C.muted,
              fontSize: 14.5,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Cole ou escreva seu prompt para estimar os tokens consumidos e
            receber insights de como otimizá-lo com base em engenharia de
            prompt.
          </p>
        </div>

        {/* Input card */}
        <div style={card}>
          <div style={sectionLabel}>Tipo de texto</div>
          <div
            style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}
          >
            {Object.keys(TYPE_INFO).map((t) => (
              <button
                key={t}
                onClick={() => setTextType(t)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border:
                    textType === t
                      ? `2px solid ${C.primary}`
                      : `2px solid ${C.softBg}`,
                  background: textType === t ? C.primary : "#fff",
                  color: textType === t ? "#fff" : C.ink,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div
            style={{
              background: `${C.lavender}15`,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
              borderLeft: `4px solid ${C.lavender}`,
            }}
          >
            <div
              style={{ fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 4 }}
            >
              {TYPE_INFO[textType].title}
            </div>
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
              {TYPE_INFO[textType].desc}
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole seu prompt aqui..."
            style={{
              width: "100%",
              minHeight: 130,
              borderRadius: 10,
              border: `2px solid ${C.softBg}`,
              padding: 14,
              fontSize: 13.5,
              fontFamily: "'Courier New',monospace",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
              color: C.ink,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.primary)}
            onBlur={(e) => (e.target.style.borderColor = C.softBg)}
          />
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              display: "flex",
              gap: 14,
              marginTop: 10,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <span>
                <strong style={{ color: C.ink }}>{chars}</strong> caracteres
              </span>
              <span>
                <strong style={{ color: C.ink }}>{words}</strong> palavras
              </span>
              <span>
                <strong style={{ color: C.accent }}>{tokens}</strong> tokens
              </span>
            </div>
            {hasText && (
              <button
                onClick={reset}
                style={{
                  fontSize: 12,
                  color: C.muted,
                  background: "none",
                  border: `1px solid ${C.softBg}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                ↺ Limpar
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {hasText && (
          <div style={card}>
            <div style={sectionLabel}>Resultado</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: 20,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <DonutMetric
                value={tokens}
                label="Tokens de entrada"
                sublabel="o que você envia"
                color={C.accent}
              />
              <DonutMetric
                value={Math.round(tokens * 1.5)}
                label="Tokens de saída"
                sublabel="resposta estimada"
                color={C.lavender}
              />
              <DonutMetric
                value={tokens + Math.round(tokens * 1.5)}
                label="Total estimado"
                sublabel="entrada + saída"
                color={C.gold}
              />
            </div>
            <div
              style={{
                background: `${C.gold}10`,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
                fontSize: 12.5,
                color: C.ink,
                lineHeight: 1.55,
                border: `1px solid ${C.gold}30`,
              }}
            >
              <strong style={{ color: "#8a6a2c" }}>Por que isso importa?</strong>{" "}
              A IA cobra tanto pelo prompt que você envia (entrada) quanto pela
              resposta que ela gera (saída). A saída costuma ser ~1,5x o tamanho
              da entrada — e em APIs pagas, os tokens de saída são até 5x mais
              caros. Por isso, pedir respostas curtas e objetivas ("resuma em 3
              bullets", "até 80 palavras") economiza muito mais do que parece.
            </div>
            <div
              style={{ height: 1, background: C.softBg, margin: "10px 0 24px" }}
            />
            <div style={sectionLabel}>Composição dos tokens</div>
            <div
              style={{
                background: `${C.lavender}12`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 12.5,
                color: C.primary,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🖱️</span>
              <span>
                Passe o mouse sobre cada fatia ou item da legenda para entender
                como ele afeta o consumo de tokens e ver dicas de como
                economizar.
              </span>
            </div>
            <CompositionDonut
              data={[
                { label: "Palavras comuns (PT)", value: comp.common, color: C.primary },
                { label: "Palavras longas", value: comp.long, color: C.accent },
                { label: "Pontuação / símbolos", value: comp.punct, color: C.green },
                { label: "Números", value: comp.numbers, color: C.gold },
              ]}
              tooltips={[
                {
                  title: "Palavras comuns",
                  how: "Palavras curtas e frequentes do português (casa, fazer, para) geralmente são tokenizadas como 1 token cada. São as mais eficientes.",
                  tip: "Prefira palavras simples e diretas. Quanto maior a proporção desta categoria, mais econômico está seu prompt.",
                },
                {
                  title: "Palavras longas",
                  how: "Palavras com mais de 7-8 caracteres são geralmente quebradas em 2 ou 3 tokens (ex: 'desenvolvimento' = 2 tokens).",
                  tip: "Trocar 'desenvolvimento' por 'criação' economiza tokens. Prefira sinônimos curtos sempre que possível.",
                },
                {
                  title: "Pontuação e símbolos",
                  how: "Cada sinal de pontuação (. , ! ? ;) e símbolos especiais (@, #, $, emojis) costuma contar como 1 token separado.",
                  tip: "Evitar pontuação excessiva (..., !!!, ???) reduz custo. Use frases mais limpas.",
                },
                {
                  title: "Números",
                  how: "Números longos são quebrados em vários tokens. Ex: '2026' = 1 token, mas '1000000' pode virar 3-4 tokens.",
                  tip: "Resumir números longos (ex: 'cerca de 1 milhão' em vez de '1.000.000') ajuda.",
                },
              ]}
            />

            {/* CTA */}
            <div
              style={{
                marginTop: 28,
                padding: 20,
                background: `linear-gradient(135deg,${C.primary} 0%,#2c4f7c 100%)`,
                borderRadius: 12,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 280px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                  ✨ Quer reduzir o número de tokens?
                </div>
                <div style={{ fontSize: 12.5, opacity: 0.85, lineHeight: 1.5 }}>
                  Receba uma versão enxuta do seu prompt, sem rodeios e com
                  menos tokens.
                </div>
              </div>
              <button
                onClick={analyze}
                disabled={loading}
                style={{
                  padding: "12px 26px",
                  background: loading ? "#888" : C.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: loading ? "default" : "pointer",
                  fontSize: 13.5,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Analisando..." : "Analisar com IA →"}
              </button>
            </div>
            {error && (
              <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Comparative analysis */}
        {result && (
          <div style={card}>
            <div style={sectionLabel}>Análise comparativa</div>
            <p
              style={{ fontSize: 13, color: C.muted, marginBottom: 22, marginTop: -4 }}
            >
              O mesmo pedido com um custo diferente. Veja como a versão
              otimizada reduz tokens.
            </p>

            {/* Original */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                marginBottom: 16,
                overflow: "hidden",
                border: `1.5px solid ${C.red}30`,
              }}
            >
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ width: 8, background: C.red }} />
                <div style={{ flex: 1, padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: C.red,
                          letterSpacing: 2,
                        }}
                      >
                        SEU PROMPT
                      </div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.ink }}
                      >
                        Versão original
                      </div>
                    </div>
                    <div
                      style={{
                        background: `${C.red}15`,
                        padding: "5px 10px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: C.red,
                      }}
                    >
                      {tokens} tokens · {words} palavras
                    </div>
                  </div>
                  <div
                    style={{
                      background: `${C.red}06`,
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: C.ink,
                        lineHeight: 1.55,
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.muted,
                      marginTop: 12,
                      marginBottom: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: C.red }}>Diagnóstico:</strong>{" "}
                    {result.noiseExplanation}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 0 16px",
                gap: 8,
              }}
            >
              <div style={{ height: 1, flex: 1, background: C.softBg }} />
              <div
                style={{
                  background: C.gold,
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                ↓ OTIMIZADO
              </div>
              <div style={{ height: 1, flex: 1, background: C.softBg }} />
            </div>

            {/* Optimized */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                overflow: "hidden",
                border: `1.5px solid ${C.green}40`,
              }}
            >
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ width: 8, background: C.green }} />
                <div style={{ flex: 1, padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: C.green,
                          letterSpacing: 2,
                        }}
                      >
                        OTIMIZADO POR IA
                      </div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.ink }}
                      >
                        Versão reduzida
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          background: `${C.green}15`,
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: C.green,
                        }}
                      >
                        {optTokens} tokens · {optWords} palavras
                      </div>
                      {reduction > 0 && (
                        <div
                          style={{
                            background: C.green,
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                          }}
                        >
                          ↓ {reduction}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      background: `${C.green}06`,
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <pre
                      style={{
                        fontSize: 12.5,
                        color: C.ink,
                        lineHeight: 1.6,
                        margin: 0,
                        fontFamily: "'Courier New',monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {result.cleanPrompt}
                    </pre>
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.muted,
                      marginTop: 12,
                      marginBottom: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: C.green }}>O que melhorou:</strong>{" "}
                    {result.cleanExplanation}
                  </p>
                  <CopyBtn
                    text={result.cleanPrompt}
                    label="📋 Copiar versão otimizada"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next step buttons */}
        {result && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowRules((v) => !v)}
              style={{
                flex: "1 1 240px",
                padding: "16px 20px",
                background: showRules ? C.gold : "#fff",
                color: showRules ? "#fff" : C.ink,
                border: `2px solid ${C.gold}`,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: showRules ? "#fff" : `${C.gold}20`,
                  color: "#8a6a2c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                💡
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
                  Dicas para otimizar seus tokens
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.8 }}>
                  {showRules
                    ? "Clique para ocultar"
                    : "Princípios práticos + dicas para seu prompt"}
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              style={{
                flex: "1 1 240px",
                padding: "16px 20px",
                background: showAdvanced ? C.lavender : "#fff",
                color: showAdvanced ? "#fff" : C.ink,
                border: `2px solid ${C.lavender}`,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: showAdvanced ? "#fff" : `${C.lavender}20`,
                  color: C.lavender,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🎓
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
                  Usar engenharia de prompt
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.8 }}>
                  {showAdvanced
                    ? "Clique para ocultar"
                    : "Versão avançada com técnicas formais"}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Golden rules */}
        {result && showRules && (
          <div style={card}>
            <div style={sectionLabel}>Regras de ouro para otimizar tokens</div>
            <div
              style={{
                ...sectionLabel,
                background: `${C.gold}25`,
                color: "#8a6a2c",
                marginTop: 4,
              }}
            >
              💡 Dicas para o seu prompt
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}
            >
              {result.tips.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    background: `${C.gold}08`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: `1px solid ${C.gold}30`,
                  }}
                >
                  <div
                    style={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: 6,
                      background: C.gold,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
                    {tip}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...sectionLabel, background: C.softBg, color: C.primary }}>
              Princípios práticos
            </div>
            <p
              style={{ fontSize: 13, color: C.muted, marginBottom: 18, marginTop: -4 }}
            >
              Boas práticas para escrever prompts mais eficientes no dia a dia.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 14,
              }}
            >
              {GOLDEN_RULES.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      i % 2 === 0 ? `${C.lavender}08` : `${C.green}08`,
                    borderRadius: 12,
                    padding: "20px 18px 18px",
                    border: `1px solid ${i % 2 === 0 ? C.lavender : C.green}25`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 14,
                      background: "#fff",
                      borderRadius: 8,
                      padding: "4px 8px",
                      border: `1px solid ${C.softBg}`,
                      fontSize: 10,
                      fontWeight: 800,
                      color: C.muted,
                      letterSpacing: 1,
                    }}
                  >
                    Nº {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: C.ink,
                      marginBottom: 6,
                      lineHeight: 1.35,
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: C.muted,
                      lineHeight: 1.55,
                      marginBottom: r.example ? 10 : 0,
                    }}
                  >
                    {r.text}
                  </div>
                  {r.example && (
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 8,
                        padding: "8px 10px",
                        borderLeft: `3px solid ${i % 2 === 0 ? C.lavender : C.green}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: i % 2 === 0 ? C.lavender : C.green,
                          letterSpacing: 1,
                          marginBottom: 4,
                        }}
                      >
                        EXEMPLO
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}
                      >
                        {r.example}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced / PE section */}
        {result && showAdvanced && (
          <div
            style={{
              ...card,
              background: `linear-gradient(135deg,${C.lavender}15 0%,${C.gold}10 100%)`,
              border: `2px solid ${C.lavender}40`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.lavender,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🎓
              </div>
              <div>
                <div
                  style={{ fontSize: 10, fontWeight: 800, color: C.lavender, letterSpacing: 2 }}
                >
                  NÍVEL AVANÇADO
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>
                  Aplicar engenharia de prompt formal
                </div>
              </div>
            </div>
            <div
              style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 10 }}
            >
              Prompt otimizado vs. Prompt com engenharia de prompt
            </div>
            <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, marginBottom: 14 }}>
              O <strong>prompt otimizado</strong> é a versão enxuta do seu
              prompt original — corta saudações, redundâncias e palavras
              desnecessárias, mantendo a intenção.
            </p>
            <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, marginBottom: 18 }}>
              O <strong>prompt com engenharia de prompt</strong> aplica técnicas
              formais: define papel da IA, contexto, regras de entrada e saída,
              formato esperado e restrições.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "14px 16px",
                  border: `1.5px solid ${C.green}30`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.green,
                    letterSpacing: 1.5,
                    marginBottom: 8,
                  }}
                >
                  PROMPT OTIMIZADO
                </div>
                <div
                  style={{ fontSize: 12, color: C.ink, lineHeight: 1.55, marginBottom: 8 }}
                >
                  <strong style={{ color: C.green }}>Vantagens:</strong> rápido
                  de escrever, menos tokens de entrada, ideal para pedidos
                  pontuais.
                </div>
                <div
                  style={{ fontSize: 12, color: C.ink, lineHeight: 1.55, marginBottom: 8 }}
                >
                  <strong style={{ color: C.red }}>Desvantagens:</strong>{" "}
                  resposta pode ser longa demais, formato imprevisível.
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
                  <strong>Quando usar:</strong> tarefas pontuais, perguntas
                  rápidas.
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "14px 16px",
                  border: `1.5px solid ${C.lavender}40`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.lavender,
                    letterSpacing: 1.5,
                    marginBottom: 8,
                  }}
                >
                  ENGENHARIA DE PROMPT
                </div>
                <div
                  style={{ fontSize: 12, color: C.ink, lineHeight: 1.55, marginBottom: 8 }}
                >
                  <strong style={{ color: C.green }}>Vantagens:</strong>{" "}
                  resposta previsível, menos tokens de saída, ideal para uso
                  repetido.
                </div>
                <div
                  style={{ fontSize: 12, color: C.ink, lineHeight: 1.55, marginBottom: 8 }}
                >
                  <strong style={{ color: C.red }}>Desvantagens:</strong> mais
                  tokens de entrada, demora mais para escrever.
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
                  <strong>Quando usar:</strong> agentes, fluxos automatizados,
                  tarefas com formato consistente.
                </div>
              </div>
            </div>
            <button
              onClick={analyzePE}
              disabled={loadingPE}
              style={{
                padding: "12px 26px",
                background: loadingPE ? "#888" : C.lavender,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: loadingPE ? "default" : "pointer",
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              {loadingPE ? "Gerando..." : "🎓 Gerar prompt com engenharia de prompt"}
            </button>
            {error && (
              <div
                style={{
                  color: C.red,
                  fontSize: 13,
                  marginTop: 12,
                  padding: "10px 14px",
                  background: `${C.red}10`,
                  borderRadius: 8,
                  border: `1px solid ${C.red}30`,
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* Advanced comparison */}
        {resultPE && (
          <div style={card}>
            <div
              style={{
                ...sectionLabel,
                background: `${C.lavender}25`,
                color: C.lavender,
              }}
            >
              Comparação avançada
            </div>
            <p
              style={{ fontSize: 13, color: C.muted, marginBottom: 22, marginTop: -4 }}
            >
              Veja o trade-off entre as duas abordagens.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Option 1 */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 18,
                  border: `2px solid ${C.green}40`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.green,
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  OPÇÃO 1
                </div>
                <div
                  style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 14 }}
                >
                  Versão otimizada
                </div>
                <div
                  style={{
                    background: `${C.green}06`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 14,
                    maxHeight: 160,
                    overflowY: "auto",
                  }}
                >
                  <pre
                    style={{
                      fontSize: 11.5,
                      color: C.ink,
                      lineHeight: 1.5,
                      margin: 0,
                      fontFamily: "'Courier New',monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {result!.cleanPrompt}
                  </pre>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
                >
                  <MiniPie input={optTokens} output={optOutputEst} color={C.green} />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    padding: "8px 0",
                  }}
                >
                  <span style={{ color: C.muted }}>Entrada</span>
                  <strong>{optTokens}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    padding: "4px 0 8px",
                  }}
                >
                  <span style={{ color: C.muted }}>Saída estimada</span>
                  <strong>~{optOutputEst}</strong>
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${C.softBg}`,
                    paddingTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
                >
                  <strong style={{ color: C.green }}>Total</strong>
                  <strong style={{ color: C.green }}>{optTotal} tokens</strong>
                </div>
              </div>

              {/* Option 2 */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 18,
                  border: `2px solid ${C.lavender}60`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.lavender,
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  OPÇÃO 2
                </div>
                <div
                  style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 14 }}
                >
                  Engenharia de prompt
                </div>
                <div
                  style={{
                    background: `${C.lavender}06`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 14,
                    maxHeight: 160,
                    overflowY: "auto",
                  }}
                >
                  <pre
                    style={{
                      fontSize: 11.5,
                      color: C.ink,
                      lineHeight: 1.5,
                      margin: 0,
                      fontFamily: "'Courier New',monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {resultPE.cleanPrompt}
                  </pre>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
                >
                  <MiniPie
                    input={peTokens}
                    output={peOutputEst}
                    color={C.lavender}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    padding: "8px 0",
                  }}
                >
                  <span style={{ color: C.muted }}>Entrada</span>
                  <strong>{peTokens}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    padding: "4px 0 8px",
                  }}
                >
                  <span style={{ color: C.muted }}>Saída estimada</span>
                  <strong>~{peOutputEst}</strong>
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${C.softBg}`,
                    paddingTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  <strong style={{ color: C.lavender }}>Total</strong>
                  <strong style={{ color: C.lavender }}>{peTotal} tokens</strong>
                </div>
                <CopyBtn
                  text={resultPE.cleanPrompt}
                  label="📋 Copiar prompt com engenharia"
                />
              </div>
            </div>

            {/* Verdict */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                border: `2px solid ${C.primary}25`,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.primary,
                  letterSpacing: 1.5,
                  marginBottom: 14,
                }}
              >
                📊 VEREDITO — QUAL ESCOLHER PARA O SEU CASO
              </div>

              {resultPE.recommendation && (
                <div
                  style={{
                    background:
                      resultPE.recommendation.bestOption === "engineered"
                        ? `${C.lavender}12`
                        : `${C.green}12`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 14,
                    border: `2px solid ${
                      resultPE.recommendation.bestOption === "engineered"
                        ? C.lavender
                        : C.green
                    }40`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        background:
                          resultPE.recommendation.bestOption === "engineered"
                            ? C.lavender
                            : C.green,
                        color: "#fff",
                        padding: "5px 12px",
                        borderRadius: 16,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.8,
                      }}
                    >
                      ✨ RECOMENDADO PARA VOCÊ
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color:
                          resultPE.recommendation.bestOption === "engineered"
                            ? C.lavender
                            : C.green,
                      }}
                    >
                      {resultPE.recommendation.bestOption === "engineered"
                        ? "Versão com engenharia de prompt"
                        : "Versão otimizada (enxuta)"}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
                    {resultPE.recommendation.reasoning}
                  </div>
                </div>
              )}

              {resultPE.criteria && resultPE.criteria.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.muted,
                      letterSpacing: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    POR QUE ESTA RECOMENDAÇÃO
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {resultPE.criteria.map((c, i) => {
                      const color =
                        c.winner === "optimized"
                          ? C.green
                          : c.winner === "engineered"
                          ? C.lavender
                          : C.muted;
                      const label =
                        c.winner === "optimized"
                          ? "Melhor com a otimizada"
                          : c.winner === "engineered"
                          ? "Melhor com a engenharia"
                          : "Indiferente";
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 12px",
                            background: `${color}08`,
                            borderRadius: 8,
                            borderLeft: `3px solid ${color}`,
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              flex: "1 1 200px",
                              fontSize: 12.5,
                              color: C.ink,
                              lineHeight: 1.5,
                            }}
                          >
                            {c.label}
                          </div>
                          <div
                            style={{
                              background: color,
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 10.5,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: 13,
                  color: C.muted,
                  lineHeight: 1.6,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.softBg}`,
                }}
              >
                {peTotal < optTotal
                  ? resultPE.verdictWhenEngineered
                  : resultPE.verdictWhenOptimized}
              </div>
            </div>

            {resultPE.techniques && resultPE.techniques.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.muted,
                    letterSpacing: 1.5,
                    marginBottom: 8,
                  }}
                >
                  TÉCNICAS APLICADAS
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {resultPE.techniques.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        background: `${C.lavender}20`,
                        color: C.lavender,
                        padding: "5px 12px",
                        borderRadius: 16,
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: `1px solid ${C.lavender}40`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                padding: "10px 14px",
                background: `${C.muted}10`,
                borderRadius: 8,
                fontSize: 11.5,
                color: C.muted,
                lineHeight: 1.5,
              }}
            >
              ℹ️ Estimativas de saída: 1,5x para prompt enxuto e 0,8x para
              engenharia de prompt. A economia real varia conforme o pedido.
            </div>
          </div>
        )}

        {/* Reset */}
        {result && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button
              onClick={reset}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  C.primary;
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                (e.currentTarget as HTMLButtonElement).style.color = C.primary;
              }}
              style={{
                padding: "14px 32px",
                background: "#fff",
                color: C.primary,
                border: `2px solid ${C.primary}`,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 2px 8px rgba(30,58,95,0.08)",
                transition: "all 0.2s",
              }}
            >
              ↺ Calcular outro prompt
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 0 36px",
            color: "#a8b3c0",
            fontSize: 11.5,
            lineHeight: 1.9,
          }}
        >
          <div>Criado por Ana Lenise Novais</div>
        </div>
      </div>
    </div>
  );
}
