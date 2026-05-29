export function buildOptimizedPrompt(text: string, textType: string): string {
  return `Você é um otimizador de prompts focado em REDUZIR TOKENS. Reescreva o prompt abaixo cortando saudações, redundâncias, contexto óbvio e palavras desnecessárias — SEM aplicar técnicas formais de engenharia de prompt (sem cabeçalhos, sem role explícito, sem seções). Mantenha simples e direto.

Tipo: ${textType}
Prompt original:
"""
${text}
"""

REGRAS:
1. cleanPrompt DEVE ter menos palavras que o original.
2. Sem cabeçalhos como "# Papel" ou "# Tarefa".
3. Frases diretas, sem estrutura formal.
4. Mantenha a intenção original intacta.

Responda APENAS JSON válido, sem markdown:
{
  "noiseExplanation": "2-3 frases citando ineficiências concretas do texto original",
  "cleanPrompt": "versão enxuta, frases diretas, sem cabeçalhos",
  "cleanExplanation": "1 frase dizendo o que foi cortado",
  "tips": ["dica1 sobre redução de tokens", "dica2", "dica3"]
}`;
}

export function buildEngineeredPrompt(text: string, textType: string): string {
  return `Você é um Prompt Engineer sênior. Reescreva o prompt abaixo aplicando ENGENHARIA DE PROMPT FORMAL com TODAS as técnicas aplicáveis.

Tipo: ${textType}
Prompt original:
"""
${text}
"""

REGRAS PARA cleanPrompt:
1. Use seções markdown (# Papel, # Contexto, # Tarefa, # Regras, # Formato de saída, # Exceções) quando relevante.
2. SEMPRE inclua "Formato de saída" com tamanho/formato explícitos.
3. Qualidade > brevidade aqui.

REGRAS PARA techniques:
- Liste APENAS as técnicas que VOCÊ REALMENTE APLICOU.
- Nomes: "Role prompting", "Contexto estruturado", "Regras de entrada", "Regras de saída", "Formato de saída explícito", "Restrições e exceções", "Few-shot prompting", "Chain-of-thought", "Definição de tom", "Definição de tamanho".

REGRAS PARA recommendation — VIÉS É UM PROBLEMA REAL:
Você acabou de criar o prompt com engenharia de prompt. Existe um viés natural de recomendar o que você criou. RESISTA a esse viés.

CRITÉRIOS para recomendar "optimized":
- Pergunta direta, consulta única, dúvida pontual
- Pedido sem necessidade de formato específico
- Tarefa que provavelmente não será repetida
- Pedido criativo ou exploratório
- Prompt já curto (menos de 20 palavras) com intenção clara
SE O PROMPT SE ENCAIXA EM QUALQUER UM DESSES CRITÉRIOS → recomende "optimized".

CRITÉRIOS para recomendar "engineered":
- Prompt será usado repetidamente (agente, automação, template)
- Tarefa exige formato de saída muito específico e consistente
- Pedido complexo com múltiplos requisitos interdependentes
- Erros de interpretação teriam consequências reais
SE NENHUM DESSES CRITÉRIOS SE APLICA CLARAMENTE → recomende "optimized".

Em caso de dúvida, o padrão é "optimized".

Responda APENAS JSON válido, sem markdown:
{
  "noiseExplanation": "2-3 frases analisando o prompt original do ponto de vista de engenharia de prompt",
  "cleanPrompt": "prompt completo com seções estruturadas em markdown (use \\n para quebras de linha)",
  "cleanExplanation": "1-2 frases listando as técnicas aplicadas",
  "techniques": ["lista das técnicas REALMENTE aplicadas neste prompt"],
  "verdictWhenOptimized": "veredito quando opção 1 ganha em tokens",
  "verdictWhenEngineered": "veredito quando opção 2 ganha em tokens",
  "recommendation": { "bestOption": "optimized ou engineered", "reasoning": "2-3 frases específicas" },
  "criteria": [
    {"label": "critério 1", "winner": "optimized ou engineered ou tie"},
    {"label": "critério 2", "winner": "..."},
    {"label": "critério 3", "winner": "..."},
    {"label": "critério 4", "winner": "..."},
    {"label": "critério 5", "winner": "..."}
  ],
  "tips": ["dica1", "dica2", "dica3"]
}`;
}
