import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dlong, dshort, evId, hojeIso, separarEventos } from './datas.ts';

test('dlong', () => assert.equal(dlong('2025-04-11'), '11 de abril de 2025'));
test('dshort', () => assert.equal(dshort('2022-05-08'), '8 mai 2022'));
test('evId usa as 2 últimas palavras sem acento', () =>
  assert.equal(evId({ data: '2026-02-25', titulo: 'Visita do deputado estadual Napoleão Bernardes', horario: null, local: 'SRI', descricao: '' }),
    'evento-2026-02-25-napoleao-bernardes'));
test('evId remove pontuação', () =>
  assert.equal(evId({ data: '2022-05-18', titulo: 'Visita do DNIT/SC', horario: '11h', local: 'ACIDI', descricao: '' }),
    'evento-2022-05-18-do-dnitsc'));

test('hojeIso usa o fuso de Brasília mesmo com o servidor em UTC', () => {
  process.env.TZ = 'UTC';
  assert.equal(hojeIso(new Date('2026-11-06T01:00:00Z')), '2026-11-05'); // 22h de 5/11 em Brasília
});

test('separarEventos: próximos do mais cedo ao mais tarde, arquivo do mais recente ao mais antigo', () => {
  const ev = (data: string) => ({ data, titulo: data, horario: null, local: '', descricao: '' });
  const { prox, arquivo } = separarEventos([ev('2026-12-01'), ev('2022-05-18'), ev('2026-11-05'), ev('2024-01-01')], '2026-11-05');
  assert.deepEqual(prox.map(e => e.data), ['2026-11-05', '2026-12-01']);
  assert.deepEqual(arquivo.map(e => e.data), ['2024-01-01', '2022-05-18']);
});
