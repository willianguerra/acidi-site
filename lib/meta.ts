import type { Metadata } from 'next';

export const SUF = ' · ACIDI Indaial';
// Endereço público do site: base de canonical, Open Graph e sitemap.
export const SITE = process.env.SITE_URL ?? 'https://www.acidi.net';
export const IMG_PADRAO = '/assets/img/sede.jpg';

// Metadados de uma página do site: título, descrição, canonical e cartão de compartilhamento.
export function pagina(caminho: string, titulo: string, descricao: string, extra: { imagem?: string; tipo?: 'website' | 'article'; publicado?: string } = {}): Metadata {
  return {
    title: caminho === '/' ? titulo : titulo + SUF,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      title: titulo, description: descricao, url: caminho, siteName: 'ACIDI – Associação Empresarial de Indaial', locale: 'pt_BR',
      type: extra.tipo ?? 'website', images: [extra.imagem ?? IMG_PADRAO],
      ...(extra.publicado && { publishedTime: extra.publicado }),
    },
    twitter: { card: 'summary_large_image' },
  };
}

// Dados estruturados (schema.org) da associação, usados na home e como editora das notícias.
export const ORGANIZACAO = {
  '@type': 'Organization',
  '@id': SITE + '/#organizacao',
  name: 'ACIDI – Associação Empresarial de Indaial',
  alternateName: 'ACIDI',
  url: SITE,
  logo: SITE + '/assets/img/logo.png',
  foundingDate: '1989-05-22',
  email: 'contato@acidi.net',
  telephone: '+55-47-3333-8786',
  address: { '@type': 'PostalAddress', streetAddress: 'Rua Ver. Alvin Rauh Júnior, 100', addressLocality: 'Indaial', addressRegion: 'SC', postalCode: '89082-065', addressCountry: 'BR' },
  sameAs: ['https://www.instagram.com/acidi.indaial/', 'https://www.facebook.com/acidinoticias'],
};

// <script type="application/ld+json">; o replace impede que um "</script>" no conteúdo feche a tag.
export const jsonLd = (dados: object) => ({ __html: JSON.stringify({ '@context': 'https://schema.org', ...dados }).replace(/</g, '\\u003c') });
