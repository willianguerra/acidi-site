import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarLimitador } from './limite.ts';

const relogio = () => { let t = 0; return { agora: () => t, anda: (ms: number) => { t += ms; } }; };

test('bloqueia depois de max falhas dentro da janela', () => {
  const r = relogio(), l = criarLimitador({ max: 3, janelaMs: 1000, agora: r.agora });
  for (let i = 0; i < 3; i++) { assert.equal(l.bloqueado('a'), false); l.falhou('a'); }
  assert.equal(l.bloqueado('a'), true);
  assert.equal(l.bloqueado('b'), false, 'outra chave não é afetada');
});

test('libera quando a janela passa', () => {
  const r = relogio(), l = criarLimitador({ max: 2, janelaMs: 1000, agora: r.agora });
  l.falhou('a'); l.falhou('a');
  assert.equal(l.bloqueado('a'), true);
  r.anda(1001);
  assert.equal(l.bloqueado('a'), false);
});

test('acerto zera as falhas', () => {
  const r = relogio(), l = criarLimitador({ max: 2, janelaMs: 1000, agora: r.agora });
  l.falhou('a'); l.limpar('a'); l.falhou('a');
  assert.equal(l.bloqueado('a'), false);
});
