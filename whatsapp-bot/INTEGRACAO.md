# Integração com o sistema da gráfica

O sistema da NGraph só precisa fazer **uma chamada HTTP** quando um pedido muda de etapa. A Nina:
1. manda o aviso (template) para o cliente;
2. guarda a etapa, para responder quando o cliente perguntar "como está meu pedido?".

## 1. Sistema → Nina: pedido mudou de etapa

```
POST https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev/api/pedido
Authorization: Bearer <API_PEDIDOS_TOKEN>
Content-Type: application/json

{
  "telefone": "81995551234",
  "nome": "Joana Souza",
  "pedido": "1234",
  "etapa": "em_producao",
  "descricao": "Fachada ACM 3x1m",
  "data_instalacao": "05/12 às 9h"
}
```

| Campo | Obrigatório | Observação |
|---|---|---|
| `telefone` | sim | Com DDD, com ou sem 55, com ou sem máscara |
| `nome` | sim | Só o primeiro nome aparece na mensagem |
| `pedido` | sim | Número ou código do pedido |
| `etapa` | sim | `aprovado`, `em_producao`, `pronto`, `instalacao_agendada` ou `entregue` |
| `descricao` | não | Ajuda a Nina a responder perguntas sobre o pedido |
| `data_instalacao` | só em `instalacao_agendada` | Texto livre, ex: "05/12 às 9h" |

Respostas possíveis:
- `200 {"ok":true,"enviado":true}`: aviso enviado
- `200 {"ok":true,"enviado":false,"repetido":true}`: essa etapa já tinha sido avisada, e nada foi reenviado. Pode chamar à vontade
- `400`: campo faltando ou inválido (a mensagem diz qual)
- `401`: token errado
- `502`: o WhatsApp recusou, geralmente por template não aprovado ou número inválido. Vale tentar de novo depois

Exemplos de chamada:

```bash
curl -X POST https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev/api/pedido \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -d '{"telefone":"81995551234","nome":"Joana","pedido":"1234","etapa":"em_producao"}'
```

```js
// JavaScript / Node
await fetch("https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev/api/pedido", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.NINA_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ telefone, nome, pedido, etapa }),
});
```

```php
// PHP
$ch = curl_init("https://ngraph-whatsapp-bot.SEU-USUARIO.workers.dev/api/pedido");
curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ["Authorization: Bearer $token", "Content-Type: application/json"],
  CURLOPT_POSTFIELDS => json_encode(compact("telefone", "nome", "pedido", "etapa"))]);
curl_exec($ch);
```

## 2. Nina → Sistema: resumo da triagem (opcional)

Se você preencher `SISTEMA_WEBHOOK_URL` no `wrangler.toml`, a Nina faz um POST para esse endereço sempre que termina uma triagem. Assim o seu sistema pode criar o orçamento sozinho:

```json
{
  "evento": "triagem_completa",
  "telefone": "558195551234",
  "nome": "Joana",
  "resumo": "Cliente: Joana\nServiço: Fachada ACM\nMedidas: 3x1m\n...",
  "quando": "2026-11-27T15:00:00.000Z"
}
```

O `evento` pode ser `triagem_completa` ou `precisa_atendente`. A chamada leva o cabeçalho `Authorization: Bearer <API_PEDIDOS_TOKEN>`, para o seu sistema conferir que veio da Nina.

## Segurança
- O `API_PEDIDOS_TOKEN` é a senha dessa integração. Gere um valor longo e aleatório, por exemplo com `openssl rand -hex 32`, e cadastre com `npx wrangler secret put API_PEDIDOS_TOKEN`.
- Nunca coloque o token em código que roda no navegador. A chamada sai do **servidor** do seu sistema.
