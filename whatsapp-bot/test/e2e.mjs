// Teste de ponta a ponta: sobe o bot localmente (wrangler dev) com Meta e Claude simulados.
// Uso: npm test
import http from "node:http";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const MOCK = 9911, BOT = 8799, SEGREDO = "segredo-teste";
const chamadasClaude = [], enviados = [];
let respostasClaude = [];

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const mock = http.createServer(async (req, res) => {
  let corpo = "";
  for await (const c of req) corpo += c;
  const json = (o) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url.startsWith("/v1/messages")) {
    chamadasClaude.push(JSON.parse(corpo));
    const d = respostasClaude.shift() ?? { resposta: "Oi! Sou o assistente virtual da NGraph.", situacao: "em_andamento", resumo: "" };
    return json({ id: "msg_x", type: "message", role: "assistant", model: "claude-opus-5-5", stop_reason: "end_turn", stop_sequence: null,
      content: [{ type: "thinking", thinking: "", signature: "sig" }, { type: "text", text: JSON.stringify(d) }],
      usage: { input_tokens: 10, output_tokens: 10 } });
  }
  if (req.url === "/v23.0/PNID/messages") {
    const b = JSON.parse(corpo);
    if (b.type === "text") enviados.push(b);
    return json({ messages: [{ id: "wamid.out" }] });
  }
  if (req.url === "/v23.0/MIDIA1") return json({ url: `http://127.0.0.1:${MOCK}/arquivo`, mime_type: "image/png" });
  if (req.url === "/arquivo") { res.writeHead(200, { "content-type": "image/png" }); return res.end(PNG); }
  res.writeHead(404); res.end();
}).listen(MOCK);

