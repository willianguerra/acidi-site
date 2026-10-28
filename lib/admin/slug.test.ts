import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugDe } from './slug.ts';

test('slug sem acento, minúsculo e com hífens', () =>
  assert.equal(slugDe('Contabilidade e impacto social: construindo um futuro melhor!'), 'contabilidade-e-impacto-social-construindo-um-futuro-melhor'));
test('slug apara espaços e não repete hífens', () => assert.equal(slugDe('  Ação   Já -- ok '), 'acao-ja-ok'));
