# Mensagens de aviso de pedido (templates)

Para avisar o cliente **por iniciativa da NGraph** (sem ele ter mandado mensagem antes), o WhatsApp exige
mensagens-modelo **aprovadas pela Meta**. Cadastre as 5 abaixo no painel do provedor (ou no Gerenciador do
WhatsApp da Meta → Modelos de mensagem):

- **Categoria:** Utilidade (Utility). Não coloque promoção no texto, senão a Meta reclassifica como Marketing, que é mais cara.
- **Idioma:** Português (BR), `pt_BR`
- **O nome tem que ser exatamente este** (está no código, em `src/pedidos.ts`)
- `{{1}}` = primeiro nome do cliente, `{{2}}` = número do pedido, `{{3}}` = data da instalação

| Nome do template | Texto sugerido (pode ajustar) |
|---|---|
| `ngraph_pedido_aprovado` | Olá, {{1}}! Seu pedido nº {{2}} foi aprovado e já entrou na nossa fila. Vamos te avisando por aqui a cada etapa. NGraph Comunicação Visual |
| `ngraph_pedido_em_producao` | Olá, {{1}}! Seu pedido nº {{2}} está em produção. Assim que ficar pronto, te avisamos por aqui. NGraph Comunicação Visual |
| `ngraph_pedido_pronto` | Olá, {{1}}! Seu pedido nº {{2}} está pronto. Em breve combinamos a retirada ou a instalação. NGraph Comunicação Visual |
| `ngraph_instalacao_agendada` | Olá, {{1}}! A instalação do seu pedido nº {{2}} está agendada para {{3}}. Qualquer imprevisto, é só responder esta mensagem. NGraph Comunicação Visual |
| `ngraph_pedido_entregue` | Olá, {{1}}! Seu pedido nº {{2}} foi entregue. Obrigado pela confiança! Se precisar de algo, é só chamar por aqui. NGraph Comunicação Visual |

No cadastro, a Meta pede um exemplo para cada variável, como "Maria", "1234" e "05/12 às 9h". A aprovação costuma levar de minutos a algumas horas.

**Custo:** cada aviso é cobrado pela Meta na tarifa "Utilidade" do Brasil, que fica em centavos. Confirme o valor atual com o provedor.