const vars = {
  PHONE_NUMBER_ID: "PNID", GRAPH_BASE: `http://127.0.0.1:${MOCK}`, ANTHROPIC_BASE_URL: `http://127.0.0.1:${MOCK}`,
  ANTHROPIC_API_KEY: "x", WHATSAPP_TOKEN: "x", WHATSAPP_APP_SECRET: SEGREDO, WHATSAPP_VERIFY_TOKEN: "verifica",
  ESPERA_SEGUNDOS: "1", IGNORAR_NUMEROS: "5581000000000",
};
const dev = spawn("npx", ["wrangler", "dev", "--port", String(BOT), "--ip", "127.0.0.1", ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`])],
  { env: { ...process.env, NO_PROXY: "127.0.0.1,localhost", no_proxy: "127.0.0.1,localhost" }, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
dev.stdout.on("data", (d) => (log += d));
dev.stderr.on("data", (d) => (log += d));

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const base = `http://127.0.0.1:${BOT}`;
async function postar(payload, assinatura) {
  const corpo = JSON.stringify(payload);
  const sig = assinatura ?? "sha256=" + crypto.createHmac("sha256", SEGREDO).update(corpo).digest("hex");
  return fetch(`${base}/webhook`, { method: "POST", body: corpo, headers: { "x-hub-signature-256": sig, "content-type": "application/json" } });
}
const msg = (from, id, extra) => ({ entry: [{ changes: [{ field: "messages", value: { contacts: [{ wa_id: from, profile: { name: "Maria" } }], messages: [{ from, id, timestamp: String(Math.floor(Date.now() / 1000)), ...extra }] } }] }] });
const texto = (from, id, body) => msg(from, id, { type: "text", text: { body } });
const eco = (to, body) => ({ entry: [{ changes: [{ field: "smb_message_echoes", value: { message_echoes: [{ from: "PNID", to, id: "e1", timestamp: String(Math.floor(Date.now() / 1000)), type: "text", text: { body } }] } }] }] });

try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(base)).ok) break; } catch {} await espera(1000); }

  // Verificação do webhook
  let r = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=verifica&hub.challenge=123`);
  assert.equal(await r.text(), "123");
  r = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=123`);
  assert.equal(r.status, 403);
  console.log("✔ verificação do webhook");

  // Assinatura falsa é rejeitada
  r = await postar(texto("5581111111111", "m0", "oi"), "sha256=00");
  assert.equal(r.status, 401);
  console.log("✔ assinatura inválida rejeitada");

  // Duas mensagens picadas viram UMA resposta; repetida é ignorada
  await postar(texto("5581111111111", "m1", "Oi, boa tarde"));
  await postar(texto("5581111111111", "m2", "queria uma fachada"));
  await postar(texto("5581111111111", "m2", "queria uma fachada"));
  await espera(3500);
  assert.equal(chamadasClaude.length, 1, "deveria chamar o Claude uma vez");
  const ultimoUser = JSON.stringify(chamadasClaude[0].messages.at(-1));
  assert.ok(ultimoUser.includes("Oi, boa tarde") && ultimoUser.includes("queria uma fachada"));
  assert.ok(ultimoUser.includes("Maria"));
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].to, "5581111111111");
  console.log("✔ junta mensagens picadas, ignora repetidas, responde uma vez");

  // Triagem completa: manda resposta + resumo e o bot fica quieto
  respostasClaude.push({ resposta: "Perfeito, Maria! A equipe vai te mandar o orçamento por aqui.", situacao: "triagem_completa", resumo: "Cliente: Maria\nServiço: fachada ACM" });
  await postar(texto("5581111111111", "m3", "3x1m, sem arte, pra semana que vem"));
  await espera(3000);
  assert.equal(chamadasClaude.length, 2);
  assert.equal(chamadasClaude[1].messages.length, 3, "histórico: user, assistant, user");
  assert.equal(chamadasClaude[1].messages[1].content[0].type, "thinking", "bloco de thinking volta intacto");
  assert.equal(enviados.length, 3);
  assert.ok(enviados[2].text.body.includes("Resumo do pedido") && enviados[2].text.body.includes("fachada ACM"));
  await postar(texto("5581111111111", "m4", "obrigada!"));
  await espera(2500);
  assert.equal(chamadasClaude.length, 2, "bot deve ficar quieto após a triagem");
  console.log("✔ triagem completa: envia resumo na conversa e pausa");

  // Atendente respondeu pelo celular (coexistência): bot fica quieto
  await postar(eco("5581222222222", "Oi, aqui é da equipe"));
  await postar(texto("5581222222222", "n1", "oi"));
  await espera(2500);
  assert.equal(chamadasClaude.length, 2, "bot não deve responder quando a equipe assumiu");
  console.log("✔ pausa quando a equipe responde pelo app");

  // Número ignorado
  await postar(texto("5581000000000", "z1", "oi"));
  await espera(2500);
  assert.equal(chamadasClaude.length, 2);
  console.log("✔ ignora números da lista");

  // Foto chega até o Claude
  await postar(msg("5581333333333", "f1", { type: "image", image: { id: "MIDIA1", mime_type: "image/png", caption: "essa é a fachada" } }));
  await espera(3000);
  assert.equal(chamadasClaude.length, 3);
  const blocos = chamadasClaude[2].messages.at(-1).content;
  assert.ok(blocos.some((b) => b.type === "image" && b.source.media_type === "image/png"));
  assert.ok(chamadasClaude[2].system[0].text.includes("NGraph"));
  console.log("✔ fotos são enviadas ao Claude");

  // Erro no Claude: cliente recebe aviso e equipe assume
  respostasClaude.push({ resposta: "", situacao: "em_andamento", resumo: "" });
  await postar(texto("5581444444444", "g1", "oi"));
  await espera(3000);
  assert.ok(enviados.at(-1).text.body.includes("alguém da nossa equipe"));
  console.log("✔ em caso de falha, avisa o cliente");

  console.log("\nTODOS OS TESTES PASSARAM");
} catch (e) {
  console.error("FALHOU:", e.message, "\n--- log do wrangler ---\n", log.slice(-3000));
  process.exitCode = 1;
} finally {
  dev.kill("SIGTERM");
  mock.close();
  setTimeout(() => process.exit(), 500);
}
