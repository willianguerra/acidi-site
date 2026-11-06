import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerPagina, limitarPagina, paginar, urlCom, paginasVisiveis, lerIds, resumoMassa, textoMassa, voltaComMsg } from './lista.ts';
import { ok, falha } from './resultado.ts';

test('lerPagina aceita só inteiros positivos', () => {
  assert.equal(lerPagina(undefined), 1); assert.equal(lerPagina('abc'), 1); assert.equal(lerPagina('0'), 1);
  assert.equal(lerPagina('-2'), 1); assert.equal(lerPagina('3'), 3); assert.equal(lerPagina('2.5'), 1);
});

test('limitarPagina prende entre 1 e a última', () => {
  assert.equal(limitarPagina(999, 41), 3); assert.equal(limitarPagina(5, 0), 1);
});

test('paginar fatia de 20 em 20', () => {
  const r = paginar(Array.from({ length: 45 }, (_, i) => i), 3);
  assert.deepEqual(r, { itens: [40, 41, 42, 43, 44], total: 45, pagina: 3 });
});

test('urlCom troca filtro, zera a página e remove vazios', () => {
  assert.equal(urlCom('/admin/noticias', { situacao: 'publicada', pagina: '3', busca: '' }, { situacao: 'revisao' }), '/admin/noticias?situacao=revisao');
  assert.equal(urlCom('/admin/noticias', { busca: 'feira' }, { pagina: '2' }), '/admin/noticias?busca=feira&pagina=2');
  assert.equal(urlCom('/admin/noticias', { busca: 'a b' }, { pagina: '1' }), '/admin/noticias?busca=a+b&pagina=1');
  assert.equal(urlCom('/admin/noticias', {}, {}), '/admin/noticias');
});

test('paginasVisiveis mostra ponta, vizinhas e reticências', () => {
  assert.deepEqual(paginasVisiveis(1, 1), [1]);
  assert.deepEqual(paginasVisiveis(6, 11), [1, '…', 5, 6, 7, '…', 11]);
  assert.deepEqual(paginasVisiveis(2, 4), [1, 2, 3, 4]);
});

test('lerIds tira repetidos e recusa mais de 100', () => {
  const f = new FormData(); ['a', 'b', 'a'].forEach(i => f.append('ids', i));
  assert.deepEqual(lerIds(f), ['a', 'b']);
  const g = new FormData(); for (let i = 0; i < 101; i++) g.append('ids', 'x' + i);
  assert.equal(lerIds(g), null);
});

test('resumoMassa conta feitas, recusadas e não encontradas', () => {
  assert.deepEqual(resumoMassa([ok(1), ok(2), falha('sem-permissao'), falha('nao-encontrada')]), { feitas: 2, recusadas: 1, naoEncontradas: 1 });
});

test('textoMassa', () => {
  assert.equal(textoMassa({ feitas: 3, recusadas: 0, naoEncontradas: 0 }, 'apagada', 'apagadas'), '3 apagadas.');
  assert.equal(textoMassa({ feitas: 1, recusadas: 0, naoEncontradas: 0 }, 'apagada', 'apagadas'), '1 apagada.');
  assert.equal(textoMassa({ feitas: 3, recusadas: 1, naoEncontradas: 0 }, 'publicada', 'publicadas'), '3 publicadas, 1 não pôde ser alterada.');
  assert.equal(textoMassa({ feitas: 0, recusadas: 2, naoEncontradas: 1 }, 'publicada', 'publicadas'), '0 publicadas, 2 não puderam ser alteradas, 1 não encontrada.');
});

test('voltaComMsg só aceita a própria lista e junta a mensagem', () => {
  const f = (v: string) => { const x = new FormData(); x.append('volta', v); return x; };
  assert.equal(voltaComMsg(f('/admin/agenda?aba=passados'), '/admin/agenda', 'Feito.'), '/admin/agenda?aba=passados&msg=Feito.');
  assert.equal(voltaComMsg(f('https://mal.com/admin/agenda'), '/admin/agenda', 'a b'), '/admin/agenda?msg=a+b');
  assert.equal(voltaComMsg(f('/admin/agendamal'), '/admin/agenda', 'x'), '/admin/agenda?msg=x');
  assert.equal(voltaComMsg(f('/admin/agenda?msg=velha'), '/admin/agenda', 'nova'), '/admin/agenda?msg=nova');
});
