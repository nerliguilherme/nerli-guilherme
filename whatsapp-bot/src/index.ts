// Porta de entrada: recebe os webhooks do WhatsApp e entrega cada mensagem à conversa do cliente.
import { assinaturaValida, extrairEventos, normalizarNumero } from "./whatsapp";
import { validarAtualizacao } from "./pedidos";
export { Conversa } from "./conversa";
export { Caixa } from "./caixa";

export interface Env {
  CONVERSA: DurableObjectNamespace<import("./conversa").Conversa>;
  CAIXA: DurableObjectNamespace<import("./caixa").Caixa>;
  ANTHROPIC_API_KEY: string;
  WHATSAPP_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
  WHATSAPP_VERIFY_TOKEN: string;
  PHONE_NUMBER_ID: string;
  GRAPH_VERSION: string;
  MODEL: string;
  ESPERA_SEGUNDOS: string;
  PAUSA_HORAS_ATENDENTE: string;
  PAUSA_HORAS_TRIAGEM: string;
  NOVA_CONVERSA_HORAS: string;
  IGNORAR_NUMEROS: string;
  GRAPH_BASE?: string;
  API_PEDIDOS_TOKEN: string;
  SISTEMA_WEBHOOK_URL?: string;
  ANTHROPIC_BASE_URL?: string;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    // 1) Verificação do webhook (feita uma vez pela Meta ao configurar)
    if (req.method === "GET" && url.pathname === "/webhook") {
      const ok =
        url.searchParams.get("hub.mode") === "subscribe" &&
        !!env.WHATSAPP_VERIFY_TOKEN &&
        url.searchParams.get("hub.verify_token") === env.WHATSAPP_VERIFY_TOKEN;
      return ok ? new Response(url.searchParams.get("hub.challenge") ?? "") : new Response("Proibido", { status: 403 });
    }

    // 2) Mensagens chegando
    if (req.method === "POST" && url.pathname === "/webhook") {
      const corpo = await req.text();
      if (!(await assinaturaValida(corpo, req.headers.get("x-hub-signature-256"), env.WHATSAPP_APP_SECRET))) {
        return new Response("Assinatura inválida", { status: 401 });
      }
      let payload: unknown;
      try {
        payload = JSON.parse(corpo);
      } catch {
        return new Response("JSON inválido", { status: 400 });
      }
      const ignorar = new Set(env.IGNORAR_NUMEROS.split(",").map((n) => n.replace(/\D/g, "")).filter(Boolean));
      const eventos = extrairEventos(payload).filter((e) => !ignorar.has(e.contato));
      // Responde 200 na hora (a Meta exige) e processa em seguida
      ctx.waitUntil(
        Promise.all(
          eventos.map((e) =>
            env.CONVERSA.get(env.CONVERSA.idFromName(e.contato))
              .receber(e)
              .catch((err) => console.error("Erro ao registrar evento", err)),
          ),
        ),
      );
      return new Response("ok");
    }

    // Rotas /api/* exigem o token da integração
    if (url.pathname.startsWith("/api/")) {
      const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
      if (!env.API_PEDIDOS_TOKEN || !(await iguais(token, env.API_PEDIDOS_TOKEN))) return json({ ok: false, erro: "token inválido" }, 401);
    }

    // 4) O sistema busca as triagens concluídas pela Nina
    if (req.method === "GET" && url.pathname === "/api/triagens") {
      const pendentes = url.searchParams.get("todas") !== "1";
      return json({ ok: true, triagens: await caixa(env).listar(pendentes) });
    }
    const marcar = url.pathname.match(/^\/api\/triagens\/([\w-]+)\/importada$/);
    if (req.method === "POST" && marcar) {
      const ok = await caixa(env).marcarImportada(marcar[1]);
      return json({ ok }, ok ? 200 : 404);
    }

    // 3) O sistema da gráfica avisa que um pedido mudou de etapa
    if (req.method === "POST" && url.pathname === "/api/pedido") {
      const v = validarAtualizacao(await req.json().catch(() => null));
      if (!v.ok) return json({ ok: false, erro: v.erro }, 400);
      const numero = normalizarNumero(v.dados.telefone);
      const digitos = v.dados.telefone.replace(/\D/g, "");
      const destino = digitos.length <= 11 ? "55" + digitos : digitos;
      try {
        const r = await env.CONVERSA.get(env.CONVERSA.idFromName(numero)).atualizarPedido(v.dados, destino);
        return json({ ok: true, ...r });
      } catch (e) {
        console.error("Falha ao avisar cliente do pedido", e);
        return json({ ok: false, erro: String(e instanceof Error ? e.message : e) }, 502);
      }
    }

    if (url.pathname === "/") return new Response("Assistente NGraph no ar ✅");
    return new Response("Não encontrado", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });
}

/** Compara segredos sem vazar tempo de comparação. */
async function iguais(a: string, b: string) {
  const h = async (x: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  return x.every((v, i) => v === y[i]);
}

const caixa = (env: Env) => env.CAIXA.get(env.CAIXA.idFromName("caixa"));
