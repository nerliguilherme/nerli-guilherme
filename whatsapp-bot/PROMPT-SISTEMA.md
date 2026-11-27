Contexto: este projeto é o sistema de gestão da NGraph Comunicação Visual (São Lourenço da Mata - PE), publicado na Cloudflare em https://morning-hill-1fe6.nerliguilherme.workers.dev. Eu (dono, não sou programador) criei uma assistente de WhatsApp chamada **Nina**, que é um Worker separado (repositório GitHub `nerliguilherme/nerli-guilherme`, branch `claude/nice-albattani-t470oq`, pasta `whatsapp-bot/`; leia `whatsapp-bot/INTEGRACAO.md` lá se tiver acesso). A Nina faz a triagem de orçamentos no WhatsApp e avisa o cliente sobre as etapas do pedido. Quero ligar a Nina neste sistema. Responda sempre em pt-BR.

## Passo 0 — Entenda antes de mexer (me mostre o resultado e espere meu OK)
1. Onde os dados ficam hoje: `localStorage` (chaves `origin_*`), Supabase (pastas `supabase/`, `config.js`) ou os dois? O que faz `js/ngb-servidor.js`?
2. Como o site é publicado (pasta `publicar/`, Worker `morning-hill-1fe6`)? Existe código rodando no SERVIDOR (Worker com rotas, Supabase Edge Function) ou é só site estático?
3. Como funciona hoje o "Assistente de pedidos" (colar conversa → Analisar pedido → orçamento registrado) e onde ficam as ordens de produção e seus status (`origin_production_orders`, `origin_installation_jobs` ou tabelas do Supabase).
4. Quais são os status reais das ordens de produção e da instalação, e onde fica o telefone do cliente.
Me apresente um plano curto com os arquivos que vai alterar e as dúvidas. Se algo abaixo não se encaixar no que você encontrar, pergunte em vez de assumir.

## Regra de segurança (obrigatória)
- O token da Nina (`NINA_API_TOKEN`) NUNCA pode ir para código que roda no navegador nem para o Git. As chamadas à Nina saem de código no servidor: uma rota no Worker do sistema (de preferência via **Service Binding** para o Worker `ngraph-whatsapp-bot`, se for a mesma conta Cloudflare; senão `fetch` com o token guardado em `wrangler secret`) ou uma Supabase Edge Function.
- Essas rotas expõem nome e telefone de clientes. Elas só podem responder a usuários autenticados de verdade no servidor (Supabase Auth validado no servidor, ou o site protegido por **Cloudflare Access**). Login feito só no navegador/localStorage NÃO conta. Se hoje não houver autenticação real, pare e me explique as opções antes de continuar.
- Não coloque chaves `service_role` do Supabase nem nenhum segredo no front-end ou no Git.

## Funcionalidade A — Triagens da Nina dentro do "Assistente de pedidos"
API da Nina (base: `NINA_URL`, ex: `https://ngraph-whatsapp-bot.nerliguilherme.workers.dev`; cabeçalho `Authorization: Bearer <NINA_API_TOKEN>`):
- `GET /api/triagens` → `{ ok, triagens: [{ id, telefone, nome, situacao, resumo, conversa, criado, importada }] }` (só pendentes; `?todas=1` traz todas). `situacao` = `triagem_completa` (orçamento) ou `precisa_atendente` (cliente pediu uma pessoa/reclamação).
- `POST /api/triagens/<id>/importada` → tira da lista de pendentes.

O que fazer:
1. Na tela "Assistente de pedidos", acima do "Novo pedido", um card **"📲 Chegou pelo WhatsApp (Nina)"** listando as pendentes: nome, telefone, horário (fuso America/Recife), prévia do resumo e um selo diferente para `precisa_atendente`. Busca ao abrir a tela + botão de atualizar. Se a Nina estiver fora do ar, mostra um aviso discreto e o resto da tela continua funcionando.
2. Botão **"Usar"**: coloca na caixa de texto o `resumo` + a `conversa` completa e guarda nome/telefone para vincular ao cliente (criar ou achar pelo telefone). Eu revejo e toco em "Analisar pedido" como hoje.
3. Quando o orçamento dessa triagem for confirmado/registrado, chama `POST /api/triagens/<id>/importada`. Botão **"Descartar"** também marca como importada (pedir confirmação).
4. Siga o visual atual (`css/redesign.css`, `css/tema.css`) e funcione bem no celular.

## Funcionalidade B — Avisar o cliente quando o pedido muda de etapa
API: `POST {NINA_URL}/api/pedido` com JSON `{ telefone, nome, pedido, etapa, descricao?, data_instalacao? }`.
- `etapa`: `aprovado` | `em_producao` | `pronto` | `instalacao_agendada` (exige `data_instalacao`, texto tipo "05/12 às 9h") | `entregue`.
- Respostas: `200 {ok:true,enviado:true}`; `200 {ok:true,enviado:false,repetido:true}` (já avisado, tudo bem); `400` dado inválido; `401` token; `502` WhatsApp recusou.
O que fazer:
1. Mapear os status reais do sistema (ordem de produção, pipeline, instalação) para essas 5 etapas. Me mostre o mapeamento antes de implementar.
2. Quando o status mudar para uma dessas etapas, chamar a Nina (pelo servidor). Mostrar um aviso discreto: "Cliente avisado no WhatsApp ✅", "já tinha sido avisado" ou o erro. Erro na Nina NUNCA impede salvar a mudança no sistema.
3. Se o pedido não tiver telefone do cliente, não chamar e avisar "sem telefone, cliente não foi avisado".
4. Uma opção para desligar o aviso automático por pedido (ex: cliente que não quer mensagens).

## Configuração e entrega
- Variáveis: `NINA_URL` (var) e `NINA_API_TOKEN` (secret), documentadas num README curto em pt-BR, com o passo a passo para eu cadastrar.
- Enquanto a Nina não estiver publicada, deixe um modo de teste (ex: `NINA_URL` vazio = cartão oculto e avisos desligados) para nada quebrar.
- Não quebre nada que já existe. Teste no navegador o fluxo completo com dados simulados.
- No fim, me dê um resumo simples do que mudou, o que eu preciso configurar e o que ficou pendente.
