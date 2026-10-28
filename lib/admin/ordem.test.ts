import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trocaComVizinho } from './ordem.ts';

const l = [{ id: 'a', ordem: 1 }, { id: 'b', ordem: 4 }, { id: 'c', ordem: 9 }];

test('subir troca a ordem com o anterior', () => assert.deepEqual(trocaComVizinho(l, 'b', 'cima'), [{ id: 'b', ordem: 1 }, { id: 'a', ordem: 4 }]));
test('descer troca com o seguinte', () => assert.deepEqual(trocaComVizinho(l, 'b', 'baixo'), [{ id: 'b', ordem: 9 }, { id: 'c', ordem: 4 }]));
test('primeiro não sobe e último não desce', () => {
  assert.deepEqual(trocaComVizinho(l, 'a', 'cima'), []);
  assert.deepEqual(trocaComVizinho(l, 'c', 'baixo'), []);
  assert.deepEqual(trocaComVizinho(l, 'x', 'cima'), []);
});
