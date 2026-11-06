import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import { user } from '../db/schema.ts';
import type { Usuario } from './permissoes.ts';
import * as N from './noticias.ts';

let db: Db;
before(async () => { db = await dbDeTeste(); });
beforeEach(async () => {
  await limpar(db);
  await db.insert(user).values([edna, outro, rita].map(u => ({ id: u.id, name: u.nome, email: u.id + '@acidi.test' })));
});
after(() => fechar(db));

const edna: Usuario = { id: 'edna', nome: 'Edna Editora', papel: 'editor', ativo: true };
const outro: Usuario = { id: 'otto', nome: 'Otto Editor', papel: 'editor', ativo: true };
const rita: Usuario = { id: 'rita', nome: 'Rita Revisora', papel: 'revisor', ativo: true };
const dados = (titulo = 'Feijoada da ACIDI') => ({ titulo, data: '2026-11-05', resumo: 'Resumo', imagem: '/uploads/a.jpg', alt: 'Foto', corpo: ['Texto'] });

async function criar(u = edna, titulo?: string) {
  const r = await N.criarNoticia(db, u, dados(titulo));
  assert.ok(r.ok, JSON.stringify(r));
  return r.valor;
}
async function situacao(id: string) {
  const r = await N.obterNoticia(db, rita, id);
  assert.ok(r.ok);
  return r.valor;
}

test('mesmo título duas vezes gera slug com sufixo', async () => {
  assert.equal((await criar()).slug, 'feijoada-da-acidi');
  assert.equal((await criar()).slug, 'feijoada-da-acidi-2');
  assert.equal((await criar()).slug, 'feijoada-da-acidi-3');
});

test('dados inválidos devolvem erros por campo', async () => {
  const r = await N.criarNoticia(db, edna, { ...dados(), alt: '' });
  assert.ok(!r.ok && r.erro === 'invalida' && r.erros?.alt);
});

test('editor cria e envia para revisão', async () => {
  const { id } = await criar();
  assert.equal((await situacao(id)).situacao, 'rascunho');
  assert.ok((await N.enviarNoticia(db, edna, id)).ok);
  assert.equal((await situacao(id)).situacao, 'revisao');
});

test('editor não consegue publicar chamando a ação direto', async () => {
  const { id } = await criar();
  await N.enviarNoticia(db, edna, id);
  const r = await N.publicarNoticia(db, edna, id);
  assert.ok(!r.ok && r.erro === 'sem-permissao');
  assert.equal((await situacao(id)).situacao, 'revisao');
});

test('revisão completa: devolver com comentário, reenviar e publicar', async () => {
  const { id } = await criar();
  await N.enviarNoticia(db, edna, id);
  assert.ok(!(await N.devolverNoticia(db, rita, id, '  ')).ok, 'comentário vazio é recusado');
  assert.ok((await N.devolverNoticia(db, rita, id, 'Falta a data do evento')).ok);
  let n = await situacao(id);
  assert.equal(n.situacao, 'devolvida');
  assert.equal(n.comentarioRevisao, 'Falta a data do evento');
  assert.ok((await N.enviarNoticia(db, edna, id)).ok);
  n = await situacao(id);
  assert.equal(n.situacao, 'revisao');
  assert.equal(n.comentarioRevisao, null);
  const p = await N.publicarNoticia(db, rita, id);
  assert.ok(p.ok);
  n = await situacao(id);
  assert.equal(n.situacao, 'publicada');
  assert.equal(n.publicadaPorId, 'rita');
  assert.ok(n.publicadaEm instanceof Date);
});

test('transição impossível é recusada', async () => {
  const { id } = await criar();
  const r = await N.despublicarNoticia(db, rita, id);
  assert.ok(!r.ok && r.erro === 'invalida');
});

test('salvar com versão antiga dá conflito com o nome de quem salvou', async () => {
  const { id } = await criar(rita);
  const lida = (await situacao(id)).atualizadaEm.toISOString();
  assert.ok((await N.salvarNoticia(db, rita, id, dados('Novo título'), lida)).ok);
  const r = await N.salvarNoticia(db, rita, id, dados('Outro título'), lida);
  assert.ok(!r.ok && r.erro === 'conflito');
  assert.equal(r.quem, 'Rita Revisora');
  assert.equal((await situacao(id)).titulo, 'Novo título');
});

test('editor não edita notícia publicada nem de outro editor', async () => {
  const { id } = await criar();
  const lida = (await situacao(id)).atualizadaEm.toISOString();
  assert.equal((await N.salvarNoticia(db, outro, id, dados('X'), lida) as { erro?: string }).erro, 'sem-permissao');
  await N.publicarNoticia(db, rita, id);
  const lida2 = (await situacao(id)).atualizadaEm.toISOString();
  assert.equal((await N.salvarNoticia(db, edna, id, dados('X'), lida2) as { erro?: string }).erro, 'sem-permissao');
});

