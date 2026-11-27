// Caixa de entrada de triagens: o sistema da gráfica busca aqui as triagens que a Nina concluiu.
import { DurableObject } from "cloudflare:workers";
import type { Env } from "./index";

export interface Triagem {
  id: string;
  telefone: string;
  nome: string;
  situacao: "triagem_completa" | "precisa_atendente";
  resumo: string;
  conversa: string; // transcrição em texto, para o "Assistente de pedidos" analisar
  criado: string; // ISO
  importada: boolean;
}

const LIMITE = 300;

export class Caixa extends DurableObject<Env> {
  private async lista(): Promise<Triagem[]> {
    return (await this.ctx.storage.get<Triagem[]>("triagens")) ?? [];
  }

  async adicionar(t: Omit<Triagem, "id" | "criado" | "importada">): Promise<Triagem> {
    const nova: Triagem = { ...t, id: crypto.randomUUID(), criado: new Date().toISOString(), importada: false };
    const todas = [...(await this.lista()), nova];
    // Mantém as mais recentes; nunca descarta uma pendente se der para descartar uma já importada
    while (todas.length > LIMITE) {
      const i = todas.findIndex((x) => x.importada);
      todas.splice(i >= 0 ? i : 0, 1);
    }
    await this.ctx.storage.put("triagens", todas);
    return nova;
  }

  async listar(somentePendentes: boolean): Promise<Triagem[]> {
    const todas = await this.lista();
    return (somentePendentes ? todas.filter((t) => !t.importada) : todas).slice().reverse();
  }

  async marcarImportada(id: string): Promise<boolean> {
    const todas = await this.lista();
    const t = todas.find((x) => x.id === id);
    if (!t) return false;
    t.importada = true;
    await this.ctx.storage.put("triagens", todas);
    return true;
  }
}
