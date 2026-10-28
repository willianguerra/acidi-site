// Upload de imagens do admin: confere o formato pelo conteúdo, reduz para 1600 px e grava em disco
// (UPLOAD_DIR, servido por app/uploads/[nome]) ou num bucket compatível com S3 (STORAGE=s3).
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const MAX_BYTES = 8 * 1024 * 1024;
export const LARGURA_MAX = 1600;
export const NOME_UPLOAD = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export type Destino = { tipo: 'disco'; dir: string } | { tipo: 's3' };
export type ResultadoUpload = { ok: true; caminho: string } | { ok: false; erro: 'tipo' | 'tamanho' };

const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp' } as const;
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;

export function destinoPadrao(): Destino {
  return process.env.STORAGE === 's3' ? { tipo: 's3' } : { tipo: 'disco', dir: process.env.UPLOAD_DIR || 'dados/uploads' };
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
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = new S3Client({ region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: true });
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: nome, Body: saida, ContentType: MIME[ext], CacheControl: 'public, max-age=31536000, immutable' }));
  return { ok: true, caminho: `${process.env.S3_URL_PUBLICA}/${nome}` };
}

export const tipoDoArquivo = (nome: string) => MIME[nome.split('.').pop() as keyof typeof MIME];
