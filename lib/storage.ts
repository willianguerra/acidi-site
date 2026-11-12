// Upload de imagens do admin: confere o formato pelo conteúdo, reduz para 1600 px e grava em disco
// (UPLOAD_DIR), numa pasta via FTP (STORAGE=ftp), ambos servidos por app/uploads/[nome], ou num bucket S3 (STORAGE=s3).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PassThrough, Readable } from 'node:stream';
import sharp from 'sharp';

export const MAX_BYTES = 8 * 1024 * 1024;
export const LARGURA_MAX = 1600;
export const NOME_UPLOAD = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export type Destino = { tipo: 'disco'; dir: string } | { tipo: 'ftp'; dir: string } | { tipo: 's3' };
export type ResultadoUpload = { ok: true; caminho: string } | { ok: false; erro: 'tipo' | 'tamanho' };

const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp' } as const;
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;

export function destinoPadrao(): Destino {
  if (process.env.STORAGE === 's3') return { tipo: 's3' };
  if (process.env.STORAGE === 'ftp') return { tipo: 'ftp', dir: process.env.FTP_DIR || 'uploads' };
  return { tipo: 'disco', dir: process.env.UPLOAD_DIR || 'dados/uploads' };
}

// Uma conexão por operação: uploads e leituras são raros (o navegador guarda a imagem por 1 ano).
async function comFtp<T>(dir: string, fn: (c: import('basic-ftp').Client) => Promise<T>): Promise<T> {
  const { Client } = await import('basic-ftp');
  const c = new Client(20_000);
  try {
    await c.access({
      host: process.env.FTP_HOST, port: Number(process.env.FTP_PORT || 21), user: process.env.FTP_USUARIO, password: process.env.FTP_SENHA,
      secure: process.env.FTP_SEGURO !== 'false',
    });
    await c.ensureDir(dir);
    return await fn(c);
  } finally {
    c.close();
  }
}

// Lê uma imagem gravada em disco ou no FTP; null se não existir.
export async function lerImagem(nome: string, destino: Destino = destinoPadrao()): Promise<Buffer | null> {
  try {
    if (destino.tipo === 'disco') return await readFile(join(/*turbopackIgnore: true*/ destino.dir, nome));
    if (destino.tipo === 'ftp') return await comFtp(destino.dir, async c => {
      const partes: Buffer[] = [];
      const saida = new PassThrough().on('data', (b: Buffer) => partes.push(b));
      await c.downloadTo(saida, nome);
      return Buffer.concat(partes);
    });
  } catch { /* arquivo ausente ou FTP fora do ar */ }
  return null;
}

export async function salvarImagem(arquivo: { bytes: Uint8Array; tamanho: number }, destino: Destino = destinoPadrao()): Promise<ResultadoUpload> {
  if (arquivo.tamanho > MAX_BYTES) return { ok: false, erro: 'tamanho' };
  let formato: string | undefined;
  try { formato = (await sharp(arquivo.bytes).metadata()).format; } catch { return { ok: false, erro: 'tipo' }; }
  if (formato !== 'jpeg' && formato !== 'png' && formato !== 'webp') return { ok: false, erro: 'tipo' };
  const ext = EXT[formato];
  // rotate() aplica a orientação EXIF das fotos de celular antes de descartar os metadados
  const saida = await sharp(arquivo.bytes).rotate().resize({ width: LARGURA_MAX, withoutEnlargement: true }).toFormat(formato).toBuffer();
  const nome = `${randomUUID()}.${ext}`;
  if (destino.tipo === 'disco') {
    await mkdir(destino.dir, { recursive: true });
    await writeFile(join(/*turbopackIgnore: true*/ destino.dir, nome), saida);
    return { ok: true, caminho: '/uploads/' + nome };
  }
  if (destino.tipo === 'ftp') {
    await comFtp(destino.dir, c => c.uploadFrom(Readable.from(saida), nome));
    return { ok: true, caminho: '/uploads/' + nome };
  }
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = new S3Client({ region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: true,
    // sem as S3_*, o SDK cai nas AWS_* do ambiente
    credentials: process.env.S3_ACCESS_KEY_ID ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' } : undefined });
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: nome, Body: saida, ContentType: MIME[ext], CacheControl: 'public, max-age=31536000, immutable' }));
  return { ok: true, caminho: `${process.env.S3_URL_PUBLICA}/${nome}` };
}

export const tipoDoArquivo = (nome: string) => MIME[nome.split('.').pop() as keyof typeof MIME];
