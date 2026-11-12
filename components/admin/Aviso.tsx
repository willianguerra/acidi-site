import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

const ICONE = { ok: CircleCheck, erro: CircleAlert, info: Info };

export function Aviso({ tipo, children }: { tipo: 'ok' | 'erro' | 'info'; children: React.ReactNode }) {
  const Icone = ICONE[tipo];
  return (<Alert variant={tipo === 'erro' ? 'destructive' : tipo} role={tipo === 'erro' ? 'alert' : 'status'} className={`aviso ${tipo} mb-4`}>
    <Icone aria-hidden="true" /><p className="min-w-0">{children}</p>
  </Alert>);
}
