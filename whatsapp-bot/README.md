# Nina — assistente de WhatsApp da NGraph

A Nina atende clientes no WhatsApp da NGraph. Ela faz duas coisas:
1. **Triagem do orçamento:** pergunta o que o cliente precisa e entrega um **resumo pronto** na própria conversa, para a equipe só precisar orçar.
2. **Acompanhamento do pedido:** quando o sistema da gráfica muda a etapa (*Aprovado → Em produção → Pronto → Instalação agendada → Entregue*), ela avisa o cliente. Se o cliente perguntar "como está meu pedido?", ela responde. Veja [INTEGRACAO.md](INTEGRACAO.md) e [TEMPLATES.md](TEMPLATES.md).

## Como funciona

```
Cliente manda mensagem
   → Meta (API oficial do WhatsApp) avisa o servidor
   → servidor na Cloudflare (grátis) espera ~8s para juntar mensagens picadas
   → Claude lê o histórico + config/empresa.md e responde
   → triagem completa? manda "📋 Resumo do pedido" na conversa e o bot fica quieto por 48h
```

- **Nunca passa preço.** Só coleta as informações.
- Se apresenta como **Nina, assistente virtual da NGraph**.
- **Vê fotos**, como a foto da fachada. Áudio e vídeo ele não abre: pede para o cliente escrever.
- Se o cliente pedir uma pessoa, ou o assunto não for orçamento (pedido em andamento, reclamação, fornecedor), ele avisa que vai chamar a equipe e fica quieto.
- **Se alguém da equipe responder pelo celular**, o bot fica quieto naquela conversa por 12h. Isso só funciona no modo coexistência (veja o passo 1).
- Se der qualquer erro, o cliente recebe "em instantes alguém da equipe responde" e a conversa passa para a equipe.

## O dia a dia: só um arquivo

Edite **`config/empresa.md`**, que guarda serviços, perguntas da triagem, horário, endereço, prazos e regras. O assistente usa só o que está ali e não inventa o resto.

Para editar pelo navegador: no GitHub, abra o arquivo, clique no lápis ✏️, salve (commit) na branch `main`. Em cerca de 1 minuto o bot já usa a versão nova (passo 7).

Os ajustes finos ficam em `wrangler.toml`, na seção `[vars]`:

| Variável | O que faz | Padrão |
|---|---|---|
| `MODEL` | Modelo do Claude | `claude-opus-5-5` |
| `ESPERA_SEGUNDOS` | Tempo de espera para juntar mensagens | 8 |
| `PAUSA_HORAS_ATENDENTE` | Tempo quieto depois que a equipe responde | 12 |
| `PAUSA_HORAS_TRIAGEM` | Tempo quieto depois do resumo | 48 |
| `NOVA_CONVERSA_HORAS` | Tempo parado até a conversa recomeçar do zero | 24 |
| `IGNORAR_NUMEROS` | Números que o bot não responde (fornecedores, família) | vazio |
| `SISTEMA_WEBHOOK_URL` | Endereço do seu sistema que recebe o resumo da triagem | vazio (desligado) |

---

## Instalação, passo a passo

### 0. Contas necessárias
1. **Cloudflare**: grátis, em https://dash.cloudflare.com/sign-up
2. **Anthropic Console**: em https://console.anthropic.com. Coloque crédito (US$ 5 é suficiente para começar) e crie uma **API key**. É diferente da assinatura do claude.ai.
3. **Meta for Developers**: em https://developers.facebook.com, com o Facebook ligado ao portfólio empresarial (Business Manager) da NGraph.
4. **Node.js 22** instalado no computador, para o primeiro deploy.

### 1. App na Meta
1. Em developers.facebook.com, vá em **Meus apps → Criar app → tipo "Empresa"**, ligado ao portfólio da NGraph.
2. Adicione o produto **WhatsApp**.
3. **Comece pelo número de teste** que a Meta oferece de graça. Cadastre o seu celular como destinatário de teste e valide o bot inteiro antes de mexer no número real.
4. Para o **número real**, há duas formas:
   - **Escolhido: provedor com coexistência** (o app do celular continua funcionando). A Meta exige que esse cadastro passe por um parceiro, como a 360dialog. Antes de contratar, confirme com o provedor: (a) acesso direto à API, para usar este código; (b) webhook `smb_message_echoes`, que avisa quando a equipe responde pelo celular; (c) preço mensal e cobrança das mensagens de resposta. ⚠️ O código ainda fala o formato da Meta, e cada provedor tem pequenas diferenças: **depois de escolher, o código precisa ser adaptado ao provedor**.
