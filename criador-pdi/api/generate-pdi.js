module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return res.status(500).json({
      error: 'config_error',
      message: 'Configuração do servidor incompleta.'
    });
  }

  try {
    const { discovery, totalPDIs, actionsPerPDI } = req.body;

    if (!discovery || !discovery.cargo) {
      return res.status(400).json({
        error: 'invalid_input',
        message: 'Dados incompletos. Preencha pelo menos o cargo.'
      });
    }

    const hoje = new Date().toISOString().split('T')[0];

    const prompt = `Você é um especialista em desenvolvimento de pessoas e PDI (Plano de Desenvolvimento Individual). Vou te passar as respostas de um profissional sobre carreira e desenvolvimento. Sua tarefa é criar exatamente ${totalPDIs} PDI(s), cada um com exatamente ${actionsPerPDI} ações específicas seguindo a metodologia 70-20-10.

INFORMAÇÕES DO PROFISSIONAL:
- Cargo/função: ${discovery.cargo}
- Momento de carreira: ${discovery.momento || 'não informado'}
- Feedbacks recebidos: ${discovery.feedbacks || 'não informado'}
- Frustrações/gaps: ${discovery.frustracao || 'não informado'}
- Pontos fortes / o que dá energia: ${discovery.energia || 'não informado'}
- Onde quer estar em 1-2 anos: ${discovery.futuro || 'não informado'}
- Ideias prévias de PDI: ${discovery.ideias || 'sem ideias prévias - sugira você'}

REGRAS:
1. Crie ${totalPDIs} PDI(s) distintos, COMPLEMENTARES (não redundantes entre si).
2. Cada PDI deve ter tipo "desenvolver" (gap) ou "potencializar" (forte que quer ampliar).
3. Cada ação deve ter tipo: "desafio" (70% - experiência prática), "mentoria" (20% - trocas/feedbacks) ou "treinamento" (10% - cursos/leituras).
4. Distribua os tipos das ações respeitando o equilíbrio 70-20-10.
5. Toda ação deve ser ESPECÍFICA: com o que fazer + quando + como medir.
6. Prazos: distribua entre os próximos 3-9 meses (formato YYYY-MM-DD). Use datas a partir de hoje (${hoje}).
7. O título do PDI deve ser curto e claro (3-6 palavras).
8. "why" deve conectar com o trabalho real e feedbacks recebidos.

Responda APENAS com um JSON válido neste formato exato, sem nenhum texto antes ou depois, sem markdown:
{
  "pdis": [
    {
      "title": "string",
      "type": "desenvolver" ou "potencializar",
      "why": "string",
      "description": "string",
      "actions": [
        {
          "type": "desafio" ou "mentoria" ou "treinamento",
          "name": "string",
          "description": "string",
          "deadline": "YYYY-MM-DD",
          "indicator": "string"
        }
      ]
    }
  ]
}

Retorne EXATAMENTE ${totalPDIs} PDI(s) com EXATAMENTE ${actionsPerPDI} ações cada.`;

    // ─── TENTA GEMINI PRIMEIRO ───────────────────────────────
    if (geminiKey) {
      const geminiResult = await tryGemini(geminiKey, prompt);

      if (geminiResult.success) {
        return res.status(200).json(geminiResult.data);
      }

      // Independente do motivo (limite ou instabilidade), tenta o Groq
      // Se for instabilidade, na próxima requisição tentará o Gemini de novo
      if (geminiResult.rateLimited) {
        console.log('Gemini com limite atingido, tentando Groq...');
      } else {
        console.log('Gemini instável, tentando Groq desta vez...');
      }
    }

    // ─── TENTA GROQ ──────────────────────────────────────────
    if (groqKey) {
      const groqResult = await tryGroq(groqKey, prompt);

      if (groqResult.success) {
        return res.status(200).json(groqResult.data);
      }

      if (groqResult.rateLimited) {
        return res.status(429).json({
          error: 'rate_limit',
          limitType: 'daily'
        });
      }

      return res.status(502).json({
        error: 'groq_error',
        message: groqResult.message
      });
    }

    // Sem nenhuma API disponível
    return res.status(429).json({
      error: 'rate_limit',
      limitType: 'daily'
    });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({
      error: 'server_error',
      message: 'Erro inesperado no servidor. Tente novamente.'
    });
  }
};

// ─── FUNÇÃO GEMINI ───────────────────────────────────────────
async function tryGemini(apiKey, prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          responseMimeType: 'application/json'
        }
      })
    });

    if (response.status === 429) {
      return { success: false, rateLimited: true };
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini erro:', response.status, errText);
      return { success: false, rateLimited: false, message: 'Gemini indisponível.' };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, rateLimited: false, message: 'Resposta vazia do Gemini.' };

    return parseAndReturn(text);
  } catch (err) {
    console.error('Erro ao chamar Gemini:', err);
    return { success: false, rateLimited: false, message: 'Erro de conexão com Gemini.' };
  }
}

// ─── FUNÇÃO GROQ ─────────────────────────────────────────────
async function tryGroq(apiKey, prompt) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (response.status === 429) {
      return { success: false, rateLimited: true };
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq erro:', response.status, errText);
      return { success: false, rateLimited: false, message: 'Groq indisponível.' };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return { success: false, rateLimited: false, message: 'Resposta vazia do Groq.' };

    return parseAndReturn(text);
  } catch (err) {
    console.error('Erro ao chamar Groq:', err);
    return { success: false, rateLimited: false, message: 'Erro de conexão com Groq.' };
  }
}

// ─── PARSER COMPARTILHADO ────────────────────────────────────
function parseAndReturn(text) {
  try {
    let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return { success: false, rateLimited: false, message: 'JSON inválido na resposta.' };

    const parsed = JSON.parse(match[0]);
    if (!parsed.pdis || !Array.isArray(parsed.pdis)) {
      return { success: false, rateLimited: false, message: 'Estrutura inesperada.' };
    }

    parsed.pdis.forEach(pdi => {
      pdi.removed = false;
      pdi.actions = pdi.actions || [];
      pdi.actions.forEach(a => a.removed = false);
    });

    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, rateLimited: false, message: 'Erro ao processar resposta da IA.' };
  }
}
