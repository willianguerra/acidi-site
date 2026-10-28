import { pgTable, uuid, text, date, jsonb, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import type { Bloco } from '../types.ts';
import { user } from './auth-schema.ts';
export * from './auth-schema.ts';

const agora = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const noticias = pgTable('noticias', {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  data: date({ mode: 'string' }).notNull(),
  titulo: text().notNull(),
  imagem: text().notNull(),
  alt: text().notNull(),
  resumo: text().notNull(),
  corpo: jsonb().$type<Bloco[]>().notNull(),
  situacao: text().$type<'rascunho' | 'revisao' | 'publicada' | 'devolvida'>().notNull().default('rascunho'),
  comentarioRevisao: text(),
  autorId: text().references(() => user.id, { onDelete: 'set null' }),
  publicadaPorId: text().references(() => user.id, { onDelete: 'set null' }),
  publicadaEm: timestamp({ withTimezone: true }),
  atualizadaPorId: text().references(() => user.id, { onDelete: 'set null' }),
  criadaEm: agora(),
  atualizadaEm: agora(),
});

export const eventos = pgTable('eventos', {
  id: uuid().primaryKey().defaultRandom(),
  data: date({ mode: 'string' }).notNull(),
  titulo: text().notNull(),
  horario: text(),
  local: text().notNull(),
  descricao: text().notNull(),
  atualizadoEm: agora(),
  atualizadoPorId: text().references(() => user.id, { onDelete: 'set null' }),
});

export const diretoria = pgTable('diretoria', {
  id: uuid().primaryKey().defaultRandom(),
  grupo: text().$type<'executiva' | 'vps' | 'consultivo' | 'fiscal' | 'deliberativo' | 'deliberativoSuplentes'>().notNull(),
  rotulo: text(),
  nome: text().notNull(),
  suplente: boolean().notNull().default(false),
  ordem: integer().notNull(),
});

export const exPresidentes = pgTable('ex_presidentes', {
  id: uuid().primaryKey().defaultRandom(),
  foto: text(),
  nome: text().notNull(),
  gestao: text(),
  ordem: integer().notNull(),
});
