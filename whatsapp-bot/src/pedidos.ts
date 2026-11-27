// Etapas do pedido e a mensagem (template) que o cliente recebe em cada uma.
// Os textos abaixo precisam ser cadastrados e aprovados como templates na Meta (categoria "Utilidade").
// Veja TEMPLATES.md. Se mudar um texto lá, não precisa mudar nada aqui; se mudar o NOME, mude aqui.

export const ETAPAS = {
  aprovado: { rotulo: "Aprovado", template: "ngraph_pedido_aprovado" },
  em_producao: { rotulo: "Em produção", template: "ngraph_pedido_em_producao" },
  pronto: { rotulo: "Pronto", template: "ngraph_pedido_pronto" },
  instalacao_agendada: { rotulo: "Instalação agendada", template: "ngraph_instalacao_agendada" },
  entregue: { rotulo: "Entregue", template: "ngraph_pedido_entregue" },
} as const;

export type Etapa = keyof typeof ETAPAS;

/** O que o seu sistema manda para a Nina quando um pedido muda de etapa. */
export interface AtualizacaoPedido {
  telefone: string; // com DDD; com ou sem 55
  nome: string; // nome do cliente (aparece na mensagem)
  pedido: string; // número/código do pedido
  etapa: Etapa;
  descricao?: string; // ex: "Fachada ACM 3x1m" — ajuda a Nina a responder perguntas
  data_instalacao?: string; // obrigatório na etapa instalacao_agendada. ex: "05/12 às 9h"
}

export interface PedidoSalvo {
  pedido: string;
  etapa: Etapa;
  descricao?: string;
  data_instalacao?: string;
  atualizado: number;
}

export function validarAtualizacao(x: any): { ok: true; dados: AtualizacaoPedido } | { ok: false; erro: string } {
  if (!x || typeof x !== "object") return { ok: false, erro: "corpo JSON ausente" };
  for (const campo of ["telefone", "nome", "pedido", "etapa"]) {
    if (typeof x[campo] !== "string" || !x[campo].trim()) return { ok: false, erro: `campo "${campo}" obrigatório` };
  }
  if (!(x.etapa in ETAPAS)) return { ok: false, erro: `etapa inválida; use: ${Object.keys(ETAPAS).join(", ")}` };
  if (x.etapa === "instalacao_agendada" && !x.data_instalacao?.trim()) return { ok: false, erro: 'etapa instalacao_agendada exige "data_instalacao"' };
  const tel = String(x.telefone).replace(/\D/g, "");
  if (tel.length < 10 || tel.length > 13) return { ok: false, erro: "telefone inválido" };
  return { ok: true, dados: x as AtualizacaoPedido };
}

/** Parâmetros {{1}}, {{2}}, {{3}} de cada template. */
export function parametrosTemplate(d: AtualizacaoPedido): string[] {
  const primeiroNome = d.nome.trim().split(/\s+/)[0];
  const base = [primeiroNome, d.pedido];
  return d.etapa === "instalacao_agendada" ? [...base, d.data_instalacao!.trim()] : base;
}
