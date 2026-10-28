import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destaque } from './destaque.ts';

test('lista vazia não tem destaque', () => assert.equal(destaque([]), null));
test('primeiro é o destaque e o resto segue', () => assert.deepEqual(destaque(['a', 'b', 'c']), { primeiro: 'a', resto: ['b', 'c'] }));
