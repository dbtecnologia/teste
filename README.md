# Dudê Móveis · Central de assistência

MVP funcional para registrar um móvel danificado durante a entrega, acompanhar a fila da loja e compartilhar um acompanhamento individual com o cliente.

## O que está funcionando

- App responsivo do entregador em `/entregador` (também é a tela inicial `/`).
- Nova assistência em três etapas, validação no cliente e na API, fotos separadas por categoria e botão de preenchimento demonstrativo.
- Protocolo idempotente: uma mesma tentativa de envio não cria dois chamados.
- Painel administrativo em `/painel`, com fila, totais por status, busca, filtros por loja e fabricante, detalhe, fotos, observações internas e ações controladas.
- Quatro transições na ordem `Pendente → Aguardando chegada → Peça recebida → Concluída`.
- Área pública em `/cliente/[token]`; o token é individual, não é o protocolo e pode ser substituído no painel.
- Dados fictícios para duas lojas e usuários de teste.
- Tema centralizado em `lib/dude-theme.ts`, com a marca substituível em `public/dude-moveis-logo.svg`.

## Rodar localmente

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abra `http://localhost:3000`. O painel fica em `http://localhost:3000/painel`.

Para validar a versão de produção:

```bash
pnpm exec tsc --noEmit --incremental false
pnpm build
pnpm start
```

## Usuários demonstrativos

- Administradora geral: Marina Duarte — consulta as duas lojas.
- Atendente Centro: Rafael Lima — acesso à loja Centro.
- Atendente Norte: Joana Alves — acesso à loja Norte.
- Entregadora: Ana Souza — vê os chamados que abriu.

O seletor de módulo da interface usa esses perfis demonstrativos. A API também aceita os cabeçalhos `x-demo-role`, `x-demo-store` e `x-demo-courier` para a validação local.

## API demonstrativa

- `GET /api/assistencias`: lista com filtros `search`, `status`, `storeId` e `manufacturer`.
- `POST /api/assistencias`: cria uma assistência e exige as duas categorias de foto.
- `GET /api/assistencias/:id`: detalhe protegido por loja/perfil.
- `PATCH /api/assistencias/:id`: registra pedido, recebimento, conclusão, observação interna ou substituição do link.
- `GET /api/public/assistencias/:token`: resposta pública mínima, sem fotos privadas, funcionários ou observações internas.

O armazenamento atual é em memória para manter o MVP executável sem credenciais externas. Antes de produção, substitua a camada de `lib/assistances.ts` por repositórios MySQL, adicione autenticação real e conecte as fotos a um bucket privado com validação de MIME, tamanho e autorização por requisição. As variáveis esperadas estão em `.env.example`.

