import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = { icons: { icon: { url: '/assets/img/favicon.png', type: 'image/png' } } };
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
