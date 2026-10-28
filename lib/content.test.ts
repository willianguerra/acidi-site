import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as c from './content.ts';

// Mesmas contagens do antigo ferramentas/gerar_site.py
test('contagens do conteúdo migrado', async () => {
  assert.equal((await c.getServicos()).length, 7);
  assert.equal((await c.getEventos()).length, 6);
  assert.equal((await c.getNoticias()).length, 10);
  assert.equal((await c.getDiretoria()).vps.length, 15);
  assert.equal((await c.getExPresidentes()).length, 13);
  assert.equal((await c.getGaleriaAuditorio()).length, 6);
  assert.equal((await c.getBeneficios()).length, 6);
  assert.equal((await c.getAssuntosContato()).length, 12);
});

test('getNoticia por slug', async () => {
  assert.equal((await c.getNoticia('networkaffee'))?.slug, 'networkaffee');
  assert.equal(await c.getNoticia('nao-existe'), undefined);
});
