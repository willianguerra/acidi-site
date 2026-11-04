import type { NextConfig } from 'next';
import { ROTAS, ROTAS_WP } from './lib/rotas';

const nextConfig: NextConfig = {
  // raiz explícita: existe um package-lock.json solto na pasta do usuário
  turbopack: { root: process.cwd() },
  // fotos do admin vão em Server Actions; o padrão de 1 MB barraria foto de celular (o limite real, 8 MB, é do lib/storage)
  experimental: { serverActions: { bodySizeLimit: '9mb' } },
  async redirects() {
    return [
      // cpanel./webmail./whm.acidi.net: o Apache reescreve para /___proxy_subdomain_<nome>, mas o app Node responde antes do proxy do cPanel.
      // Casa pelo caminho, não pelo host: o proxy do painel não repassa o Host original.
      ...[['cpanel', 2083], ['webmail', 2096], ['whm', 2087]].map(([sub, porta]) => ({
        source: `/___proxy_subdomain_${sub}/:caminho*`,
        destination: `https://cpanel09.unifique.cloud:${porta}/`, permanent: false,
      })),
      ...Object.entries(ROTAS).map(([arq, destination]) => ({ source: '/' + arq, destination, statusCode: 301 as const })),
      ...Object.entries(ROTAS_WP).map(([wp, destination]) => ({ source: '/' + wp, destination, statusCode: 301 as const })),
      { source: '/noticia-:slug.html', destination: "/noticias/:slug", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
