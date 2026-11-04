import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerFormulario } from './contatos.ts';

const fd = (o: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) for (const x of [v].flat()) f.append(k, x);
  return f;
};

test('lê o formulário com rótulos na ordem, junta múltiplos e descarta vazios e campos estranhos', () => {
  const r = lerFormulario(fd({ formulario: 'associe-se', 'as-email': ' m@e.com ', 'as-nome': 'Maria', 'as-int': ['A', 'B'], 'as-msg': '', 'x-extra': 'lixo' }));
  assert.ok(r.ok);
  assert.equal(r.valor.nome, 'Maria');
  assert.equal(r.valor.email, 'm@e.com');
  assert.deepEqual(r.valor.campos, [{ rotulo: 'Nome', valor: 'Maria' }, { rotulo: 'E-mail', valor: 'm@e.com' }, { rotulo: 'Interesses', valor: 'A, B' }]);
});

test('rejeita formulário desconhecido, sem nome ou com e-mail inválido', () => {
  assert.equal(lerFormulario(fd({ formulario: 'outro', 'ct-nome': 'a', 'ct-email': 'a@b.co' })).ok, false);
  assert.equal(lerFormulario(fd({ formulario: 'contato', 'ct-email': 'a@b.co' })).ok, false);
  assert.equal(lerFormulario(fd({ formulario: 'contato', 'ct-nome': 'a', 'ct-email': 'a@' })).ok, false);
});
