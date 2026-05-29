export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0;
  return Math.round(text.trim().split(/\s+/).length / 0.7);
}

export function tokenComposition(text: string) {
  if (!text || !text.trim())
    return { common: 0, long: 0, punct: 0, numbers: 0 };
  const words = text.trim().split(/\s+/);
  let long = 0,
    numbers = 0;
  words.forEach((w) => {
    if (/\d/.test(w)) numbers++;
    else if (w.length > 7) long++;
  });
  const punct = (text.match(/[^a-záàâãéêíóôõúüç\w\s]/gi) || []).length;
  const common = words.length - long - numbers;
  const sum = common + long + punct + numbers || 1;
  return {
    common: Math.round((common / sum) * 100),
    long: Math.round((long / sum) * 100),
    punct: Math.round((punct / sum) * 100),
    numbers: Math.round((numbers / sum) * 100),
  };
}
