import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { salvarImagem, lerImagem, NOME_UPLOAD, MAX_BYTES, type Destino } from './storage.ts';

let dir: string, destino: Destino;
before(async () => { dir = await mkdtemp(join(tmpdir(), 'acidi-up-')); destino = { tipo: 'disco', dir }; });
after(() => rm(dir, { recursive: true, force: true }));

const imagem = (w: number, h: number, formato: 'png' | 'jpeg') =>
  sharp({ create: { width: w, height: h, channels: 3, background: '#0B3D24' } }).toFormat(formato).toBuffer();
const arq = (b: Uint8Array) => ({ bytes: b, tamanho: b.byteLength });
const arquivoSalvo = (caminho: string) => join(dir, caminho.replace('/uploads/', ''));

test('texto com extensão de imagem é recusado pelo conteúdo', async () => {
  assert.deepEqual(await salvarImagem(arq(new TextEncoder().encode('não sou imagem')), destino), { ok: false, erro: 'tipo' });
});

test('arquivo acima de 8 MB é recusado antes de decodificar', async () => {
  assert.equal(MAX_BYTES, 8 * 1024 * 1024);
  assert.deepEqual(await salvarImagem({ bytes: new Uint8Array(10), tamanho: MAX_BYTES + 1 }, destino), { ok: false, erro: 'tamanho' });
});

test('imagem larga é reduzida para 1600 px e mantém o formato', async () => {
  const r = await salvarImagem(arq(await imagem(3000, 1000, 'png')), destino);
  assert.ok(r.ok);
  assert.match(r.caminho, /^\/uploads\/.+\.png$/);
  assert.match(r.caminho.slice(9), NOME_UPLOAD);
  const m = await sharp(await readFile(arquivoSalvo(r.caminho))).metadata();
  assert.equal(m.width, 1600);
  assert.equal(m.format, 'png');
});

test('imagem pequena não é ampliada', async () => {
  const r = await salvarImagem(arq(await imagem(800, 600, 'jpeg')), destino);
  assert.ok(r.ok);
  assert.match(r.caminho, /\.jpg$/);
  assert.equal((await sharp(await readFile(arquivoSalvo(r.caminho))).metadata()).width, 800);
});

// Roda só com um servidor FTP de teste no ar, ex.: python -m pyftpdlib -p 2121 -u teste -P teste -w -d <pasta>
// e FTP_HOST=localhost FTP_PORT=2121 FTP_USUARIO=teste FTP_SENHA=teste FTP_SEGURO=false.
test('FTP: grava, lê de volta e devolve null para arquivo ausente', { skip: !process.env.FTP_HOST }, async () => {
  const ftp: Destino = { tipo: 'ftp', dir: 'teste/uploads' };
  const r = await salvarImagem(arq(await imagem(800, 600, 'jpeg')), ftp);
  assert.ok(r.ok);
  const lida = await lerImagem(r.caminho.slice(9), ftp);
  assert.equal((await sharp(lida!).metadata()).width, 800);
  assert.equal(await lerImagem('00000000-0000-0000-0000-000000000000.jpg', ftp), null);
});

test('disco: lerImagem devolve o arquivo salvo e null para ausente', async () => {
  const r = await salvarImagem(arq(await imagem(800, 600, 'png')), destino);
  assert.ok(r.ok);
  assert.ok((await lerImagem(r.caminho.slice(9), destino))!.length > 0);
  assert.equal(await lerImagem('00000000-0000-0000-0000-000000000000.png', destino), null);
});
