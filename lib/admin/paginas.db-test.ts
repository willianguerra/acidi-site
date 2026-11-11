import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import { db as dbDoSite } from '../db/index.ts';
import { paginas, user } from '../db/schema.ts';
import { carregar } from '../../scripts/carga.ts';
import type { ConteudoPagina } from '../types.ts';
import type { Usuario } from './permissoes.ts';
import * as P from './paginas.ts';

let db: Db;
const adm: Usuario = { id: 'adm', nome: 'Ada', papel: 'admin', ativo: true };
const rev: Usuario = { ...adm, id: 'rev', papel: 'revisor' };
const ed: Usuario = { ...adm, id: 'ed', papel: 'editor' };
before(async () => { db = await dbDeTeste(); });
beforeEach(async () => { await limpar(db); await carregar(db); await db.insert(user).values({ id: adm.id, name: adm.nome, email: 'ada@acidi.test' }); });
after(async () => { await fechar(db); await fechar(dbDoSite); });

const form = (extra: Record<string, unknown> = {}) => ({ nome: 'Página X', descricao: 'Descrição', titulo: 'Título', chamada: 'Chamada', ...extra });
const conteudo: ConteudoPagina = { cabecalho: { etiqueta: '', titulo: 'T', destaque: '', chamada: 'C', foto: null }, lateral: null, corpo: [] };
const criar = async (slug: string, extra: Record<string, unknown> = {}) => {
  const r = await P.salvarPagina(db, adm, null, form({ slug, nome: slug, ...extra }));
  assert.ok(r.ok); return r.valor.id;
};
const linha = async (id: string) => (await db.select().from(paginas).where(eq(paginas.id, id)))[0];
const inserirHistorico = () => db.insert(paginas).values({ fixa: 'historico', slug: 'historico', nome: 'Histórico', descricao: 'x', situacao: 'publicada', ordem: 0, conteudo });

test('revisor e editor não listam nem salvam páginas', async () => {
  for (const u of [rev, ed]) {
    assert.equal((await P.listarPaginas(db, u) as { erro?: string }).erro, 'sem-permissao');
    assert.equal((await P.salvarPagina(db, u, null, form({ slug: 'x' })) as { erro?: string }).erro, 'sem-permissao');
  }
});

test('criar, publicar, tirar do ar e apagar', async () => {
  const id = await criar('sobre');
  assert.equal((await linha(id)).situacao, 'rascunho');
  assert.ok((await P.publicarPagina(db, adm, id)).ok);
  assert.equal((await linha(id)).situacao, 'publicada');
  assert.ok((await P.tirarDoAr(db, adm, id)).ok);
  assert.equal((await linha(id)).situacao, 'rascunho');
  assert.ok((await P.apagarPagina(db, adm, id)).ok);
  assert.equal(await linha(id), undefined);
});

test('endereço é obrigatório ao criar e não pode repetir', async () => {
  const sem = await P.salvarPagina(db, adm, null, form());
  assert.ok(!sem.ok && sem.erro === 'invalida' && sem.erros?.slug === 'Campo obrigatório');
  await criar('repetido');
  const r = await P.salvarPagina(db, adm, null, form({ slug: 'repetido' }));
  assert.ok(!r.ok && r.erros?.slug);
});

test('salvar com lidaEm antigo dá conflito e não altera o banco', async () => {
  const id = await criar('conflito');
  const r = await P.salvarPagina(db, adm, id, form({ slug: 'conflito', nome: 'Outro nome' }), new Date(0).toISOString());
  assert.ok(!r.ok && r.erro === 'conflito' && r.quem === 'Ada');
  assert.equal((await linha(id)).nome, 'conflito');
  const o = await P.obterPagina(db, adm, id); assert.ok(o.ok);
  assert.ok((await P.salvarPagina(db, adm, id, form({ slug: 'conflito', nome: 'Novo' }), o.valor.atualizadaEm.toISOString())).ok);
  assert.equal((await linha(id)).nome, 'Novo');
});

test('mover a terceira para cima troca com a segunda, só dentro do menu', async () => {
  const a = await criar('a', { menu: 'acidi' }), b = await criar('b', { menu: 'acidi' }), c = await criar('c', { menu: 'acidi' });
  await criar('d', { menu: 'negocio' });
  assert.ok((await P.moverPagina(db, adm, c, 'cima')).ok);
  const l = await P.listarPaginas(db, adm); assert.ok(l.ok);
  assert.deepEqual(l.valor.filter(p => p.menu === 'acidi').map(p => p.id), [a, c, b]);
});

test('página fixa não sai do ar, não é apagada e mantém o endereço', async () => {
  await inserirHistorico();
  const f = await P.obterPaginaFixa(db, adm, 'historico'); assert.ok(f.ok);
  for (const r of [await P.tirarDoAr(db, adm, f.valor.id), await P.apagarPagina(db, adm, f.valor.id)]) assert.ok(!r.ok && r.erro === 'invalida');
  const s = await P.salvarPagina(db, adm, f.valor.id, form({ slug: 'outro', menu: 'acidi', nome: 'Histórico 2' }), f.valor.atualizadaEm.toISOString());
  assert.ok(s.ok && s.valor.slug === 'historico');
  const depois = await P.obterPaginaFixa(db, adm, 'historico'); assert.ok(depois.ok);
  assert.deepEqual([depois.valor.slug, depois.valor.menu, depois.valor.situacao, depois.valor.nome], ['historico', null, 'publicada', 'Histórico 2']);
});
