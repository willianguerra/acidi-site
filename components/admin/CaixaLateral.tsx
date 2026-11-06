export function CaixaLateral({ titulo, children, className }: { titulo: string; children: React.ReactNode; className?: string }) {
  return <section className={className ? `caixa ${className}` : 'caixa'}><h2>{titulo}</h2>{children}</section>;
}
