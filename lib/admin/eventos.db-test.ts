import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import { user } from '../db/schema.ts';
import type { Usuario } from './permissoes.ts';
import * as E from './eventos.ts';

let db: Db;
const edna: Usuario = { id: 'edna', nome: 'Edna Editora', papel: 'editor', ativo: true };
before(async () => { db = await dbDeTeste(); });
beforeEach(async () => { await limpar(db); await db.insert(user).values({ id: 'edna', name: 'Edna Editora', email: 'edna@acidi.test' }); });
after(() => fechar(db));

const dados = { data: '2026-11-20', titulo: 'Café com empresários', horario: '8h', local: 'Auditório da ACIDI', descricao: 'Encontro mensal.' };

test('editor cria, edita e apaga evento', async () => {
  const c = await E.criarEvento(db, edna, dados);
  assert.ok(c.ok);
  let lista = await E.listarEventos(db, edna);
  assert.ok(lista.ok && lista.valor.length === 1);
  const ev = lista.valor[0];
  assert.ok((await E.salvarEvento(db, edna, ev.id, { ...dados, titulo: 'Café empresarial' }, ev.atualizadoEm.toISOString())).ok);
  lista = await E.listarEventos(db, edna);
  assert.ok(lista.ok && lista.valor[0].titulo === 'Café empresarial');
  assert.ok((await E.apagarEvento(db, edna, ev.id)).ok);
  lista = await E.listarEventos(db, edna);
  assert.ok(lista.ok && lista.valor.length === 0);
});

test('versão antiga dá conflito com o nome de quem salvou', async () => {
  await E.criarEvento(db, edna, dados);
  const l = await E.listarEventos(db, edna); assert.ok(l.ok);
  const lido = l.valor[0].atualizadoEm.toISOString();
  assert.ok((await E.salvarEvento(db, edna, l.valor[0].id, dados, lido)).ok);
  const r = await E.salvarEvento(db, edna, l.valor[0].id, dados, lido);
  assert.ok(!r.ok && r.erro === 'conflito' && r.quem === 'Edna Editora');
});

test('evento sem horário grava null e dados inválidos voltam com erros', async () => {
  assert.ok((await E.criarEvento(db, edna, { ...dados, horario: '' })).ok);
  const l = await E.listarEventos(db, edna); assert.ok(l.ok);
  assert.equal(l.valor[0].horario, null);
  const r = await E.criarEvento(db, edna, { ...dados, local: '' });
  assert.ok(!r.ok && r.erros?.local);
});

test('usuário inativo não mexe na agenda', async () => {
  const r = await E.criarEvento(db, { ...edna, ativo: false }, dados);
  assert.ok(!r.ok && r.erro === 'sem-permissao');
});
