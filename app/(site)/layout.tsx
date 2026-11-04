import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/meta';

export const metadata: Metadata = { metadataBase: new URL(SITE), icons: { icon: { url: '/assets/img/favicon.png', type: 'image/png' } } };
// Páginas montadas a cada visita: o build não depende do banco (o painel de hospedagem compila sem acesso a ele)
// e o que o admin publica aparece na hora.
export const dynamic = 'force-dynamic';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B3D24' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script abaixo adiciona a classe "js" antes da hidratação
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.className += ' js';" }} />
        <link rel="stylesheet" href="/assets/css/fonts.css" />
        <link rel="stylesheet" href="/assets/css/site.css" />
      </head>
      <body id="topo">
        <a className="skip" href="#conteudo">Pular para o conteúdo</a>
        {children}
        <Script src="/assets/js/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
