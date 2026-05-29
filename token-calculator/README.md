# Calculadora de Tokens

Estime os tokens do seu prompt e receba uma versão otimizada com IA (Gemini 1.5 Flash — gratuito).

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Google Gemini 1.5 Flash** via API Route segura (chave nunca exposta no frontend)
- Deploy no **Vercel** (gratuito)

---

## Como rodar localmente

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/token-calculator.git
cd token-calculator
npm install
```

### 2. Configure a chave da API Gemini

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione sua chave:

```
GEMINI_API_KEY=sua_chave_aqui
```

> **Onde obter a chave:** acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), faça login com sua conta Google e crie uma chave gratuita.

### 3. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Deploy no Vercel

### 1. Suba o projeto no GitHub

```bash
git init
git add .
git commit -m "feat: calculadora de tokens com Gemini"
git remote add origin https://github.com/seu-usuario/token-calculator.git
git push -u origin main
```

### 2. Importe no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione o repositório `token-calculator`
4. Clique em **"Deploy"** (as configurações são detectadas automaticamente)

### 3. Adicione a variável de ambiente no Vercel

1. No painel do projeto, vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** sua chave do Google AI Studio
   - **Environment:** Production, Preview, Development
3. Clique em **Save**
4. Vá em **Deployments** e clique em **Redeploy** para aplicar

---

## Estrutura do projeto

```
token-calculator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts     # API Route segura (chama Gemini no servidor)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Interface principal
│   └── lib/
│       ├── constants.ts         # Regras de ouro e tipo de texto
│       ├── parseJson.ts         # Parser robusto de JSON
│       ├── prompts.ts           # Templates de prompts para Gemini
│       ├── tokens.ts            # Estimativa de tokens
│       └── types.ts             # Tipos TypeScript compartilhados
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Segurança

- A `GEMINI_API_KEY` **nunca** vai para o frontend — fica apenas nas variáveis de ambiente do servidor
- O arquivo `.env.local` está no `.gitignore` e nunca é commitado
- As chamadas à API Gemini acontecem na API Route (`/api/analyze`), não no browser

## Limites gratuitos do Gemini 1.5 Flash (Google AI Studio)

| Limite | Valor |
|--------|-------|
| Requisições por minuto | 15 RPM |
| Tokens por dia | 1.000.000 |
| Tokens por minuto | 1.000.000 |

Suficiente para uso pessoal e demonstrações.
