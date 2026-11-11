'use client';
// Editor do corpo da notícia em blocos (o mesmo formato Bloco[] que o site renderiza).
// O resultado vai como JSON no campo oculto "corpo"; o servidor valida de novo.
import { useEffect, useRef, useState } from 'react';
import type { Bloco } from '@/lib/types';
import { enviarImagem } from '@/app/(admin)/admin/(painel)/paginas/imagem';

type Ed =
  | { tipo: 'p'; texto: string }
  | { tipo: 'lista'; itens: string }
  | { tipo: 'citacao'; texto: string }
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'imagem'; src: string; alt: string; legenda: string }
  | { tipo: 'tabela'; grupos: { categoria: string; itens: string }[] };

const NOMES = { p: 'Parágrafo', lista: 'Lista', citacao: 'Citação', subtitulo: 'Subtítulo', imagem: 'Imagem', tabela: 'Tabela por categoria' };
const DICA = 'Use **negrito** e [texto](endereço).';
const linhas = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);

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

export function EditorBlocos({ inicial, erro, desabilitado }: { inicial: Bloco[]; erro?: string; desabilitado?: boolean }) {
  const [blocos, setBlocos] = useState<Ed[]>(() => (inicial.length ? inicial.map(paraEditor) : [NOVO.p()]));
  const muda = (i: number, e: Ed) => setBlocos(bs => bs.map((b, k) => (k === i ? e : b)));
  const move = (i: number, d: -1 | 1) => setBlocos(bs => { const c = [...bs]; [c[i], c[i + d]] = [c[i + d], c[i]]; return c; });
  const tira = (i: number) => setBlocos(bs => bs.filter((_, k) => k !== i));
  // mudanças só de estrutura (incluir, mover, remover) não disparam input: avisa o form, para o AvisoSaida
  const [envio, setEnvio] = useState<{ i: number; erro: string } | null>(null);
  async function envia(i: number, b: Extract<Ed, { tipo: 'imagem' }>, arq: File | undefined) {
    if (!arq) return;
    const f = new FormData(); f.set('foto', arq);
    const r = await enviarImagem(f);
    if (r.src) { muda(i, { ...b, src: r.src }); setEnvio(null); } else setEnvio({ i, erro: r.erro ?? 'Não foi possível enviar a foto.' });
  }
  const campo = useRef<HTMLFieldSetElement>(null), montou = useRef(false);
  useEffect(() => { if (montou.current) campo.current?.dispatchEvent(new Event('change', { bubbles: true })); montou.current = true; }, [blocos]);
  return (
    <fieldset ref={campo} className="campo" data-erro={erro ? '' : undefined} disabled={desabilitado} aria-describedby={erro ? 'corpo-erro' : undefined}>
      <legend>Texto da notícia <span aria-hidden="true">*</span></legend>
      <input type="hidden" name="corpo" value={JSON.stringify(blocos.map(paraBloco))} />
      <div className="blocos">
        {blocos.map((b, i) => {
          const id = `bloco-${i}`;
          return (
            <div className="bloco" key={i}>
              <div className="topo"><span id={id}>{i + 1}. {NOMES[b.tipo]}</span>
                <span className="acoes">
                  <button type="button" className="bt sec peq" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir bloco ${i + 1}`}>↑</button>
                  <button type="button" className="bt sec peq" onClick={() => move(i, 1)} disabled={i === blocos.length - 1} aria-label={`Descer bloco ${i + 1}`}>↓</button>
                  <button type="button" className="bt perigo peq" onClick={() => tira(i)} aria-label={`Remover bloco ${i + 1}`}>Remover</button>
                </span>
              </div>
              {(b.tipo === 'p' || b.tipo === 'citacao') && <><textarea aria-labelledby={id} aria-describedby={id + '-f'} value={b.texto} onChange={e => muda(i, { ...b, texto: e.target.value })} /><span className="ajuda" id={id + '-f'}>{DICA}</span></>}
              {b.tipo === 'subtitulo' && <input type="text" aria-labelledby={id} value={b.texto} onChange={e => muda(i, { ...b, texto: e.target.value })} />}
              {b.tipo === 'imagem' && <>
                <label htmlFor={`${id}-f`}>Foto (JPG, PNG ou WebP, até 8 MB)</label>
                <input type="file" id={`${id}-f`} accept="image/jpeg,image/png,image/webp" onChange={e => envia(i, b, e.target.files?.[0])} />
                {b.src && <span className="ajuda">Foto enviada: {b.src}</span>}
                {envio?.i === i && <span className="erro-campo">{envio.erro}</span>}
                <label htmlFor={`${id}-a`}>Texto alternativo (descreva a foto)</label>
                <input type="text" id={`${id}-a`} value={b.alt} onChange={e => muda(i, { ...b, alt: e.target.value })} />
                <label htmlFor={`${id}-l`}>Legenda (opcional)</label>
                <input type="text" id={`${id}-l`} aria-describedby={id + '-d'} value={b.legenda} onChange={e => muda(i, { ...b, legenda: e.target.value })} />
                <span className="ajuda" id={id + '-d'}>{DICA}</span>
              </>}
              {b.tipo === 'lista' && <><textarea aria-labelledby={id} aria-describedby={id + '-a'} value={b.itens} onChange={e => muda(i, { ...b, itens: e.target.value })} /><span className="ajuda" id={id + '-a'}>Um item por linha. {DICA}</span></>}
              {b.tipo === 'tabela' && <>
                {b.grupos.map((g, k) => (
                  <div key={k} className="campo">
                    <label htmlFor={`${id}-c${k}`}>Categoria {k + 1}</label>
                    <input type="text" id={`${id}-c${k}`} value={g.categoria} onChange={e => muda(i, { ...b, grupos: b.grupos.map((x, j) => (j === k ? { ...x, categoria: e.target.value } : x)) })} />
                    <label htmlFor={`${id}-i${k}`}>Itens da categoria {k + 1} (um por linha)</label>
                    <textarea id={`${id}-i${k}`} value={g.itens} onChange={e => muda(i, { ...b, grupos: b.grupos.map((x, j) => (j === k ? { ...x, itens: e.target.value } : x)) })} />
                    {b.grupos.length > 1 && <button type="button" className="bt perigo peq" onClick={() => muda(i, { ...b, grupos: b.grupos.filter((_, j) => j !== k) })}>Remover categoria {k + 1}</button>}
                  </div>
                ))}
                <button type="button" className="bt sec peq" onClick={() => muda(i, { ...b, grupos: [...b.grupos, { categoria: '', itens: '' }] })}>Adicionar categoria</button>
              </>}
            </div>
          );
        })}
      </div>
      <div className="acoes" aria-label="Adicionar bloco">
        {(Object.keys(NOMES) as Ed['tipo'][]).map(t => <button key={t} type="button" className="bt sec peq" onClick={() => setBlocos(bs => [...bs, NOVO[t]()])}>+ {NOMES[t]}</button>)}
      </div>
      {erro && <span className="erro-campo" id="corpo-erro">{erro}</span>}
    </fieldset>
  );
}
