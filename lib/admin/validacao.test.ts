import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, esquemaNoticia, esquemaEvento } from './validacao.ts';

const noticia = { titulo: ' Título ', data: '2026-11-05', resumo: 'r', imagem: '/uploads/a.jpg', alt: 'foto', corpo: ['p'] };

test('notícia válida tem textos aparados', () => {
  const r = validar(esquemaNoticia, noticia);
  assert.ok(r.ok);
  assert.equal(r.valor.titulo, 'Título');
});
test('notícia sem alt dá erro em alt', () => {
  const r = validar(esquemaNoticia, { ...noticia, alt: '  ' });
  assert.ok(!r.ok);
  assert.ok(r.erros.alt);
});
test('data impossível dá erro em data', () => {
  const r = validar(esquemaNoticia, { ...noticia, data: '2026-13-01' });
  assert.ok(!r.ok && r.erros.data);
  assert.ok(!validar(esquemaNoticia, { ...noticia, data: '2026-02-30' }).ok);
});
test('corpo vazio e blocos vazios são recusados', () => {
  const r = validar(esquemaNoticia, { ...noticia, corpo: [] });
  assert.ok(!r.ok && r.erros.corpo);
  for (const b of [{ tabela: [] }, { lista: [''] }, { lista: [] }, { citacao: ' ' }, '', { outro: 1 }])
    assert.ok(!validar(esquemaNoticia, { ...noticia, corpo: [b] }).ok, JSON.stringify(b));
});
test('todos os tipos de bloco válidos passam', () => {
  const corpo = ['p', { lista: ['a'] }, { citacao: 'c' }, { tabela: [{ categoria: 'k', itens: ['i'] }] }];
  assert.ok(validar(esquemaNoticia, { ...noticia, corpo }).ok);
});
test('evento sem horário grava null', () => {
  const r = validar(esquemaEvento, { data: '2026-11-05', titulo: 'E', horario: '', local: 'ACIDI', descricao: 'd' });
  assert.ok(r.ok);
  assert.equal(r.valor.horario, null);
});
