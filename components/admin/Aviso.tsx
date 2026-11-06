export function Aviso({ tipo, children }: { tipo: 'ok' | 'erro' | 'info'; children: React.ReactNode }) {
  return <p className={tipo === 'erro' ? 'aviso' : `aviso ${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</p>;
}
