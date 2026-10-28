import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbDeTeste, limpar, fechar, type Db } from '../db/teste.ts';
import { db as dbDoSite } from '../db/index.ts';
import { carregar } from '../../scripts/carga.ts';
import { getDiretoria, getExPresidentes } from '../content.ts';
import type { Usuario } from './permissoes.ts';
import * as D from './diretoria.ts';
import * as P from './ex-presidentes.ts';

let db: Db;
const adm: Usuario = { id: 'adm', nome: 'Ada', papel: 'admin', ativo: true };
const rev: Usuario = { ...adm, id: 'rev', papel: 'revisor' };
const ed: Usuario = { ...adm, id: 'ed', papel: 'editor' };
before(async () => { db = await dbDeTeste(); });
beforeEach(async () => { await limpar(db); await carregar(db); });
after(async () => { await fechar(db); await fechar(dbDoSite); });

test('revisor e editor não mexem na diretoria nem nos ex-presidentes', async () => {
  for (const u of [rev, ed]) {
    assert.equal((await D.listarMembros(db, u) as { erro?: string }).erro, 'sem-permissao');
    assert.equal((await D.salvarMembro(db, u, null, { grupo: 'consultivo', nome: 'X' }) as { erro?: string }).erro, 'sem-permissao');
    assert.equal((await P.salvarExPresidente(db, u, null, { nome: 'X' }) as { erro?: string }).erro, 'sem-permissao');
  }
});

test('membro novo entra no fim do grupo', async () => {
  assert.ok((await D.salvarMembro(db, adm, null, { grupo: 'executiva', rotulo: 'Diretor de eventos', nome: 'Novo Nome' })).ok);
  const ex = (await getDiretoria()).executiva;
  assert.deepEqual(ex.at(-1), { cargo: 'Diretor de eventos', nome: 'Novo Nome' });
  assert.equal(ex.length, 5);
});

test('mover troca só com o vizinho do mesmo grupo', async () => {
  const l = await D.listarMembros(db, adm); assert.ok(l.ok);
  const executiva = l.valor.filter(m => m.grupo === 'executiva'), vps = l.valor.filter(m => m.grupo === 'vps');
  const antes = await getDiretoria();
  assert.ok((await D.moverMembro(db, adm, executiva[0].id, 'cima')).ok);
  assert.deepEqual(await getDiretoria(), antes, 'primeiro não sobe');
  await D.moverMembro(db, adm, vps[0].id, 'cima');
  assert.deepEqual((await getDiretoria()).executiva, antes.executiva, 'primeiro vp não troca com o último da executiva');
  await D.moverMembro(db, adm, executiva[1].id, 'cima');
  const depois = (await getDiretoria()).executiva;
  assert.equal(depois[0].nome, executiva[1].nome);
  assert.equal(depois[1].nome, executiva[0].nome);
});

test('editar e apagar membro', async () => {
  const l = await D.listarMembros(db, adm); assert.ok(l.ok);
  const m = l.valor.find(m => m.grupo === 'consultivo')!;
  assert.ok((await D.salvarMembro(db, adm, m.id, { grupo: 'consultivo', nome: 'Nome Corrigido' })).ok);
  assert.ok((await getDiretoria()).consultivo.includes('Nome Corrigido'));
  const r = await D.salvarMembro(db, adm, m.id, { grupo: 'consultivo', nome: '' });
  assert.ok(!r.ok && r.erros?.nome);
  assert.ok((await D.apagarMembro(db, adm, m.id)).ok);
  assert.ok(!(await getDiretoria()).consultivo.includes('Nome Corrigido'));
});

test('ex-presidente: criar no fim, mover e apagar', async () => {
  assert.ok((await P.salvarExPresidente(db, adm, null, { nome: 'Novo Presidente', gestao: '2026 a 2028', foto: '' })).ok);
  let lista = await getExPresidentes();
  assert.deepEqual(lista.at(-1), { nome: 'Novo Presidente', gestao: '2026 a 2028', foto: null });
  const l = await P.listarExPresidentes(db, adm); assert.ok(l.ok);
  const ult = l.valor.at(-1)!;
  await P.moverExPresidente(db, adm, ult.id, 'cima');
  lista = await getExPresidentes();
  assert.equal(lista.at(-2)!.nome, 'Novo Presidente');
  assert.ok((await P.apagarExPresidente(db, adm, ult.id)).ok);
  assert.equal((await getExPresidentes()).length, 13);
});
