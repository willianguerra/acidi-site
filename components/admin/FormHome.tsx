'use client';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { salvarHome } from '@/app/(admin)/admin/(painel)/paginas/acoes';
import type { ConteudoHome } from '@/lib/types';
import { Campo, Aviso } from './Campo';
import { Card, CardTitle } from '@/components/ui/card';
import { AvisoSaida } from './AvisoSaida';

// [nome do campo "secao.campo", rótulo, true = texto longo]
type Def = [string, string, boolean?];
const SECAO = (c: string): Def[] => [[`${c}.titulo`, 'Título'], [`${c}.negrito`, 'Trecho em negrito'], [`${c}.chamada`, 'Chamada', true]];
const SECOES: { titulo: string; campos: Def[] }[] = [
  { titulo: 'Destaque (topo)', campos: [['destaque.etiqueta', 'Etiqueta'], ['destaque.linha1', 'Título, linha 1'], ['destaque.linha2', 'Título, linha 2'], ['destaque.linha3', 'Título, linha 3'], ['destaque.chamada', 'Chamada', true], ['destaque.desde', 'Texto "desde"']] },
  { titulo: 'Quem somos', campos: [['quemSomos.etiqueta', 'Etiqueta'], ['quemSomos.titulo', 'Título'], ['quemSomos.negrito', 'Trecho em negrito'], ['quemSomos.chamada', 'Chamada', true],
    ...[1, 2, 3].flatMap((n): Def[] => [[`quemSomos.pilar${n}.titulo`, `Pilar ${n}: título`], [`quemSomos.pilar${n}.texto`, `Pilar ${n}: texto`, true]])] },
  { titulo: 'Serviços', campos: SECAO('servicos') },
  { titulo: 'Notícias', campos: SECAO('noticias') },
  { titulo: 'Representatividade', campos: [...SECAO('representatividade'), ['representatividade.sub', 'Subtítulo', true]] },
  { titulo: 'Auditório', campos: SECAO('auditorio') },
  { titulo: 'Associe-se', campos: SECAO('associe') },
];

// valor atual de "secao.campo" (os pilares ficam numa lista: quemSomos.pilar1.titulo -> pilares[0].titulo)
function valorDe(c: ConteudoHome, nome: string): string {
  const [s, a, b] = nome.split('.');
  const sec = c[s as keyof ConteudoHome] as Record<string, unknown>;
  if (b) return String((sec.pilares as Record<string, string>[])[Number(a.slice(5)) - 1][b] ?? '');
  return String(sec[a] ?? '');
}

export function FormHome({ c, id, lidaEm }: { c: ConteudoHome; id: string; lidaEm: string }) {
  const [estado, acao, enviando] = useActionState(salvarHome, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} id="form-home" className="grid max-w-[1400px] gap-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="lidaEm" value={lidaEm} />
      <AvisoSaida formId="form-home" estado={estado} />
      <Aviso estado={estado} />
      {SECOES.map(s => (
        <Card key={s.titulo}><CardTitle>{s.titulo}</CardTitle>
          <fieldset disabled={enviando} className="grid min-w-0 gap-x-4 gap-y-3.5 md:grid-cols-2 xl:grid-cols-3 [&>.campo:has(textarea)]:col-span-full [&_textarea]:min-h-20">
            {s.campos.map(([nome, rotulo, longo]) => <Campo key={nome} nome={nome} rotulo={rotulo} tipo={longo ? 'textarea' : 'text'} valor={v[nome] ?? valorDe(c, nome)} erro={e[nome]} obrigatorio />)}
          </fieldset>
        </Card>
      ))}
      <div className="sticky bottom-0 z-5 flex flex-wrap items-center gap-3 rounded-t-lg border bg-card px-4 py-3 shadow-[0_-8px_24px_-16px_rgb(11_61_36/.35)]"><Button disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar e publicar'}</Button><span className="ajuda md:ml-auto">Vale para o site assim que salvar.</span></div>
    </form>
  );
}
