'use client';
// Editor do corpo da notícia em blocos (o mesmo formato Bloco[] que o site renderiza).
// O resultado vai como JSON no campo oculto "corpo"; o servidor valida de novo.
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Bold, Link2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Obrigatorio } from './Campo';
import type { Bloco } from '@/lib/types';
import { enviarImagem } from '@/app/(admin)/admin/(painel)/paginas/imagem';

type Ed =
  | { tipo: 'p'; texto: string }
  | { tipo: 'lista'; itens: string }
  | { tipo: 'citacao'; texto: string }
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'imagem'; src: string; alt: string; legenda: string }
  | { tipo: 'tabela'; grupos: { categoria: string; itens: string }[] };

type Item = Ed & { k: number };

const NOMES = { p: 'Parágrafo', lista: 'Lista', citacao: 'Citação', subtitulo: 'Subtítulo', imagem: 'Imagem', tabela: 'Tabela por categoria' };
const DICA = 'Use **negrito** e [texto](endereço).';
const linhas = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);
const FERRAMENTA = 'grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground [&_svg]:size-4';

// Envolve o trecho selecionado com a marcação que o site entende (**negrito** e [texto](endereço)) e devolve o novo texto.
function marcar(id: string, tipo: 'b' | 'a', grava: (v: string) => void) {
  const t = document.getElementById(id) as HTMLTextAreaElement | null;
  if (!t) return;
  const { selectionStart: a, selectionEnd: b, value } = t;
  const sel = value.slice(a, b) || (tipo === 'b' ? 'texto em negrito' : 'texto do link');
  const novo = tipo === 'b' ? `**${sel}**` : `[${sel}](https://)`;
  grava(value.slice(0, a) + novo + value.slice(b));
  // depois que o React regravar o campo: no negrito seleciona o trecho; no link, o endereço a preencher
  const [i, f] = tipo === 'b' ? [a + 2, a + 2 + sel.length] : [a + sel.length + 3, a + sel.length + 11];
  requestAnimationFrame(() => { t.focus(); t.setSelectionRange(i, f); });
}

function paraEditor(b: Bloco): Ed {
  if (typeof b === 'string') return { tipo: 'p', texto: b };
  if ('lista' in b) return { tipo: 'lista', itens: b.lista.join('\n') };
  if ('citacao' in b) return { tipo: 'citacao', texto: b.citacao };
  if ('subtitulo' in b) return { tipo: 'subtitulo', texto: b.subtitulo };
  if ('imagem' in b) return { tipo: 'imagem', ...b.imagem };
  return { tipo: 'tabela', grupos: b.tabela.map(t => ({ categoria: t.categoria, itens: t.itens.join('\n') })) };
}

function paraBloco(e: Ed): Bloco {
  if (e.tipo === 'p') return e.texto;
  if (e.tipo === 'lista') return { lista: linhas(e.itens) };
  if (e.tipo === 'citacao') return { citacao: e.texto };
  if (e.tipo === 'subtitulo') return { subtitulo: e.texto };
  if (e.tipo === 'imagem') return { imagem: { src: e.src, alt: e.alt, legenda: e.legenda } };
  return { tabela: e.grupos.map(g => ({ categoria: g.categoria, itens: linhas(g.itens) })) };
}

const NOVO: Record<Ed['tipo'], () => Ed> = {
  p: () => ({ tipo: 'p', texto: '' }),
  lista: () => ({ tipo: 'lista', itens: '' }),
  citacao: () => ({ tipo: 'citacao', texto: '' }),
  subtitulo: () => ({ tipo: 'subtitulo', texto: '' }),
  imagem: () => ({ tipo: 'imagem', src: '', alt: '', legenda: '' }),
  tabela: () => ({ tipo: 'tabela', grupos: [{ categoria: '', itens: '' }] }),
};

