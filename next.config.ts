import type { NextConfig } from 'next';
import { ROTAS, ROTAS_WP } from './lib/rotas';

const nextConfig: NextConfig = {
  // raiz explícita: existe um package-lock.json solto na pasta do usuário
  turbopack: { root: process.cwd() },
  // fotos do admin vão em Server Actions; o padrão de 1 MB barraria foto de celular (o limite real, 8 MB, é do lib/storage)
  experimental: { serverActions: { bodySizeLimit: '9mb' } },
  async redirects() {
    return [
      // o app Node responde por todo o acidi.net, então os atalhos do cPanel (cpanel./webmail./whm.) caem aqui; manda para o servidor
      ...[['cpanel', 2083], ['webmail', 2096], ['whm', 2087]].map(([sub, porta]) => ({
        source: '/:caminho*', has: [{ type: 'host' as const, value: `${sub}.acidi.net` }],
        destination: `https://cpanel09.unifique.cloud:${porta}/`, permanent: false,
      })),
      ...Object.entries(ROTAS).map(([arq, destination]) => ({ source: '/' + arq, destination, statusCode: 301 as const })),
      ...Object.entries(ROTAS_WP).map(([wp, destination]) => ({ source: '/' + wp, destination, statusCode: 301 as const })),
      { source: '/noticia-:slug.html', destination: "/noticias/:slug", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