test('slug só muda enquanto a notícia nunca foi publicada', async () => {
  const { id } = await criar(rita);
  let lida = (await situacao(id)).atualizadaEm.toISOString();
  await N.salvarNoticia(db, rita, id, { ...dados(), slug: 'Feijoada 2026' }, lida);
  assert.equal((await situacao(id)).slug, 'feijoada-2026');
  await N.publicarNoticia(db, rita, id);
  await N.despublicarNoticia(db, rita, id);
  lida = (await situacao(id)).atualizadaEm.toISOString();
  await N.salvarNoticia(db, rita, id, { ...dados(), slug: 'outro-slug' }, lida);
  assert.equal((await situacao(id)).slug, 'feijoada-2026');
});

test('editor apaga o próprio rascunho, mas não a devolvida', async () => {
  const a = await criar();
  assert.ok((await N.apagarNoticia(db, edna, a.id)).ok);
  assert.equal((await N.obterNoticia(db, rita, a.id) as { erro?: string }).erro, 'nao-encontrada');
  const b = await criar();
  await N.enviarNoticia(db, edna, b.id);
  await N.devolverNoticia(db, rita, b.id, 'Ajustar');
  assert.equal((await N.apagarNoticia(db, edna, b.id) as { erro?: string }).erro, 'sem-permissao');
});

test('editor vê as próprias e as publicadas; revisor filtra por situação', async () => {
  const minha = await criar(edna, 'Minha');
  const alheia = await criar(outro, 'Alheia');
  const pub = await criar(outro, 'Publicada');
  await N.publicarNoticia(db, rita, pub.id);
  const r = await N.listarNoticias(db, edna, {});
  assert.ok(r.ok);
  assert.deepEqual(r.valor.itens.map(n => n.id).sort(), [minha.id, pub.id].sort());
  assert.equal((await N.obterNoticia(db, edna, alheia.id) as { erro?: string }).erro, 'sem-permissao');
  const so = await N.listarNoticias(db, rita, { situacao: 'publicada' });
  assert.ok(so.ok);
  assert.deepEqual(so.valor.itens.map(n => n.id), [pub.id]);
  const busca = await N.listarNoticias(db, rita, { busca: 'alh' });
  assert.ok(busca.ok);
  assert.deepEqual(busca.valor.itens.map(n => n.id), [alheia.id]);
});

test('lista pagina de 20 e conta por situação com os mesmos filtros', async () => {
  for (let i = 0; i < 23; i++) await criar(rita, 'Notícia ' + i);
  const p2 = await N.listarNoticias(db, rita, { pagina: 2 }); assert.ok(p2.ok);
  assert.equal(p2.valor.itens.length, 3); assert.equal(p2.valor.total, 23); assert.equal(p2.valor.porSituacao.rascunho, 23);
  const alem = await N.listarNoticias(db, rita, { pagina: 99 }); assert.ok(alem.ok); assert.equal(alem.valor.pagina, 2);
});

test('editor só conta as próprias e as publicadas', async () => {
  await criar(edna); await criar(outro); const pub = await criar(outro, 'Publicada'); await N.publicarNoticia(db, rita, pub.id);
  const r = await N.listarNoticias(db, edna, {}); assert.ok(r.ok);
  assert.equal(r.valor.total, 2); assert.deepEqual([r.valor.porSituacao.rascunho, r.valor.porSituacao.publicada], [1, 1]);
});

test('a aba escolhida não muda as contagens das outras abas', async () => {
  await criar(rita, 'A'); const b = await criar(rita, 'B'); await N.publicarNoticia(db, rita, b.id);
  const r = await N.listarNoticias(db, rita, { situacao: 'publicada' }); assert.ok(r.ok);
  assert.equal(r.valor.total, 1); assert.equal(r.valor.porSituacao.rascunho, 1); assert.equal(r.valor.porSituacao.revisao, 0);
});

test('busca com % é literal', async () => {
  await criar(rita, '100% feira'); await criar(rita, 'Outra');
  const r = await N.listarNoticias(db, rita, { busca: '%' }); assert.ok(r.ok); assert.equal(r.valor.total, 1);
});

test('filtro por autor e ano, e as opções dos filtros', async () => {
  await criar(edna); await criar(outro);
  const r = await N.listarNoticias(db, rita, { autorId: 'otto', ano: 2026 }); assert.ok(r.ok); assert.equal(r.valor.total, 1);
  const nenhum = await N.listarNoticias(db, rita, { ano: 2020 }); assert.ok(nenhum.ok); assert.equal(nenhum.valor.total, 0);
  assert.deepEqual((await N.autoresDeNoticias(db, rita)).map(a => a.id).sort(), ['edna', 'otto']);
  assert.deepEqual(await N.anosDeNoticias(db, rita), [2026]);
  assert.deepEqual((await N.autoresDeNoticias(db, edna)).map(a => a.id), ['edna']);
});

test('usuário inativo não faz nada', async () => {
  const r = await N.criarNoticia(db, { ...rita, ativo: false }, dados());
  assert.ok(!r.ok && r.erro === 'sem-permissao');
});
