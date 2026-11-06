import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import type { Usuario } from './permissoes.ts';
import type { Falha } from './resultado.ts';
import * as C from './contatos.ts';
import { resumoPainel } from './painel.ts';

let db: Db;
let id1: string, id2: string, id3: string;
const ada: Usuario = { id: 'ada', nome: 'Ada Admin', papel: 'admin', ativo: true };
const edna: Usuario = { id: 'edna', nome: 'Edna Editora', papel: 'editor', ativo: true };
const rita: Usuario = { id: 'rita', nome: 'Rita Revisora', papel: 'revisor', ativo: true };

const mensagem = async (formulario: string, nome: string) => {
  const f = new FormData();
  const p = formulario === 'contato' ? 'ct' : 'as';
  f.append('formulario', formulario); f.append(`${p}-nome`, nome); f.append(`${p}-email`, 'a@b.co');
  const r = await C.registrarContato(db, f); assert.ok(r.ok); return r.valor.id;
};

before(async () => { db = await dbDeTeste(); });
beforeEach(async () => {
  await limpar(db);
  id1 = await mensagem('contato', 'Um'); id2 = await mensagem('contato', 'Dois'); id3 = await mensagem('associe-se', 'Três');
});
after(() => fechar(db));

test('editor não lista, marca nem apaga mensagens', async () => {
  assert.equal((await C.listarContatos(db, edna, {}) as Falha).erro, 'sem-permissao');
  assert.equal((await C.marcarContatos(db, edna, [id1], true) as Falha).erro, 'sem-permissao');
  assert.equal((await C.apagarContatos(db, edna, [id1]) as Falha).erro, 'sem-permissao');
});

test('marcar como lidas ignora ids inválidos e as contagens acompanham', async () => {
  const r = await C.marcarContatos(db, ada, [id1, id2, 'lixo'], true); assert.ok(r.ok); assert.equal(r.valor, 2);
  const l = await C.listarContatos(db, ada, { lida: false }); assert.ok(l.ok);
  assert.deepEqual(l.valor.itens.map(c => c.id), [id3]);
  assert.equal(l.valor.novas, 1); assert.equal(l.valor.lidas, 2);
  assert.equal(await C.naoLidas(db, ada), 1);
  await C.marcarContatos(db, ada, [id1], false);
  assert.equal(await C.naoLidas(db, ada), 2);
});

test('filtro por formulário vale para a lista e as contagens', async () => {
  const l = await C.listarContatos(db, ada, { formulario: 'associe-se' }); assert.ok(l.ok);
  assert.equal(l.valor.total, 1); assert.equal(l.valor.novas, 1);
});

test('apagar remove só os ids pedidos', async () => {
  const r = await C.apagarContatos(db, ada, [id1]); assert.ok(r.ok); assert.equal(r.valor, 1);
  const l = await C.listarContatos(db, ada, {}); assert.ok(l.ok); assert.equal(l.valor.total, 2);
  assert.deepEqual((await C.apagarContatos(db, ada, [])), { ok: true, valor: 0 });
});

test('naoLidas é 0 sem permissão', async () => { assert.equal(await C.naoLidas(db, edna), 0); });

test('resumoPainel mostra só o que cada papel vê', async () => {
  const e = await resumoPainel(db, edna);
  assert.equal('emRevisao' in e, false); assert.equal('mensagensNovas' in e, false); assert.equal(e.publicadas, 0);
  const r = await resumoPainel(db, rita);
  assert.equal(r.emRevisao, 0); assert.equal('mensagensNovas' in r, false);
  const a = await resumoPainel(db, ada);
  assert.equal(a.mensagensNovas, 3); assert.equal(a.eventosFuturos, 0);
});