5. Anote o **Phone Number ID**, que fica em WhatsApp → Configuração da API.

### 2. Token permanente da Meta
1. Em business.facebook.com, vá em **Configurações → Usuários do sistema → Adicionar** (tipo Admin).
2. Dê ao usuário acesso ao app e à conta do WhatsApp.
3. Clique em **Gerar token** e marque as permissões `whatsapp_business_messaging` e `whatsapp_business_management`. Guarde o token.
4. No app, em **Configurações → Básico**, copie a **Chave secreta do app** (App Secret).

### 3. Publicar o bot na Cloudflare
No computador, dentro da pasta `whatsapp-bot`:

```bash
npm install
npx wrangler login                          # abre o navegador para entrar na Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # cole a key da Anthropic
npx wrangler secret put WHATSAPP_TOKEN      # cole o token permanente da Meta
npx wrangler secret put WHATSAPP_APP_SECRET # cole a chave secreta do app
npx wrangler secret put WHATSAPP_VERIFY_TOKEN  # invente uma senha qualquer e anote
npx wrangler secret put API_PEDIDOS_TOKEN      # senha da integração com o sistema (openssl rand -hex 32)
```

Em `wrangler.toml`, troque `PHONE_NUMBER_ID = "PREENCHER"` pelo ID anotado no passo 1. Depois rode:

```bash
npm run deploy
```

No fim aparece o endereço, algo como `https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev`. Abra esse endereço no navegador: deve aparecer "Assistente NGraph no ar ✅".

### 4. Ligar o webhook na Meta
No app da Meta, vá em **WhatsApp → Configuração → Webhook → Editar**:
- **URL de retorno**: `https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev/webhook`
- **Token de verificação**: a senha que você inventou em `WHATSAPP_VERIFY_TOKEN`
- Em **Campos do webhook**, assine `messages`. No modo coexistência, assine também `smb_message_echoes`.

### 5. Preencher `config/empresa.md`
Troque tudo que está marcado com `[PREENCHER]` e publique de novo (`npm run deploy`, ou o passo 7).

### 5b. Templates e integração com o sistema
- Cadastre as 5 mensagens de aviso: [TEMPLATES.md](TEMPLATES.md)
- No sistema da gráfica, chame `/api/pedido` quando a etapa mudar: [INTEGRACAO.md](INTEGRACAO.md)

### 6. Testar
Mande mensagem do seu celular para o número (o de teste, no começo). Para ver os registros em tempo real:

```bash
npx wrangler tail
```

### 7. Deploy automático pelo GitHub (opcional, recomendado)
Com isso, editar o `empresa.md` no site do GitHub já atualiza o bot.
1. Na Cloudflare, vá em **Minha conta → API Tokens → Criar token**, modelo **"Edit Cloudflare Workers"**.
2. No GitHub, em **Settings → Secrets and variables → Actions**, crie:
   - `CLOUDFLARE_API_TOKEN` com o token acima
   - `CLOUDFLARE_ACCOUNT_ID`, que aparece na barra lateral do painel da Cloudflare

---

## Custos

| Item | Custo |
|---|---|
| Cloudflare Workers + Durable Objects | Grátis no volume da NGraph |
| Provedor com coexistência (ex: 360dialog) | Mensalidade por número (a confirmar, a partir de ~€49/mês) |
| WhatsApp, respostas | Eram grátis na janela de 24h. Há indícios de mudança em out/2026: **confirme com o provedor** |
| WhatsApp, avisos de pedido (templates de utilidade) | Centavos por mensagem |
| Claude (API) | Cobrado por uso. Com `claude-opus-5-5`, estimativa de US$ 10–30/mês para 10 conversas por dia. Com `claude-haiku-5-5`, menos de US$ 1/mês |

Para trocar de modelo, mude `MODEL` no `wrangler.toml` e publique de novo.

## Para desenvolvedores

- `src/index.ts`: recebe o webhook e confere a assinatura da Meta
- `src/conversa.ts`: um Durable Object por cliente, com histórico, espera e pausas
- `src/claude.ts`: prompt e chamada ao Claude (saída em JSON estruturado)
- `src/whatsapp.ts`: envio de mensagens e templates, download de mídia, leitura do webhook e normalização do número (o 9 extra)
- `src/pedidos.ts`: etapas do pedido e nomes dos templates
- `npm test`: teste de ponta a ponta com Meta e Claude simulados
- `npm run check`: verificação de tipos
