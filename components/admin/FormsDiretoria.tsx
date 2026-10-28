'use client';
import { useActionState } from 'react';
import { agirMembro, agirExPresidente } from '@/app/(admin)/admin/(painel)/diretoria/acoes';
import { Campo, Aviso } from './Campo';

const apagar = (msg: string) => (e: React.MouseEvent) => { if (!window.confirm(msg)) e.preventDefault(); };

export type DadosMembro = { id: string | null; grupo: string; rotulo: string; nome: string; suplente: boolean };

export function FormMembro({ m, grupos }: { m: DadosMembro; grupos: Record<string, string> }) {
  const [estado, acao, enviando] = useActionState(agirMembro, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} className="form">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={m.id ?? ''} />
      <div className="campo" data-erro={e.grupo ? '' : undefined}>
        <label htmlFor="grupo">Grupo</label>
        <select id="grupo" name="grupo" defaultValue={v.grupo ?? m.grupo} required>
          {Object.entries(grupos).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
        {e.grupo && <span className="erro-campo">{e.grupo}</span>}
      </div>
      <Campo nome="rotulo" rotulo="Cargo ou área" valor={v.rotulo ?? m.rotulo} erro={e.rotulo} ajuda="Usado na diretoria executiva (cargo) e nas vice-presidências (área). Nos conselhos, deixe em branco." />
      <Campo nome="nome" rotulo="Nome" valor={v.nome ?? m.nome} erro={e.nome} obrigatorio />
      <label><input type="checkbox" name="suplente" defaultChecked={m.suplente} /> Suplente (conselho fiscal)</label>
      <div className="acoes">
        <button className="bt" name="acao" value="salvar" disabled={enviando}>{m.id ? 'Salvar' : 'Adicionar'}</button>
        {m.id && <button className="bt perigo" name="acao" value="apagar" formNoValidate disabled={enviando} onClick={apagar(`Remover ${m.nome} da diretoria?`)}>Remover</button>}
      </div>
    </form>
  );
}

export type DadosPresidente = { id: string | null; nome: string; gestao: string; foto: string };

export function FormExPresidente({ p }: { p: DadosPresidente }) {
  const [estado, acao, enviando] = useActionState(agirExPresidente, undefined);
  const v = estado?.valores ?? {}, e = estado?.erros ?? {};
  return (
    <form action={acao} className="form">
      <Aviso estado={estado} />
      <input type="hidden" name="id" value={p.id ?? ''} />
      <input type="hidden" name="fotoAtual" value={p.foto} />
      <Campo nome="nome" rotulo="Nome" valor={v.nome ?? p.nome} erro={e.nome} obrigatorio />
      <Campo nome="gestao" rotulo="Gestão" valor={v.gestao ?? p.gestao} erro={e.gestao} ajuda="Ex.: Maio de 1989 a maio de 1991. Opcional." />
      <div className="campo" data-erro={e.foto ? '' : undefined}>
        <label htmlFor="foto">Retrato (opcional)</label>
        {p.foto && <img className="foto-atual" src={p.foto} alt="" />}
        <input type="file" id="foto" name="foto" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" />
        <span className="ajuda" id="foto-ajuda">JPG, PNG ou WebP, até 8 MB. Sem foto, o site mostra as iniciais.</span>
        {e.foto && <span className="erro-campo">{e.foto}</span>}
        {p.foto && <label><input type="checkbox" name="semFoto" /> Remover o retrato atual</label>}
      </div>
      <div className="acoes">
        <button className="bt" name="acao" value="salvar" disabled={enviando}>{p.id ? 'Salvar' : 'Adicionar'}</button>
        {p.id && <button className="bt perigo" name="acao" value="apagar" formNoValidate disabled={enviando} onClick={apagar(`Remover ${p.nome} da lista?`)}>Remover</button>}
      </div>
    </form>
  );
}
