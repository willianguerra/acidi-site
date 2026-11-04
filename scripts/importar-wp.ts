// Importa as notícias do WordPress antigo (www.acidi.net) que ainda não estão no banco, com o mesmo slug,
// para os redirects de lib/rotas.ts levarem à mesma matéria. Rodar de novo não duplica nem mexe no que existe.
// As notícias já migradas com outro slug (ROTAS_WP aponta para outro /noticias/...) ficam de fora.
// Uso: node --env-file=.env scripts/importar-wp.ts   (STORAGE/S3 do .env decide onde as fotos vão)
import { eq } from 'drizzle-orm';
import type { Db } from '../lib/db/index.ts';
import { noticias } from '../lib/db/schema.ts';
import { ROTAS_WP } from '../lib/rotas.ts';
import { salvarImagem } from '../lib/storage.ts';
import { blocosDe, resumoDe, textoDe } from '../lib/wp.ts';

const API = 'https://www.acidi.net/wp-json/wp/v2/posts?per_page=100&_embed=wp:featuredmedia';
const IMG_PADRAO = '/assets/img/sede.jpg';

type PostWp = {
  slug: string; date: string; date_gmt: string; title: { rendered: string }; content: { rendered: string }; excerpt: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[] };
};

async function foto(p: PostWp, titulo: string): Promise<{ imagem: string; alt: string }> {
  const m = p._embedded?.['wp:featuredmedia']?.[0];
  if (!m?.source_url) return { imagem: IMG_PADRAO, alt: 'Sede da ACIDI em Indaial' };
  const r = await fetch(m.source_url);
  if (!r.ok) throw new Error(`foto ${p.slug}: ${r.status}`);
  const bytes = new Uint8Array(await r.arrayBuffer());
  const s = await salvarImagem({ bytes, tamanho: bytes.length });
  if (!s.ok) { console.warn(`foto de ${p.slug} recusada (${s.erro}); usando a padrão`); return { imagem: IMG_PADRAO, alt: 'Sede da ACIDI em Indaial' }; }
  return { imagem: s.caminho, alt: textoDe(m.alt_text ?? '') || titulo };
}

export async function importar(db: Db, posts: PostWp[]): Promise<string[]> {
  const feitas: string[] = [];
  for (const p of posts) {
    const destino = ROTAS_WP[p.slug];
    if (destino !== '/noticias' && destino !== '/noticias/' + p.slug) continue;
    const [existe] = await db.select({ id: noticias.id }).from(noticias).where(eq(noticias.slug, p.slug));
    if (existe) continue;
    const corpo = blocosDe(p.content.rendered);
    if (!corpo.length) { console.warn(`${p.slug}: sem texto, pulando`); continue; }
    const titulo = textoDe(p.title.rendered);
    const primeiro = corpo.find(b => typeof b === 'string') as string | undefined;
    await db.insert(noticias).values({
      slug: p.slug, data: p.date.slice(0, 10), titulo, resumo: resumoDe(primeiro ?? textoDe(p.excerpt.rendered)), corpo,
      ...(await foto(p, titulo)), situacao: 'publicada', publicadaEm: new Date(p.date_gmt + 'Z'),
    });
    feitas.push(p.slug);
  }
  return feitas;
}

if (import.meta.main) {
  const { db } = await import('../lib/db/index.ts');
  const r = await fetch(API, { headers: { 'User-Agent': 'Mozilla/5.0 (importacao ACIDI)' } });
  if (!r.ok) throw new Error(`WordPress respondeu ${r.status}`);
  const feitas = await importar(db, await r.json());
  console.log(`${feitas.length} notícias importadas:\n` + feitas.join('\n'));
  await db.$client.end();
}