export function EditorBlocos({ inicial, erro, desabilitado, titulo = 'Texto da notícia', obrigatorio = true }: { inicial: Bloco[]; erro?: string; desabilitado?: boolean; titulo?: string; obrigatorio?: boolean }) {
  // texto opcional (páginas) começa sem blocos: um parágrafo vazio seria recusado pelo validador
  // k: chave estável; com o índice como chave, mover um bloco deixava o arquivo escolhido no bloco errado
  const [blocos, setBlocos] = useState<Item[]>(() => (inicial.length || !obrigatorio ? inicial.map(paraEditor) : [NOVO.p()]).map((b, k) => ({ ...b, k })));
  const prox = useRef(blocos.length);
  const muda = (i: number, e: Item) => setBlocos(bs => bs.map((b, k) => (k === i ? e : b)));
  const move = (i: number, d: -1 | 1) => setBlocos(bs => { const c = [...bs]; [c[i], c[i + d]] = [c[i + d], c[i]]; return c; });
  const tira = (i: number) => setBlocos(bs => bs.filter((_, k) => k !== i));
  // mudanças só de estrutura (incluir, mover, remover) não disparam input: avisa o form, para o AvisoSaida
  const [envio, setEnvio] = useState<{ k: number; erro?: string } | null>(null);
  async function envia(k: number, arq: File | undefined) {
    if (!arq) return;
    setEnvio({ k });
    const f = new FormData(); f.set('foto', arq);
    const r = await enviarImagem(f).catch(() => ({ src: undefined, erro: undefined }));
    // acha o bloco pela chave: ele pode ter sido movido, editado ou removido durante o envio
    if (r.src) { setBlocos(bs => bs.map(x => (x.k === k && x.tipo === 'imagem' ? { ...x, src: r.src! } : x))); setEnvio(null); }
    else setEnvio({ k, erro: r.erro ?? 'Não foi possível enviar a foto. Tente de novo.' });
  }
  const campo = useRef<HTMLFieldSetElement>(null), montou = useRef(false);
  useEffect(() => { if (montou.current) campo.current?.dispatchEvent(new Event('change', { bubbles: true })); montou.current = true; }, [blocos]);
  return (
    <fieldset ref={campo} className="grid min-w-0 gap-3" data-erro={erro ? '' : undefined} disabled={desabilitado} aria-describedby={erro ? 'corpo-erro' : undefined}>
      <legend className="float-left mb-1 w-full font-display text-[1.0625rem] font-bold">{titulo}{obrigatorio && <Obrigatorio />}</legend>
      <input type="hidden" name="corpo" value={JSON.stringify(blocos.map(paraBloco))} />
      {!blocos.length && <p className="vazio">Ainda não há conteúdo. Use “Inserir” para começar por um parágrafo, uma imagem ou outro bloco.</p>}
      <div className="grid gap-3 empty:hidden">
        {blocos.map((b, i) => {
          const id = `bloco-${i}`;
          const texto = b.tipo === 'p' || b.tipo === 'citacao' || b.tipo === 'lista';
          const grava = (v: string) => muda(i, b.tipo === 'lista' ? { ...b, itens: v } : { ...b, texto: v } as Item);
          return (
            <div className="bloco grid min-w-0 overflow-hidden rounded-lg border bg-card focus-within:border-ring/60" key={b.k}>
              <div className="flex flex-wrap items-center gap-1 border-b bg-secondary py-1 pr-1.5 pl-3">
                <span id={id} className="mr-auto text-[0.8rem] font-semibold text-muted-foreground"><span className="tabular-nums">{i + 1}</span> · {NOMES[b.tipo]}</span>
                {texto && <>
                  <button type="button" className={FERRAMENTA} onClick={() => marcar(id + '-t', 'b', grava)} aria-label={`Negrito no bloco ${i + 1}`} title="Negrito"><Bold aria-hidden="true" /></button>
                  <button type="button" className={FERRAMENTA} onClick={() => marcar(id + '-t', 'a', grava)} aria-label={`Link no bloco ${i + 1}`} title="Link"><Link2 aria-hidden="true" /></button>
                  <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
                </>}
                <button type="button" className={FERRAMENTA + ' disabled:pointer-events-none disabled:opacity-40'} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir bloco ${i + 1}`} title="Subir"><ArrowUp aria-hidden="true" /></button>
                <button type="button" className={FERRAMENTA + ' disabled:pointer-events-none disabled:opacity-40'} onClick={() => move(i, 1)} disabled={i === blocos.length - 1} aria-label={`Descer bloco ${i + 1}`} title="Descer"><ArrowDown aria-hidden="true" /></button>
                <button type="button" className={FERRAMENTA + ' hover:bg-erro-soft! hover:text-destructive!'} onClick={() => tira(i)} aria-label={`Remover bloco ${i + 1}`} title="Remover bloco"><Trash2 aria-hidden="true" /></button>
              </div>
              <div className="grid min-w-0 gap-2 p-3">
              {(b.tipo === 'p' || b.tipo === 'citacao') && <><Textarea id={id + '-t'} aria-labelledby={id} aria-describedby={id + '-f'} className={b.tipo === 'p' ? 'min-h-36' : undefined} value={b.texto} onChange={e => muda(i, { ...b, texto: e.target.value })} /><span className="ajuda" id={id + '-f'}>{DICA}</span></>}
              {b.tipo === 'subtitulo' && <Input type="text" aria-labelledby={id} value={b.texto} onChange={e => muda(i, { ...b, texto: e.target.value })} />}
              {b.tipo === 'imagem' && <>
                <Label htmlFor={`${id}-f`}>Foto (JPG, PNG ou WebP, até 8 MB)</Label>
                <Input type="file" id={`${id}-f`} accept="image/jpeg,image/png,image/webp" onChange={e => envia(b.k, e.target.files?.[0])} />
                {b.src && <img className="foto-atual" src={b.src} alt="" />}
                <span aria-live="polite">{envio?.k === b.k && (envio.erro ? <span className="erro-campo">{envio.erro}</span> : <span className="ajuda">Enviando a foto…</span>)}</span>
                <Label htmlFor={`${id}-a`}>Texto alternativo (descreva a foto)</Label>
                <Input type="text" id={`${id}-a`} value={b.alt} onChange={e => muda(i, { ...b, alt: e.target.value })} />
                <Label htmlFor={`${id}-l`}>Legenda (opcional)</Label>
                <Input type="text" id={`${id}-l`} aria-describedby={id + '-d'} value={b.legenda} onChange={e => muda(i, { ...b, legenda: e.target.value })} />
                <span className="ajuda" id={id + '-d'}>{DICA}</span>
              </>}
              {b.tipo === 'lista' && <><Textarea id={id + '-t'} aria-labelledby={id} aria-describedby={id + '-a'} value={b.itens} onChange={e => muda(i, { ...b, itens: e.target.value })} /><span className="ajuda" id={id + '-a'}>Um item por linha. {DICA}</span></>}
              {b.tipo === 'tabela' && <>
                {b.grupos.map((g, k) => (
                  <div key={k} className="campo border-t border-dashed border-input pt-3 first:border-0 first:pt-0">
                    <Label htmlFor={`${id}-c${k}`}>Categoria {k + 1}</Label>
                    <Input type="text" id={`${id}-c${k}`} value={g.categoria} onChange={e => muda(i, { ...b, grupos: b.grupos.map((x, j) => (j === k ? { ...x, categoria: e.target.value } : x)) })} />
                    <Label htmlFor={`${id}-i${k}`}>Itens da categoria {k + 1} (um por linha)</Label>
                    <Textarea id={`${id}-i${k}`} value={g.itens} onChange={e => muda(i, { ...b, grupos: b.grupos.map((x, j) => (j === k ? { ...x, itens: e.target.value } : x)) })} />
                    {b.grupos.length > 1 && <Button type="button" variant="destructive" size="sm" className="justify-self-start" onClick={() => muda(i, { ...b, grupos: b.grupos.filter((_, j) => j !== k) })}>Remover categoria {k + 1}</Button>}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => muda(i, { ...b, grupos: [...b.grupos, { categoria: '', itens: '' }] })}><Plus aria-hidden="true" />Adicionar categoria</Button>
              </>}
              </div>
            </div>
          );
        })}
      </div>
      {/* um menu no lugar de seis botões: todos os tipos de bloco continuam aqui */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button type="button" variant="outline" className="justify-self-start border-primary/40 text-accent-foreground"><Plus aria-hidden="true" />Inserir</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="start" aria-label="Inserir bloco">
          {(Object.keys(NOMES) as Ed['tipo'][]).map(t => <DropdownMenuItem key={t} onSelect={() => setBlocos(bs => [...bs, { ...NOVO[t](), k: prox.current++ }])}>{NOMES[t]}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      {erro && <span className="erro-campo" id="corpo-erro">{erro}</span>}
    </fieldset>
  );
}
