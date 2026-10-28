import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dlong, dshort, evId } from './datas.ts';

test('dlong', () => assert.equal(dlong('2025-04-11'), '11 de abril de 2025'));
test('dshort', () => assert.equal(dshort('2022-05-08'), '8 mai 2022'));
test('evId usa as 2 últimas palavras sem acento', () =>
  assert.equal(evId({ data: '2026-02-25', titulo: 'Visita do deputado estadual Napoleão Bernardes', horario: null, local: 'SRI', descricao: '' }),
    'evento-2026-02-25-napoleao-bernardes'));
test('evId remove pontuação', () =>
  assert.equal(evId({ data: '2022-05-18', titulo: 'Visita do DNIT/SC', horario: '11h', local: 'ACIDI', descricao: '' }),
    'evento-2022-05-18-do-dnitsc'));
