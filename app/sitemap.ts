import type { MetadataRoute } from 'next';
import { getNoticias } from '@/lib/content';
import { SITE } from '@/lib/meta';

const PAGINAS = ['', '/para-seu-negocio', '/associe-se', '/noticias', '/agenda', '/auditorio', '/contato', '/historico',
  '/diretoria', '/ex-presidentes', '/representatividade', '/nucleos'];

// Montado a cada pedido, como as páginas: o build não consulta o banco.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const noticias = await getNoticias();
  return [
    ...PAGINAS.map(p => ({ url: SITE + p })),
    ...noticias.map(n => ({ url: `${SITE}/noticias/${n.slug}`, lastModified: n.data })),
  ];
}
