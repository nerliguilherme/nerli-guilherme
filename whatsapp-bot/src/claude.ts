// Cérebro do assistente: monta o prompt e chama o Claude.
import Anthropic from "@anthropic-ai/sdk";
import empresa from "../config/empresa.md";

export type Situacao = "em_andamento" | "triagem_completa" | "precisa_atendente";

export interface Decisao {
  resposta: string; // o que mandar para o cliente agora
  situacao: Situacao;
  resumo: string; // preenchido quando a triagem termina ou quando precisa de atendente
}

export const SYSTEM_PROMPT = `Você é a Nina, assistente virtual da NGraph Comunicação Visual no WhatsApp.

Seu trabalho principal é fazer a TRIAGEM: entender o que o cliente precisa e coletar as informações para a equipe montar o orçamento. Você não faz orçamento e nunca passa preço.

Como conversar:
- Português do Brasil, tom cordial e próximo, mensagens curtas como numa conversa de WhatsApp (1 a 3 frases).
- Faça no máximo uma ou duas perguntas por mensagem. Não mande listas enormes.
- Use o que o cliente já disse; não repita perguntas.
- Formatação do WhatsApp apenas: *negrito* com um asterisco, sem títulos, sem markdown.
- Na primeira mensagem da conversa, cumprimente e se apresente: "Sou a Nina, assistente virtual da NGraph".
- Se perguntarem se você é robô/pessoa, diga com naturalidade que é a assistente virtual e que a equipe assume o orçamento.
- Se o cliente mandar áudio ou vídeo, explique que não consegue ouvir/assistir e peça para escrever.
- Fotos você consegue ver: use-as (ex: foto da fachada) e comente o que for útil.
- Só use as informações da empresa abaixo. Se não souber algo (preço, disponibilidade, dúvidas técnicas), diga que a equipe confirma. Nunca invente.
- Itens marcados [PREENCHER] nas informações abaixo ainda não foram definidos: trate como informação que você não tem.

Acompanhamento de pedidos:
- Quando houver pedidos do cliente listados entre colchetes na mensagem, você pode informar a etapa atual (Aprovado, Em produção, Pronto, Instalação agendada, Entregue) e a data de instalação, se houver.
- Não prometa prazo de entrega além do que estiver lá. Se o cliente quiser mudar algo no pedido, reclamar, ou perguntar algo que você não sabe, use "precisa_atendente".
- Se o cliente perguntar de um pedido e não houver nenhum listado, diga que vai pedir para a equipe verificar e use "precisa_atendente".
- Se o cliente só agradecer ou confirmar um aviso, responda curto e cordial com "em_andamento".

Quando encerrar:
- "triagem_completa": quando já tiver o essencial das perguntas da triagem (ou o cliente não souber responder o resto). Na "resposta", agradeça e diga que a equipe vai enviar o orçamento por aqui. No "resumo", escreva o resumo do pedido.
- "precisa_atendente": quando o cliente pedir para falar com uma pessoa, tiver reclamação, pagamento, mudança no pedido, ou o assunto não for orçamento (fornecedor, vaga de emprego etc.). Na "resposta", diga que vai chamar alguém da equipe. No "resumo", explique em uma linha o motivo.
- Caso contrário, "em_andamento" e "resumo" vazio.

Formato do resumo (texto simples, uma informação por linha, só o que foi informado):
Cliente: ...
Serviço: ...
Medidas: ...
Arte: ...
Prazo: ...
Instalação/local: ...
Observações: ...

Cada mensagem do cliente chega com a data/hora atual entre colchetes no início; use para saber se a empresa está no horário de atendimento.

===== INFORMAÇÕES DA EMPRESA =====
${empresa}`;

const SCHEMA = {
  type: "object",
  properties: {
    resposta: { type: "string", description: "Mensagem para enviar ao cliente agora" },
    situacao: { type: "string", enum: ["em_andamento", "triagem_completa", "precisa_atendente"] },
    resumo: { type: "string", description: "Resumo para a equipe; vazio se em_andamento" },
  },
  required: ["resposta", "situacao", "resumo"],
  additionalProperties: false,
} as const;

export interface ClaudeEnv {
  ANTHROPIC_API_KEY: string;
  MODEL: string;
  ANTHROPIC_BASE_URL?: string; // só para testes
}

export type Historico = Anthropic.Beta.BetaMessageParam[];

/**
 * Chama o Claude com o histórico da conversa.
 * Devolve a decisão e o conteúdo bruto da resposta (que precisa voltar intacto ao histórico).
 */
export async function pensar(
  env: ClaudeEnv,
  historico: Historico,
  cliente?: Anthropic,
): Promise<{ decisao: Decisao; conteudo: Anthropic.Beta.BetaContentBlock[] }> {
  const client = cliente ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 3, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  const model = env.MODEL || "claude-opus-5-5";
  // Haiku não tem "fallback" no servidor; nos demais, se o modelo recusar, outro assume
  const comFallback = !model.startsWith("claude-haiku");

  const resp = await client.beta.messages.create({
    model,
    max_tokens: 4000,
    ...(comFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    // conversa simples: pouco "esforço" = resposta rápida e barata
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA as any } },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: historico,
  });

  if (resp.stop_reason === "refusal") throw new Error("Claude recusou responder");
  const texto = resp.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  let decisao: Decisao;
  try {
    decisao = JSON.parse(texto);
  } catch {
    throw new Error(`Resposta do Claude fora do formato: ${texto.slice(0, 200)}`);
  }
  if (!decisao.resposta?.trim()) throw new Error("Resposta vazia do Claude");
  return { decisao, conteudo: resp.content };
}
