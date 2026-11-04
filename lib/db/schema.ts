import { mysqlTable, varchar, text, date, boolean, int } from 'drizzle-orm/mysql-core';
import { id, ref, chave, json, quando, agora } from './colunas.ts';
import type { Bloco } from '../types.ts';
import { user } from './auth-schema.ts';
export * from './auth-schema.ts';

export const noticias = mysqlTable('noticias', {
  id: id(),
  slug: chave().notNull().unique(),
  data: date({ mode: 'string' }).notNull(),
  titulo: text().notNull(),
  imagem: text().notNull(),
  alt: text().notNull(),
  resumo: text().notNull(),
  corpo: json<Bloco[]>().notNull(),
  situacao: varchar({ length: 30 }).$type<'rascunho' | 'revisao' | 'publicada' | 'devolvida'>().notNull().default('rascunho'),
  comentarioRevisao: text(),
  autorId: ref().references(() => user.id, { onDelete: 'set null' }),
  publicadaPorId: ref().references(() => user.id, { onDelete: 'set null' }),
  publicadaEm: quando(),
  atualizadaPorId: ref().references(() => user.id, { onDelete: 'set null' }),
  criadaEm: agora(),
  atualizadaEm: agora(),
});

export const eventos = mysqlTable('eventos', {
  id: id(),
  data: date({ mode: 'string' }).notNull(),
  titulo: text().notNull(),
  horario: text(),
  local: text().notNull(),
  descricao: text().notNull(),
  atualizadoEm: agora(),
  atualizadoPorId: ref().references(() => user.id, { onDelete: 'set null' }),
});

export const diretoria = mysqlTable('diretoria', {
  id: id(),
  grupo: varchar({ length: 30 }).$type<'executiva' | 'vps' | 'consultivo' | 'fiscal' | 'deliberativo' | 'deliberativoSuplentes'>().notNull(),
  rotulo: text(),
  nome: text().notNull(),
  suplente: boolean().notNull().default(false),
  ordem: int().notNull(),
});

export const exPresidentes = mysqlTable('ex_presidentes', {
  id: id(),
  foto: text(),
  nome: text().notNull(),
  gestao: text(),
  ordem: int().notNull(),
});

// Mensagens dos formulários públicos (contato, associe-se, auditório). campos guarda rótulo e valor na ordem do formulário.
export const contatos = mysqlTable('contatos', {
  id: id(),
  formulario: varchar({ length: 30 }).$type<'contato' | 'associe-se' | 'auditorio'>().notNull(),
  nome: text().notNull(),
  email: text().notNull(),
  campos: json<{ rotulo: string; valor: string }[]>().notNull(),
  lida: boolean().notNull().default(false),
  criadaEm: agora(),
});
