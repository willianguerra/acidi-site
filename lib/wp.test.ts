import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocosDe, resumoDe, textoDe } from './wp.ts';

test('converte parágrafos, listas e citações, descartando vazios e formatação', () => {
  const html = '<p>Olá <strong>mundo</strong> &#8211; ok&nbsp;sim</p>\n<p>&nbsp;</p><ul><li>a</li><li><em>b</em></li></ul><blockquote><p>dito</p></blockquote><p>linha<br />quebrada</p>';
  assert.deepEqual(blocosDe(html), ['Olá mundo – ok sim', { lista: ['a', 'b'] }, { citacao: 'dito' }, 'linha quebrada']);
});

test('decodifica entidades numéricas e nomeadas', () => {
  assert.equal(textoDe('&#x201C;A&#x201D; &amp; &ldquo;B&rdquo; &hellip;'), '“A” & “B” …');
});

test('resumo corta na última frase ou palavra', () => {
  assert.equal(resumoDe('Curto.'), 'Curto.');
  const longo = 'Primeira frase bem comprida que passa de oitenta caracteres para valer o corte na frase. ' + 'x '.repeat(100);
  assert.equal(resumoDe(longo), 'Primeira frase bem comprida que passa de oitenta caracteres para valer o corte na frase.');
  assert.ok(resumoDe('palavra '.repeat(40)).endsWith('…'));
});
