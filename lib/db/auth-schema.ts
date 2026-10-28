// Tabelas do Better Auth (núcleo + plugin admin), no formato que o adaptador Drizzle espera.
// role/banned são o "papel" e o "ativo" da spec (ativo = !banned).
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

const ts = () => timestamp({ withTimezone: true });

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts().notNull().defaultNow(),
  role: text(),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: ts(),
  trocarSenha: boolean().notNull().default(true),
});

export const session = pgTable('session', {
  id: text().primaryKey(),
  expiresAt: ts().notNull(),
  token: text().notNull().unique(),
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts().notNull().defaultNow(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text(),
});

export const account = pgTable('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: ts(),
  refreshTokenExpiresAt: ts(),
  scope: text(),
  password: text(),
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts().notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: ts().notNull(),
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts().notNull().defaultNow(),
});
