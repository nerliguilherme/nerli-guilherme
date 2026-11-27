// Uma "Conversa" por cliente: guarda o histórico e decide quando o bot fala ou fica quieto.
import { DurableObject } from "cloudflare:workers";
import type Anthropic from "@anthropic-ai/sdk";
import { pensar, type Historico } from "./claude";
import { baixarImagem, enviarTemplate, enviarTexto, marcarLidaDigitando, type Evento } from "./whatsapp";
import { ETAPAS, parametrosTemplate, type AtualizacaoPedido, type PedidoSalvo } from "./pedidos";
import type { Env } from "./index";

type Pendente = Extract<Evento, { tipo: "mensagem_cliente" }>;
interface Linha {
  quem: "cliente" | "assistente" | "equipe";
  texto: string;
  t: number;
}

const HORA = 3_600_000;
const MAX_IMAGENS_POR_CONVERSA = 4;
const MAX_TURNOS = 80;
const MSG_ERRO = "Recebemos sua mensagem! Em instantes alguém da nossa equipe vai te responder. 🙂";

export function dataHoraRecife(ms: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Recife",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export class Conversa extends DurableObject<Env> {
  private num(nome: keyof Env, padrao: number): number {
    const v = Number(this.env[nome]);
    return Number.isFinite(v) && v >= 0 ? v : padrao;
  }

  private async get<T>(chave: string, padrao: T): Promise<T> {
    return ((await this.ctx.storage.get<T>(chave)) ?? padrao) as T;
  }

  private async anotar(linha: Linha) {
    const t = await this.get<Linha[]>("transcricao", []);
    t.push({ ...linha, texto: linha.texto.slice(0, 1000) });
    await this.ctx.storage.put("transcricao", t.slice(-40));
  }

  /** Chamado pelo webhook para cada evento deste contato. */
  async receber(ev: Evento): Promise<void> {
    const agora = Date.now();

    if (ev.tipo === "mensagem_atendente") {
      // Alguém da equipe respondeu pelo celular: o bot sai de cena por um tempo
      await this.ctx.storage.put("pausadoAte", agora + this.num("PAUSA_HORAS_ATENDENTE", 12) * HORA);
      await this.ctx.storage.put("pendentes", []);
      await this.ctx.storage.put("encerrada", true);
      await this.ctx.storage.deleteAlarm();
      if (ev.texto) await this.anotar({ quem: "equipe", texto: ev.texto, t: ev.timestamp });
      return;
    }

    // A Meta às vezes reenvia o mesmo webhook: ignora repetidos
    const vistos = await this.get<string[]>("vistos", []);
    if (vistos.includes(ev.id)) return;
    await this.ctx.storage.put("vistos", [...vistos, ev.id].slice(-100));
    if (ev.nome) await this.ctx.storage.put("nome", ev.nome);
    await this.ctx.storage.put("waId", ev.waId);

    const pausadoAte = await this.get<number>("pausadoAte", 0);
    if (pausadoAte > agora) {
      await this.anotar({ quem: "cliente", texto: ev.texto ?? ev.descricaoMidia ?? "[mídia]", t: ev.timestamp });
      return; // equipe está cuidando
    }

    const pendentes = await this.get<Pendente[]>("pendentes", []);
    pendentes.push(ev);
    await this.ctx.storage.put("pendentes", pendentes);
    // Espera o cliente terminar de digitar (mensagens picadas) antes de responder
    await this.ctx.storage.setAlarm(agora + this.num("ESPERA_SEGUNDOS", 8) * 1000);
  }

  async alarm(): Promise<void> {
    const pendentes = await this.get<Pendente[]>("pendentes", []);
    if (!pendentes.length) return;
    await this.ctx.storage.put("pendentes", []);
    const agora = Date.now();
    if ((await this.get<number>("pausadoAte", 0)) > agora) return;

    const contato = pendentes[pendentes.length - 1].waId;
    await marcarLidaDigitando(this.env, pendentes[pendentes.length - 1].id);

    // Nova conversa? (primeira vez, muito tempo parado, ou a anterior foi encerrada)
    let historico = await this.get<Historico>("historico", []);
    const ultima = await this.get<number>("ultimaAtividade", 0);
    const encerrada = await this.get<boolean>("encerrada", false);
    const transcricao = await this.get<Linha[]>("transcricao", []);
    let contexto = "";
    if (!historico.length || encerrada || agora - ultima > this.num("NOVA_CONVERSA_HORAS", 24) * HORA || historico.length > MAX_TURNOS) {
      historico = [];
      await this.ctx.storage.put("imagens", 0);
      await this.ctx.storage.put("encerrada", false);
      if (transcricao.length) {
        contexto =
          "[Contexto: este contato já conversou com a NGraph antes. Últimas mensagens:\n" +
          transcricao
            .slice(-15)
            .map((l) => `${dataHoraRecife(l.t)} ${l.quem}: ${l.texto}`)
            .join("\n") +
          "\nNão é a primeira mensagem dele; cumprimente sem se reapresentar longamente.]";
      }
    }

    // Monta a mensagem do cliente (texto + fotos)
    const nome = await this.get<string>("nome", "");
    const blocos: Anthropic.Beta.BetaContentBlockParam[] = [];
    let cabecalho = `[${dataHoraRecife(agora)}${nome ? ` | nome no WhatsApp: ${nome}` : ""}]`;
    if (contexto) cabecalho += "\n" + contexto;
    const pedidos = await this.get<PedidoSalvo[]>("pedidos", []);
    if (pedidos.length) {
      cabecalho +=
        "\n[Pedidos deste cliente no sistema da NGraph:\n" +
        pedidos
          .map(
            (p) =>
              `- Pedido ${p.pedido}${p.descricao ? ` (${p.descricao})` : ""}: ${ETAPAS[p.etapa].rotulo}` +
              `${p.data_instalacao && p.etapa === "instalacao_agendada" ? `, instalação ${p.data_instalacao}` : ""}` +
              ` — atualizado em ${dataHoraRecife(p.atualizado)}`,
          )
          .join("\n") +
        "]";
    }
    blocos.push({ type: "text", text: cabecalho });
    let imagens = await this.get<number>("imagens", 0);
    for (const p of pendentes) {
      if (p.descricaoMidia) blocos.push({ type: "text", text: p.descricaoMidia });
      if (p.imagemId) {
        const img = imagens < MAX_IMAGENS_POR_CONVERSA ? await baixarImagem(this.env, p.imagemId).catch(() => null) : null;
        if (img && /^image\/(jpeg|png|gif|webp)$/.test(img.mime)) {
          imagens++;
          blocos.push({ type: "image", source: { type: "base64", media_type: img.mime as any, data: img.base64 } });
        } else {
          blocos.push({ type: "text", text: "[o cliente enviou uma foto que não foi possível abrir]" });
        }
      }
      if (p.texto) blocos.push({ type: "text", text: p.texto });
      await this.anotar({ quem: "cliente", texto: p.texto ?? p.descricaoMidia ?? "[foto]", t: p.timestamp });
    }
    await this.ctx.storage.put("imagens", imagens);

    const novoHistorico: Historico = [...historico, { role: "user", content: blocos }];

    try {
      const { decisao, conteudo } = await pensar(this.env, novoHistorico);
      await enviarTexto(this.env, contato, decisao.resposta);
      await this.anotar({ quem: "assistente", texto: decisao.resposta, t: Date.now() });
      // A resposta do Claude volta intacta para o histórico
      novoHistorico.push({ role: "assistant", content: conteudo as unknown as Anthropic.Beta.BetaContentBlockParam[] });
      await this.ctx.storage.put("historico", novoHistorico);
      await this.ctx.storage.put("ultimaAtividade", Date.now());

      if (decisao.situacao !== "em_andamento") {
        const titulo = decisao.situacao === "triagem_completa" ? "📋 *Resumo do pedido*" : "🙋 *Atendimento humano solicitado*";
        if (decisao.resumo?.trim()) {
          await enviarTexto(this.env, contato, `${titulo}\n\n${decisao.resumo.trim()}`);
          this.ctx.waitUntil(this.avisarSistema(decisao.situacao, decisao.resumo.trim(), contato));
        }
        await this.ctx.storage.put("pausadoAte", Date.now() + this.num("PAUSA_HORAS_TRIAGEM", 48) * HORA);
        await this.ctx.storage.put("encerrada", true);
      }
    } catch (erro) {
      console.error(`Falha ao responder ${contato}:`, erro);
      // Não deixa o cliente sem resposta: avisa e passa para a equipe
      await enviarTexto(this.env, contato, MSG_ERRO).catch((e) => console.error("Falha também no aviso:", e));
      await this.ctx.storage.put("pausadoAte", Date.now() + this.num("PAUSA_HORAS_ATENDENTE", 12) * HORA);
      await this.ctx.storage.put("encerrada", true);
    }
  }

  /** Opcional: manda o resumo da triagem para o sistema da gráfica (SISTEMA_WEBHOOK_URL). */
  private async avisarSistema(situacao: string, resumo: string, telefone: string) {
    if (!this.env.SISTEMA_WEBHOOK_URL) return;
    try {
      const r = await fetch(this.env.SISTEMA_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.env.API_PEDIDOS_TOKEN}` },
        body: JSON.stringify({ evento: situacao, telefone, nome: await this.get("nome", ""), resumo, quando: new Date().toISOString() }),
      });
      if (!r.ok) console.error("Sistema da gráfica recusou o resumo:", r.status, await r.text());
    } catch (e) {
      console.error("Falha ao avisar o sistema da gráfica:", e);
    }
  }

  /** Chamado quando o sistema da gráfica muda a etapa de um pedido: avisa o cliente. */
  async atualizarPedido(d: AtualizacaoPedido, para: string): Promise<{ enviado: boolean; repetido?: boolean }> {
    const pedidos = await this.get<PedidoSalvo[]>("pedidos", []);
    const atual = pedidos.find((p) => p.pedido === d.pedido);
    // Não manda o mesmo aviso duas vezes (ex: o sistema salvou o pedido de novo)
    if (atual && atual.etapa === d.etapa && (atual.data_instalacao ?? "") === (d.data_instalacao ?? "")) return { enviado: false, repetido: true };

    // Usa o número exatamente como o WhatsApp conhece, se esse cliente já falou com a gente
    const destino = (await this.get<string>("waId", "")) || para;
    await enviarTemplate(this.env, destino, ETAPAS[d.etapa].template, parametrosTemplate(d));

    const salvo: PedidoSalvo = { pedido: d.pedido, etapa: d.etapa, descricao: d.descricao ?? atual?.descricao, data_instalacao: d.data_instalacao, atualizado: Date.now() };
    const restantes = pedidos.filter((p) => p.pedido !== d.pedido && p.etapa !== "entregue");
    // Pedidos entregues ficam guardados só até o próximo aviso, para a Nina ainda saber responder
    await this.ctx.storage.put("pedidos", [...restantes, salvo].slice(-10));
    if (!(await this.get<string>("nome", ""))) await this.ctx.storage.put("nome", d.nome);
    await this.anotar({ quem: "equipe", texto: `[aviso automático] Pedido ${d.pedido}: ${ETAPAS[d.etapa].rotulo}`, t: Date.now() });
    // Se o cliente responder ao aviso, começa uma conversa nova já com esse contexto
    await this.ctx.storage.put("encerrada", true);
    return { enviado: true };
  }
}
