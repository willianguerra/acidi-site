// Tipos de coluna comuns, escolhidos para rodar em MySQL 5.7+, 8 e MariaDB (o que o cPanel oferece).
import { randomUUID } from 'node:crypto';
import { customType, datetime, varchar } from 'drizzle-orm/mysql-core';

// Datas com milissegundos (a checagem de conflito de edição compara em ms), sempre em UTC (ver criarDb).
export const quando = () => datetime({ mode: 'date', fsp: 3 });
export const agora = () => quando().notNull().$defaultFn(() => new Date());

// Chave primária em texto: o app gera o UUID, então o id já é conhecido antes do insert (MySQL não tem RETURNING).
export const id = () => varchar({ length: 36 }).primaryKey().$defaultFn(() => randomUUID());
// Referência a user.id (id do Better Auth, até 64 caracteres).
export const ref = () => varchar({ length: 64 });

// Texto com índice único: 191 cabe no limite de índice de qualquer MySQL com utf8mb4.
export const chave = () => varchar({ length: 191 });

// JSON guardado em LONGTEXT: no MariaDB o tipo JSON é texto e o driver devolve string, então convertemos sempre aqui.
export const json = <T>() => customType<{ data: T; driverData: string }>({
  dataType: () => 'longtext',
  toDriver: v => JSON.stringify(v),
  fromDriver: v => (typeof v === 'string' ? JSON.parse(v) : v) as T,
})();
