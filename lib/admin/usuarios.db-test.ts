import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import { criarAuth, paraUsuario } from '../auth.ts';
import type { Usuario } from './permissoes.ts';
import * as U from './usuarios.ts';

let db: Db, auth: ReturnType<typeof criarAuth>, ada: Usuario;
const SENHA = 'senha-forte-123';
before(async () => { db = await dbDeTeste(); auth = criarAuth(db); });
beforeEach(async () => {
  await limpar(db);
  const r = await auth.api.createUser({ body: { name: 'Ada Admin', email: 'ada@acidi.test', password: SENHA, role: 'admin' } });
  ada = paraUsuario(r.user);
});
after(() => fechar(db));

const novo = (email: string, papel: 'admin' | 'revisor' | 'editor' = 'editor') => U.criarUsuario(db, auth, ada, { nome: 'Pessoa ' + email, email, papel, senha: SENHA });
const entrar = async (email: string, password = SENHA) => {
  const r = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
  return new Headers({ cookie: r.headers.get('set-cookie')!.split(';')[0] });
};
const sessao = (h: Headers) => auth.api.getSession({ headers: h });

test('só admin gere usuários', async () => {
  const r = await novo('rev@acidi.test', 'revisor'); assert.ok(r.ok);
  const rev: Usuario = { id: r.valor.id, nome: 'R', papel: 'revisor', ativo: true };
  assert.equal((await U.listarUsuarios(db, rev) as { erro?: string }).erro, 'sem-permissao');
  assert.equal((await U.criarUsuario(db, auth, rev, { nome: 'X', email: 'x@acidi.test', papel: 'editor', senha: SENHA }) as { erro?: string }).erro, 'sem-permissao');
});

test('criar valida e-mail repetido, senha curta e papel', async () => {
  assert.ok((await novo('ed@acidi.test')).ok);
  const dup = await novo('ED@acidi.test');
  assert.ok(!dup.ok && dup.erros?.email);
  const curta = await U.criarUsuario(db, auth, ada, { nome: 'X', email: 'y@acidi.test', papel: 'editor', senha: '123' });
  assert.ok(!curta.ok && curta.erros?.senha);
  const papel = await U.criarUsuario(db, auth, ada, { nome: 'X', email: 'z@acidi.test', papel: 'chefe', senha: SENHA });
  assert.ok(!papel.ok && papel.erros?.papel);
  const l = await U.listarUsuarios(db, ada); assert.ok(l.ok);
  const ed = l.valor.find(u => u.email === 'ed@acidi.test')!;
  assert.equal(ed.papel, 'editor'); assert.equal(ed.ativo, true); assert.equal(ed.trocarSenha, true);
});

test('nunca fica sem admin ativo', async () => {
  const msg = 'Precisa haver ao menos um admin ativo.';
  let r = await U.mudarPapel(db, ada, ada.id, 'editor');
  assert.ok(!r.ok && r.erros?.papel === msg);
  r = await U.desativarUsuario(db, ada, ada.id);
  assert.ok(!r.ok && r.erros?.ativo === msg);
  const outro = await novo('bia@acidi.test', 'admin'); assert.ok(outro.ok);
  assert.ok((await U.mudarPapel(db, ada, ada.id, 'revisor')).ok);
});

test('desativar derruba a sessão; reativar devolve o acesso', async () => {
  const ed = await novo('ed@acidi.test'); assert.ok(ed.ok);
  const h = await entrar('ed@acidi.test');
  assert.ok(await sessao(h));
  assert.ok((await U.desativarUsuario(db, ada, ed.valor.id)).ok);
  assert.equal(await sessao(h), null);
  await assert.rejects(entrar('ed@acidi.test'));
  assert.ok((await U.reativarUsuario(db, ada, ed.valor.id)).ok);
  assert.ok(await sessao(await entrar('ed@acidi.test')));
});

test('redefinir senha troca a senha e obriga nova troca', async () => {
  const ed = await novo('ed@acidi.test'); assert.ok(ed.ok);
  const h = await entrar('ed@acidi.test');
  assert.ok((await U.redefinirSenha(db, auth, ada, ed.valor.id, 'provisoria-nova-1')).ok);
  assert.equal(await sessao(h), null, 'sessões antigas caem');
  await assert.rejects(entrar('ed@acidi.test'));
  const s = await sessao(await entrar('ed@acidi.test', 'provisoria-nova-1'));
  assert.equal(s?.user.trocarSenha, true);
});
