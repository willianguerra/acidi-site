import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Barra do topo dos formulários: voltar, título, situação, estado real do registro e as ações (filhos).
export function BarraForm({ voltar, titulo, selo, estado, verNoSite, children }: {
  voltar: { href: string; rotulo: string }; titulo: string; selo?: React.ReactNode; estado?: string; verNoSite?: string; children: React.ReactNode;
}) {
  return (<div className="barra-form">
    <Button asChild variant="outline" size="icon"><a href={voltar.href} title={voltar.rotulo}><ArrowLeft aria-hidden="true" /><span className="sr-only">{voltar.rotulo}</span></a></Button>
    <div className="flex min-w-0 flex-[1_1_240px] flex-wrap items-center gap-x-3 gap-y-1">
      <h1 className="max-w-full truncate text-[1.375rem]!">{titulo}</h1>
      {selo}
      {estado && <span className="text-[0.8rem] text-muted-foreground">{estado}</span>}
      {verNoSite && <a className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-primary hover:underline" href={verNoSite} target="_blank" rel="noopener"><ExternalLink aria-hidden="true" className="size-3.5" />Ver no site<span className="sr-only"> (abre em nova aba)</span></a>}
    </div>
    <div className="flex flex-wrap items-start gap-2">{children}</div>
  </div>);
}
