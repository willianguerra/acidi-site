// Mensagens dos formulários públicos: o site grava sem login; só o admin lê.
import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import type { Db } from '../db/index.ts';
import { contatos } from '../db/schema.ts';
import { pode, type Usuario } from './permissoes.ts';
import { ok, falha, type Resultado } from './resultado.ts';

export type LinhaContato = typeof contatos.$inferSelect;
export type Formulario = LinhaContato['formulario'];

// Campos aceitos de cada formulário, na ordem em que aparecem, com o rótulo mostrado no admin e no e-mail.
export const FORMULARIOS: Record<Formulario, { titulo: string; nome: string; email: string; campos: Record<string, string> }> = {
  contato: { titulo: 'Contato', nome: 'ct-nome', email: 'ct-email', campos: { 'ct-nome': 'Nome', 'ct-email': 'E-mail', 'ct-tel': 'Telefone', 'ct-assunto': 'Assunto', 'ct-msg': 'Mensagem' } },
  'associe-se': { titulo: 'Associe-se', nome: 'as-nome', email: 'as-email', campos: { 'as-nome': 'Nome', 'as-empresa': 'Empresa', 'as-email': 'E-mail', 'as-tel': 'Telefone ou WhatsApp', 'as-setor': 'Setor da empresa', 'as-int': 'Interesses', 'as-msg': 'Mensagem' } },
  auditorio: { titulo: 'Auditório e salas', nome: 'aud-nome', email: 'aud-email', campos: { 'aud-nome': 'Nome', 'aud-empresa': 'Empresa', 'aud-email': 'E-mail', 'aud-tel': 'Telefone', 'aud-espaco': 'Espaço', 'aud-associado': 'Empresa associada?', 'aud-data': 'Data desejada', 'aud-pessoas': 'Número estimado de pessoas', 'aud-msg': 'Detalhes do evento' } },
};

const MAX = 5000;
const idValido = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

// Validação de entrada pública: o navegador já valida, aqui só o mínimo para não gravar lixo.
export function lerFormulario(f: FormData): Resultado<Omit<LinhaContato, 'id' | 'lida' | 'criadaEm'>> {
  const formulario = String(f.get('formulario') ?? '') as Formulario;
  const def = FORMULARIOS[formulario];
  if (!def) return falha('invalida');
  const valor = (n: string) => f.getAll(n).map(v => String(v).trim()).filter(Boolean).join(', ').slice(0, MAX);
  const nome = valor(def.nome), email = valor(def.email);
  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return falha('invalida');
  const campos = Object.entries(def.campos).map(([n, rotulo]) => ({ rotulo, valor: valor(n) })).filter(c => c.valor);
  return ok({ formulario, nome, email, campos });
}

export async function registrarContato(db: Db, f: FormData): Promise<Resultado<LinhaContato>> {
  const r = lerFormulario(f);
  if (!r.ok) return r;
  const c = { ...r.valor, id: randomUUID(), lida: false, criadaEm: new Date() };
  await db.insert(contatos).values(c);
  return ok(c);
}

export async function listarContatos(db: Db, u: Usuario): Promise<Resultado<LinhaContato[]>> {
  if (!pode(u, 'contatos.ver')) return falha('sem-permissao');
  return ok(await db.select().from(contatos).orderBy(desc(contatos.criadaEm)));
}

// Abrir a mensagem já a marca como lida.
export async function abrirContato(db: Db, u: Usuario, id: string): Promise<Resultado<LinhaContato>> {
  if (!pode(u, 'contatos.ver')) return falha('sem-permissao');
  if (!idValido(id)) return falha('nao-encontrada');
  await db.update(contatos).set({ lida: true }).where(eq(contatos.id, id));
  const [c] = await db.select().from(contatos).where(eq(contatos.id, id));
  return c ? ok(c) : falha('nao-encontrada');
}

