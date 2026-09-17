# Telegram Replicador Worker

Processo Node.js persistente para autenticar uma conta Telegram com MTProto (GramJS), listar chats e registrar novas mensagens do grupo configurado. O painel Next.js permanece separado e não recebe a sessão Telegram.

## Instalação

```bash
cd telegram-worker
npm install
cp .env.example .env
```

Preencha `TELEGRAM_API_ID` e `TELEGRAM_API_HASH` obtidos em [my.telegram.org](https://my.telegram.org), além das credenciais do Supabase. Nunca versione `.env`, sessões ou chaves.

## Executar

```bash
npm run dev
npm run build
npm run start
```

O worker expõe `GET /health` na porta `8787` (ou `PORT`) e `GET /chats` para listar somente os chats da conta autenticada. O título padrão do grupo de origem é `BLACK BAT.INVEST`; altere `ORIGIN_CHAT_TITLE` sem fixar um ID.

## Autenticação

A autenticação usa as funções em `src/telegram/auth.ts`: código enviado ao telefone, senha 2FA quando solicitada e geração de StringSession. A sessão é segredo operacional, fica apenas no processo/Supabase e nunca aparece nos logs ou no frontend. O fluxo do painel pode chamar um serviço persistente autorizado para iniciar o código e concluir a autenticação.

## Operação contínua

Use um supervisor como `systemd`, Docker ou PM2 no servidor Node.js. Não execute o listener MTProto em uma função serverless da Vercel. O worker reconecta via `connectionRetries` do GramJS; em caso de sessão expirada, reautentique a conta.

## Supabase

As gravações usam as tabelas existentes quando disponíveis: `telegram_connections`, `telegram_chats`, `incoming_messages` e `replication_logs`. Nenhuma tabela ou migration é criada automaticamente, pois o schema deve ser confirmado antes. Ajuste os nomes/colunas no serviço após validar o schema do projeto.
