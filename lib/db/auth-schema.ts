// Tabelas do Better Auth (núcleo + plugin admin), no formato que o adaptador Drizzle espera.
// role/banned são o "papel" e o "ativo" da spec (ativo = !banned).
import { mysqlTable, varchar, text, boolean } from 'drizzle-orm/mysql-core';
import { chave, quando, agora } from './colunas.ts';

// ids gerados pelo Better Auth (32 caracteres); 64 dá folga.
const idAuth = () => varchar({ length: 64 });
const ts = quando;

export const user = mysqlTable('user', {
  id: idAuth().primaryKey(),
  name: text().notNull(),
  email: chave().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: agora(),
  updatedAt: agora(),
  role: varchar({ length: 30 }),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: ts(),
  trocarSenha: boolean().notNull().default(true),
});

export const session = mysqlTable('session', {
  id: idAuth().primaryKey(),
  expiresAt: ts().notNull(),
  token: chave().notNull().unique(),
  createdAt: agora(),
  updatedAt: agora(),
  ipAddress: text(),
  userAgent: text(),
  userId: idAuth().notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: idAuth(),
});

export const account = mysqlTable('account', {
  id: idAuth().primaryKey(),
  accountId: varchar({ length: 255 }).notNull(),
  providerId: varchar({ length: 64 }).notNull(),
  userId: idAuth().notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: ts(),
  refreshTokenExpiresAt: ts(),
  scope: text(),
  password: text(),
  createdAt: agora(),
  updatedAt: agora(),
});

export const verification = mysqlTable('verification', {
  id: idAuth().primaryKey(),
  identifier: chave().notNull(),
  value: text().notNull(),
  expiresAt: ts().notNull(),
  createdAt: agora(),
  updatedAt: agora(),
});
