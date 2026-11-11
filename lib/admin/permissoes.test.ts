import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pode, type Usuario, type Acao } from './permissoes.ts';

const u = (papel: Usuario['papel'], ativo = true): Usuario => ({ id: papel, nome: papel, papel, ativo });
const minha = (situacao: 'rascunho' | 'revisao' | 'publicada' | 'devolvida') => ({ autorId: 'editor', situacao });
const deOutro = (situacao: 'rascunho' | 'revisao' | 'publicada' | 'devolvida') => ({ autorId: 'outro', situacao });
const TODAS: Acao[] = ['noticia.criar', 'noticia.editar', 'noticia.enviar', 'noticia.publicar', 'noticia.devolver', 'noticia.despublicar', 'noticia.apagar', 'agenda.editar', 'diretoria.editar', 'usuarios.gerir', 'contatos.ver', 'paginas.editar'];

test('editor edita e envia só os próprios rascunhos e devolvidas', () => {
  const e = u('editor');
  for (const a of ['noticia.editar', 'noticia.enviar'] as Acao[]) {
    assert.equal(pode(e, a, minha('rascunho')), true, a);
    assert.equal(pode(e, a, minha('devolvida')), true, a);
    assert.equal(pode(e, a, minha('revisao')), false, a);
    assert.equal(pode(e, a, minha('publicada')), false, a);
    assert.equal(pode(e, a, deOutro('rascunho')), false, a);
    assert.equal(pode(e, a), false, a);
  }
});

test('editor não publica, devolve nem despublica', () => {
  for (const a of ['noticia.publicar', 'noticia.devolver', 'noticia.despublicar'] as Acao[])
    for (const s of ['rascunho', 'revisao', 'publicada', 'devolvida'] as const) assert.equal(pode(u('editor'), a, minha(s)), false, a + s);
});

test('editor apaga só o próprio rascunho', () => {
  assert.equal(pode(u('editor'), 'noticia.apagar', minha('rascunho')), true);
  assert.equal(pode(u('editor'), 'noticia.apagar', minha('devolvida')), false);
  assert.equal(pode(u('editor'), 'noticia.apagar', deOutro('rascunho')), false);
});

test('editor cria notícia e mexe na agenda, mas não em diretoria nem usuários', () => {
  assert.equal(pode(u('editor'), 'noticia.criar'), true);
  assert.equal(pode(u('editor'), 'agenda.editar'), true);
  assert.equal(pode(u('editor'), 'diretoria.editar'), false);
  assert.equal(pode(u('editor'), 'usuarios.gerir'), false);
  assert.equal(pode(u('editor'), 'contatos.ver'), false);
});

test('revisor faz tudo em notícias e agenda, nada em diretoria e usuários', () => {
  for (const a of TODAS.filter(a => a.startsWith('noticia.')))
    for (const s of ['rascunho', 'revisao', 'publicada', 'devolvida'] as const) assert.equal(pode(u('revisor'), a, deOutro(s)), true, a + s);
  assert.equal(pode(u('revisor'), 'agenda.editar'), true);
  assert.equal(pode(u('revisor'), 'diretoria.editar'), false);
  assert.equal(pode(u('revisor'), 'usuarios.gerir'), false);
  assert.equal(pode(u('revisor'), 'contatos.ver'), false);
});

test('só admin edita páginas', () => {
  assert.equal(pode(u('admin'), 'paginas.editar'), true);
  assert.equal(pode(u('revisor'), 'paginas.editar'), false);
  assert.equal(pode(u('editor'), 'paginas.editar'), false);
});

test('admin pode tudo', () => {
  for (const a of TODAS) assert.equal(pode(u('admin'), a, deOutro('revisao')), true, a);
});

test('usuário inativo não pode nada', () => {
  for (const p of ['admin', 'revisor', 'editor'] as const)
    for (const a of TODAS) assert.equal(pode(u(p, false), a, minha('rascunho')), false, p + a);
});
