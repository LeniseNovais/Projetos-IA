export function parseJsonRobust(raw: string): Record<string, unknown> {
  // Remove markdown fences
  let clean = raw.replace(/```json|```/g, "").trim();

  // Extract JSON block
  const fb = clean.indexOf("{");
  const lb = clean.lastIndexOf("}");
  if (fb !== -1 && lb !== -1) clean = clean.substring(fb, lb + 1);

  // Attempt 1: direct parse
  try {
    return JSON.parse(clean);
  } catch {}

  // Attempt 2: escape raw newlines inside strings
  try {
    let fixed = "";
    let inString = false;
    let escapeNext = false;
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      if (escapeNext) {
        fixed += ch;
        escapeNext = false;
        continue;
      }
      if (ch === "\\") {
        fixed += ch;
        escapeNext = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        fixed += ch;
        continue;
      }
      if (inString) {
        if (ch === "\n") fixed += "\\n";
        else if (ch === "\r") fixed += "\\r";
        else if (ch === "\t") fixed += "\\t";
        else fixed += ch;
      } else {
        fixed += ch;
      }
    }
    return JSON.parse(fixed);
  } catch {}

  // Attempt 3: regex extraction
  const extract = (key: string): string | null => {
    const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "s");
    const m = clean.match(re);
    return m
      ? m[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\")
      : null;
  };
  const extractArray = (key: string): string[] => {
    const re = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`, "s");
    const m = clean.match(re);
    if (!m) return [];
    const items = m[1].match(/"((?:[^"\\\\]|\\\\.)*)"/g) || [];
    return items.map((s) =>
      s
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
    );
  };

  const result: Record<string, unknown> = {
    noiseExplanation: extract("noiseExplanation") || "",
    cleanPrompt: extract("cleanPrompt") || "",
    cleanExplanation: extract("cleanExplanation") || "",
    techniques: extractArray("techniques"),
    verdictWhenOptimized: extract("verdictWhenOptimized") || "",
    verdictWhenEngineered: extract("verdictWhenEngineered") || "",
    tips: extractArray("tips"),
    recommendation: null,
    criteria: [],
  };

  const recMatch = clean.match(/"recommendation"\s*:\s*\{([^}]*)\}/s);
  if (recMatch) {
    const best = recMatch[1].match(/"bestOption"\s*:\s*"([^"]*)"/);
    const reason = recMatch[1].match(/"reasoning"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
    result.recommendation = {
      bestOption: best ? best[1] : "optimized",
      reasoning: reason
        ? reason[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
        : "",
    };
  }

  const critArrayMatch = clean.match(
    /"criteria"\s*:\s*\[([\s\S]*?)\](?=\s*,|\s*\})/
  );
  if (critArrayMatch) {
    const items = critArrayMatch[1].match(/\{[^}]*\}/g) || [];
    result.criteria = items.map((item) => {
      const lbl = item.match(/"label"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const win = item.match(/"winner"\s*:\s*"([^"]*)"/);
      return { label: lbl ? lbl[1] : "", winner: win ? win[1] : "tie" };
    });
  }

  if (result.cleanPrompt) return result;

  throw new Error("Não foi possível processar a resposta da IA.");
}
