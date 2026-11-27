// Tudo que fala com a API oficial do WhatsApp (Meta Cloud API).

export interface WaEnv {
  WHATSAPP_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
  PHONE_NUMBER_ID: string;
  GRAPH_VERSION: string;
  GRAPH_BASE?: string; // só para testes
}

/** Evento já simplificado que o resto do sistema entende. */
export type Evento =
  | {
      tipo: "mensagem_cliente";
      contato: string; // wa_id do cliente, ex: 5581999999999
      nome?: string;
      id: string;
      timestamp: number; // ms
      texto?: string;
      imagemId?: string; // media id, para baixar
      imagemMime?: string;
      descricaoMidia?: string; // ex: "[cliente enviou um áudio]"
    }
  | {
      // Mensagem enviada pelo celular (app WhatsApp Business) — só existe no modo coexistência
      tipo: "mensagem_atendente";
      contato: string;
      timestamp: number;
      texto?: string;
    };

/** Confere a assinatura X-Hub-Signature-256 que a Meta manda em todo webhook. */
export async function assinaturaValida(corpo: string, cabecalho: string | null, segredo: string): Promise<boolean> {
  if (!cabecalho?.startsWith("sha256=")) return false;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(corpo)));
  const esperado = [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
  const recebido = cabecalho.slice(7).toLowerCase();
  if (recebido.length !== esperado.length) return false;
  let diff = 0;
  for (let i = 0; i < esperado.length; i++) diff |= esperado.charCodeAt(i) ^ recebido.charCodeAt(i);
  return diff === 0;
}

const DESCRICAO_TIPO: Record<string, string> = {
  audio: "[o cliente enviou um áudio — você não consegue ouvir]",
  video: "[o cliente enviou um vídeo — você não consegue assistir]",
  sticker: "[o cliente enviou uma figurinha]",
  location: "[o cliente enviou uma localização]",
  contacts: "[o cliente enviou um contato]",
};

/** Converte o JSON do webhook da Meta numa lista de eventos simples. */
export function extrairEventos(payload: any): Evento[] {
  const eventos: Evento[] = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const v = change?.value ?? {};
      if (change?.field === "messages") {
        const nomes = new Map<string, string>();
        for (const c of v.contacts ?? []) if (c?.wa_id) nomes.set(c.wa_id, c?.profile?.name);
        for (const m of v.messages ?? []) {
          if (!m?.from || !m?.id) continue;
          const ev: Evento & { tipo: "mensagem_cliente" } = {
            tipo: "mensagem_cliente",
            contato: m.from,
            nome: nomes.get(m.from),
            id: m.id,
            timestamp: Number(m.timestamp) * 1000 || Date.now(),
          };
          switch (m.type) {
            case "text":
              ev.texto = m.text?.body;
              break;
            case "image":
              ev.imagemId = m.image?.id;
              ev.imagemMime = m.image?.mime_type;
              ev.texto = m.image?.caption;
              break;
            case "document":
              ev.descricaoMidia = `[o cliente enviou o arquivo "${m.document?.filename ?? "sem nome"}"]`;
              ev.texto = m.document?.caption;
              break;
            case "button":
              ev.texto = m.button?.text;
              break;
            case "interactive":
              ev.texto = m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title;
              break;
            case "location":
              ev.descricaoMidia = `[o cliente enviou uma localização: ${[m.location?.name, m.location?.address].filter(Boolean).join(" - ") || `${m.location?.latitude},${m.location?.longitude}`}]`;
              break;
            default:
              ev.descricaoMidia = DESCRICAO_TIPO[m.type] ?? `[o cliente enviou uma mensagem do tipo ${m.type}]`;
          }
          eventos.push(ev);
        }
      } else if (change?.field === "smb_message_echoes") {
        // Coexistência: cópia do que o atendente mandou pelo app do celular
        for (const m of v.message_echoes ?? []) {
          if (!m?.to) continue;
          eventos.push({
            tipo: "mensagem_atendente",
            contato: m.to,
            timestamp: Number(m.timestamp) * 1000 || Date.now(),
            texto: m.text?.body,
          });
        }
      }
    }
  }
  return eventos;
}

function graph(env: WaEnv, caminho: string) {
  return `${env.GRAPH_BASE || "https://graph.facebook.com"}/${env.GRAPH_VERSION}/${caminho}`;
}

async function postMensagem(env: WaEnv, corpo: object): Promise<Response> {
  return fetch(graph(env, `${env.PHONE_NUMBER_ID}/messages`), {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...corpo }),
  });
}

export async function enviarTexto(env: WaEnv, para: string, texto: string): Promise<void> {
  // Limite do WhatsApp: 4096 caracteres por mensagem
  for (let i = 0; i < texto.length; i += 4000) {
    const r = await postMensagem(env, { to: para, type: "text", text: { body: texto.slice(i, i + 4000), preview_url: false } });
    if (!r.ok) throw new Error(`WhatsApp recusou o envio (${r.status}): ${await r.text()}`);
  }
}

/** Marca como lida e mostra "digitando..." (se a Meta recusar, não é grave). */
export async function marcarLidaDigitando(env: WaEnv, mensagemId: string): Promise<void> {
  try {
    await postMensagem(env, { status: "read", message_id: mensagemId, typing_indicator: { type: "text" } });
  } catch {
    /* ignora */
  }
}

/** Baixa uma imagem recebida e devolve em base64 (para o Claude ver). */
export async function baixarImagem(env: WaEnv, mediaId: string): Promise<{ base64: string; mime: string } | null> {
  const auth = { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` };
  const meta = await fetch(graph(env, mediaId), { headers: auth });
  if (!meta.ok) return null;
  const info: any = await meta.json();
  const arq = await fetch(info.url, { headers: auth });
  if (!arq.ok) return null;
  const bytes = new Uint8Array(await arq.arrayBuffer());
  if (bytes.length > 4_500_000) return null; // grande demais
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { base64: btoa(bin), mime: info.mime_type ?? "image/jpeg" };
}
