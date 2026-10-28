import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from './db/teste.ts';
import { criarAuth, paraUsuario } from './auth.ts';

let db: Db, auth: ReturnType<typeof criarAuth>;
before(async () => { db = await dbDeTeste(); auth = criarAuth(db); });
beforeEach(() => limpar(db));
after(() => fechar(db));

const SENHA = 'senha-forte-123';
async function entrar(email: string, password = SENHA): Promise<Headers> {
  const r = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
  return new Headers({ cookie: r.headers.get('set-cookie')!.split(';')[0] });
}

test('cadastro público é recusado', async () => {
  await assert.rejects(auth.api.signUpEmail({ body: { email: 'a@b.com', password: SENHA, name: 'A' } }));
});

test('usuário criado pelo admin entra com o papel certo e com troca de senha pendente', async () => {
  await auth.api.createUser({ body: { email: 'ed@acidi.net', password: SENHA, name: 'Edna', role: 'editor' as never } });
  const s = await auth.api.getSession({ headers: await entrar('ed@acidi.net') });
  assert.ok(s);
  assert.deepEqual(paraUsuario(s.user), { id: s.user.id, nome: 'Edna', papel: 'editor', ativo: true });
  assert.equal(s.user.trocarSenha, true);
});

test('conta desativada perde a sessão e não entra mais', async () => {
  await auth.api.createUser({ body: { email: 'adm@acidi.net', password: SENHA, name: 'Ada', role: 'admin' } });
  const ed = await auth.api.createUser({ body: { email: 'ed@acidi.net', password: SENHA, name: 'Edna', role: 'editor' as never } });
  const sessaoEd = await entrar('ed@acidi.net');
  await auth.api.banUser({ body: { userId: ed.user.id }, headers: await entrar('adm@acidi.net') });
  assert.equal(await auth.api.getSession({ headers: sessaoEd }), null);
  await assert.rejects(entrar('ed@acidi.net'));
});

test('paraUsuario mapeia papel e ativo', () => {
  assert.deepEqual(paraUsuario({ id: '1', name: 'R', role: 'revisor', banned: false }), { id: '1', nome: 'R', papel: 'revisor', ativo: true });
  assert.deepEqual(paraUsuario({ id: '2', name: 'B', role: 'admin', banned: true }), { id: '2', nome: 'B', papel: 'admin', ativo: false });
  assert.equal(paraUsuario({ id: '3', name: 'X', role: null, banned: null }).papel, 'editor');
});
