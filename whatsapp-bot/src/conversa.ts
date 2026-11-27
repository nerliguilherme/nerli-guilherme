// Uma "Conversa" por cliente: guarda o histórico e decide quando o bot fala ou fica quieto.
import { DurableObject } from "cloudflare:workers";
import type Anthropic from "@anthropic-ai/sdk";
import { pensar, type Historico } from "./claude";
import { baixarImagem, enviarTexto, marcarLidaDigitando, type Evento } from "./whatsapp";
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

    const contato = pendentes[0].contato;
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
        if (decisao.resumo?.trim()) await enviarTexto(this.env, contato, `${titulo}\n\n${decisao.resumo.trim()}`);
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
}
