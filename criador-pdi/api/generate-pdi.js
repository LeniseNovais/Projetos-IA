// Função serverless do Vercel
// Recebe os dados do front, chama o Gemini com a API key protegida,
// e devolve a resposta. A chave NUNCA é exposta ao navegador.

module.exports = async function handler(req, res) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY não configurada');
    return res.status(500).json({
      error: 'config_error',
      message: 'Configuração do servidor incompleta. Contate o administrador.'
    });
  }

  try {
    const { discovery, totalPDIs, actionsPerPDI } = req.body;

    // Validação básica
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
4. Distribua os tipos das ações respeitando o equilíbrio 70-20-10 (priorize "desafio", depois "mentoria", depois "treinamento").
5. Toda ação deve ser ESPECÍFICA (não vaga): com o que fazer + quando + como medir.
6. Prazos: distribua entre os próximos 3-9 meses (formato YYYY-MM-DD). Use datas a partir de hoje (${hoje}).
7. O título do PDI deve ser curto e claro (3-6 palavras).
8. "why" (por que importa agora) deve conectar com o trabalho real e feedbacks recebidos.

Responda APENAS com um JSON válido neste formato exato, sem nenhum texto antes ou depois, sem markdown:
{
  "pdis": [
    {
      "title": "string - título curto do PDI",
      "type": "desenvolver" ou "potencializar",
      "why": "string - por que isso importa agora, conectado com feedbacks/contexto",
      "description": "string - descrição detalhada do PDI e gaps a preencher",
      "actions": [
        {
          "type": "desafio" ou "mentoria" ou "treinamento",
          "name": "string - nome específico da ação",
          "description": "string - como será executada, com quem, contexto",
          "deadline": "YYYY-MM-DD",
          "indicator": "string - indicador concreto de sucesso, algo observável"
        }
      ]
    }
  ]
}

Retorne EXATAMENTE ${totalPDIs} PDI(s) com EXATAMENTE ${actionsPerPDI} ações cada.`;

    // Chamada para o Gemini 1.5 Flash (modelo gratuito)
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          responseMimeType: 'application/json'
        }
      })
    });

    // Tratamento de rate limit (429) — limite diário ou por minuto estourado
    if (geminiResponse.status === 429) {
      const errData = await geminiResponse.json().catch(() => ({}));
      const errMessage = (errData?.error?.message || '').toLowerCase();
      const isDaily = errMessage.includes('daily') || 
                      errMessage.includes('quota exceeded') ||
                      errMessage.includes('resource exhausted');

      return res.status(429).json({
        error: 'rate_limit',
        limitType: isDaily ? 'daily' : 'minute'
      });
    }

    // Outros erros do Gemini
    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Erro do Gemini:', geminiResponse.status, errText);
      return res.status(502).json({
        error: 'gemini_error',
        message: 'Erro ' + geminiResponse.status + ': ' + errText
      });
    }

    const data = await geminiResponse.json();

    // Extrair o texto da resposta do Gemini
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Resposta do Gemini sem conteúdo:', JSON.stringify(data));
      return res.status(502).json({
        error: 'empty_response',
        message: 'A IA retornou uma resposta vazia. Tente novamente.'
      });
    }

    // Limpa markdown caso venha
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Tenta extrair só o JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Resposta sem JSON válido:', cleanText);
      return res.status(502).json({
        error: 'invalid_json',
        message: 'A IA retornou uma resposta inválida. Tente novamente.'
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Erro ao parsear JSON:', e.message, cleanText);
      return res.status(502).json({
        error: 'parse_error',
        message: 'A IA retornou uma resposta inválida. Tente novamente.'
      });
    }

    if (!parsed.pdis || !Array.isArray(parsed.pdis)) {
      return res.status(502).json({
        error: 'invalid_structure',
        message: 'A IA retornou uma estrutura inesperada. Tente novamente.'
      });
    }

    // Marcar todos como não removidos (estado inicial)
    parsed.pdis.forEach(pdi => {
      pdi.removed = false;
      pdi.actions = pdi.actions || [];
      pdi.actions.forEach(a => a.removed = false);
    });

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({
      error: 'server_error',
      message: 'Erro inesperado no servidor. Tente novamente.'
    });
  }
}
