import { partes } from '@/lib/formatado';
import { Ext } from './Ico';

export function Fmt({ t }: { t: string }) {
  return <>{partes(t).map((p, i) =>
    typeof p === 'string' ? p
    : 'b' in p ? <b key={i}>{p.b}</b>
    : /^https?:/.test(p.href) ? <Ext key={i} href={p.href} cls="tlink">{p.a}</Ext>
    : <a key={i} className="tlink" href={p.href}>{p.a}</a>)}</>;
}
