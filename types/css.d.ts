import 'react';

// Variáveis CSS (--i, --r...) usadas em style={{}} pelo site.css
declare module 'react' {
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
}
