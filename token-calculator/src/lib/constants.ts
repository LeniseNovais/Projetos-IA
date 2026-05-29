export const TYPE_INFO: Record<string, { title: string; desc: string }> = {
  "Prompt livre": {
    title: "Prompt livre",
    desc: 'Escreva o que você quer que a IA faça (ex: "resuma essa ata em 3 bullets"). É a forma mais comum e cobrada token a token a cada chamada.',
  },
  "Instruções do agente": {
    title: "Instruções do agente",
    desc: 'Escreva instruções fixas que definem o comportamento da IA (ex: "Você é um Agile Coach especializado em retros. Sempre responda em português."). É enviado em todas as chamadas, então otimizá-lo gera economia exponencial.',
  },
};

export const GOLDEN_RULES = [
  {
    title: "Vá direto ao verbo de ação",
    text: "Comece pelo que você quer (analise, resuma, liste, compare). Saudações e apresentações pessoais são puro custo sem ganho de qualidade.",
    example:
      'Em vez de "Oi, tudo bem? Você poderia me ajudar a resumir essa ata?", escreva "Resuma esta ata em 3 bullets".',
  },
  {
    title: "Separe contexto fixo de pedido variável",
    text: "Tudo que se repete em todas as chamadas (papel da IA, formato preferido, tom) vai uma vez nas instruções do agente. Só o pedido específico fica no prompt do dia a dia.",
    example:
      'Coloque "Você é um Agile Coach. Responda sempre em português, em até 100 palavras" nas instruções do agente. No prompt do dia, escreva apenas "Sugira 3 dinâmicas para a retro de hoje".',
  },
  {
    title: "Recorte antes de colar",
    text: "Quando enviar trechos de documentos, mantenha só os parágrafos que importam para o pedido. Anexar a ata inteira para pedir os action items é desperdício.",
    example: null,
  },
  {
    title: "Inicie uma nova conversa por tarefa",
    text: "Históricos longos são reenviados a cada turno e multiplicam o custo. Para um novo objetivo, abra um chat novo em vez de continuar o antigo.",
    example:
      "Se você passou a manhã pedindo resumos no chat A e agora quer ajuda com um e-mail, abra um chat B — assim o histórico de resumos não é reenviado a cada nova mensagem.",
  },
  {
    title: "Defina o tamanho da resposta",
    text: 'Peça "em 3 bullets", "em até 80 palavras" ou "resposta curta". Resposta gerada também é cobrada — tokens de saída costumam custar mais que os de entrada.',
    example:
      '"Explique inflação" pode gerar 500 palavras. "Explique inflação em 3 bullets curtos" gera ~50 palavras — mesma utilidade, 10x menos tokens de saída.',
  },
  {
    title: "Refine em vez de reescrever do zero",
    text: 'Se a resposta veio quase boa, peça ajustes pontuais ("reduza para 3 itens", "mais formal") em vez de mandar todo o contexto outra vez.',
    example:
      'Em vez de copiar o prompt original e adicionar "agora mais formal", apenas digite "deixe mais formal" — a IA já tem o contexto no chat.',
  },
];
