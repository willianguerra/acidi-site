import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, esquemaPagina, esquemaHome } from './validacao.ts';

const base = { nome: 'Campanha', descricao: 'Sobre a campanha', titulo: 'Campanha' };
const pagina = (extra: Record<string, unknown> = {}) => validar(esquemaPagina, { ...base, ...extra });
const erros = (extra: Record<string, unknown>): Record<string, string> => { const r = pagina(extra); return r.ok ? {} : r.erros; };

test('endereço: reservado, formato e tamanho', () => {
  for (const s of ['agenda', 'admin', 'Nova', 'nova pagina', 'ação', '-x', 'a'.repeat(81)])
    assert.ok(erros({ slug: s }).slug, s);
  assert.equal(pagina({ slug: 'campanha-2027' }).ok, true);
});

test('título obrigatório; foto exige texto alternativo', () => {
  assert.equal(validar(esquemaPagina, { nome: 'x', descricao: 'y' }).ok, false);
  assert.equal(erros({ titulo: '' }).titulo, 'Campo obrigatório');
  assert.ok(erros({ foto: '/uploads/a.jpg', fotoAlt: '' }).fotoAlt);
});

test('botão: texto exige endereço e o endereço precisa ser seguro', () => {
  assert.ok(erros({ botaoTexto: 'Ir' }).botaoHref);
  assert.ok(erros({ botaoTexto: 'Ir', botaoHref: 'javascript:x' }).botaoHref);
  const r = pagina({ botaoTexto: 'Ir', botaoHref: '/contato' });
  assert.ok(r.ok && r.valor.conteudo.lateral?.botao?.href === '/contato');
});

test('limites de tamanho', () => {
  assert.ok(erros({ chamada: 'a'.repeat(1001) }).chamada);
  assert.ok(erros({ descricao: 'a'.repeat(301) }).descricao);
});

test('mínimo válido: sem foto nem lateral', () => {
  const r = pagina();
  assert.ok(r.ok);
  assert.equal(r.valor.conteudo.lateral, null);
  assert.equal(r.valor.conteudo.cabecalho.foto, null);
  assert.deepEqual(r.valor.conteudo.corpo, []);
  assert.equal(r.valor.menu, null);
});

test('esquemaHome monta três pilares', () => {
  const campos = ['destaque.etiqueta', 'destaque.linha1', 'destaque.negrito', 'destaque.chamada', 'destaque.desde',
    'quemSomos.etiqueta', 'quemSomos.titulo', 'quemSomos.negrito', 'quemSomos.chamada',
    ...[1, 2, 3].flatMap(n => [`quemSomos.pilar${n}.titulo`, `quemSomos.pilar${n}.texto`]),
    ...['servicos', 'noticias', 'representatividade', 'auditorio', 'associe'].flatMap(s => [`${s}.titulo`, `${s}.negrito`, `${s}.chamada`]),
    'representatividade.sub'];
  const r = validar(esquemaHome, Object.fromEntries(campos.map(c => [c, 'x'])));
  assert.ok(r.ok);
  assert.equal(r.valor.quemSomos.pilares.length, 3);
  assert.equal(r.valor.representatividade.sub, 'x');
});
