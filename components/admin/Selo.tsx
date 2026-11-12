import { Badge } from '@/components/ui/badge';

const VARIANTE = { rascunho: 'secondary', publicada: 'ok', revisao: 'aviso', devolvida: 'destructive', nova: 'marca' } as const;

// Situação de um item. A classe "selo" é usada pelos testes em testes/admin.py.
export function Selo({ s = 'rascunho', children }: { s?: keyof typeof VARIANTE; children: React.ReactNode }) {
  return <Badge variant={VARIANTE[s]} className="selo">{children}</Badge>;
}
