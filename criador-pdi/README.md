# Criador de PDI (versão pública)

Versão pública do Criador de PDI, usando a API gratuita do Google Gemini.

## 📁 Estrutura do projeto

```
criador-pdi/
├── index.html              ← Front-end (interface)
├── api/
│   └── generate-pdi.js     ← Função serverless (chama o Gemini)
├── package.json
└── README.md
```

## 🔐 Como funciona a segurança da API key

- A chave do Gemini fica numa **variável de ambiente** no Vercel (`GEMINI_API_KEY`)
- O navegador **nunca** vê a chave — ela só existe no servidor
- A função `api/generate-pdi.js` lê a chave de `process.env.GEMINI_API_KEY` e chama o Gemini com ela
- O front (`index.html`) chama apenas `/api/generate-pdi`, sem precisar saber da chave

---

## 🚀 Passo a passo de deploy no Vercel

### 1. Conectar o repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar conta do GitHub)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório do GitHub
4. Clique em **"Import"**

### 2. Configurar Root Directory

Se o projeto estiver dentro de uma pasta (ex: `criador-pdi/` dentro de um repositório maior), configure:

- **Root Directory:** `criador-pdi`

### 3. Configurar a variável de ambiente (CRUCIAL!)

Antes de clicar em "Deploy", abra a seção **"Environment Variables"**:

| Name              | Value                            |
|-------------------|----------------------------------|
| `GEMINI_API_KEY`  | (cole aqui sua chave do Gemini)  |

Depois clique em **"Add"** e por fim em **"Deploy"**.

### 4. Aguardar o deploy

O Vercel vai construir e publicar em ~30 segundos. Você vai receber uma URL do tipo `https://seu-projeto.vercel.app`.

### 5. Testar

Acesse a URL e gere um PDI. Se tudo estiver certo, a IA vai responder normalmente.

---

## ⚙️ Limites do plano gratuito do Gemini

- **15 requisições por minuto**
- **1.500 requisições por dia**
- **1 milhão de tokens por minuto**

Quando o limite diário for atingido, o usuário verá uma tela amigável avisando para tentar novamente no dia seguinte. O contador reseta automaticamente.

## 🆘 Solução de problemas

**Erro 500 ao gerar PDI**
→ Verifique se a variável `GEMINI_API_KEY` foi configurada corretamente no Vercel (Settings → Environment Variables).

**A tela de "limite atingido" aparece sempre**
→ Pode ser que a chave esteja inválida ou revogada. Gere uma nova no [Google AI Studio](https://aistudio.google.com) e atualize a variável no Vercel.

**Após atualizar a variável de ambiente, nada muda**
→ Faça um redeploy: no painel do Vercel, vá em **Deployments** → menu de 3 pontinhos no último deploy → **Redeploy**.

---

Criado por Ana Lenise Novais
